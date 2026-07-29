import { BaseEvent, EventTopic, EventPayloadMap } from './events.js';
import { CircuitBreaker } from './circuit-breaker.js';
import { DeadLetterQueueManager } from './dlq.js';

export type EventHandler<T = unknown> = (event: BaseEvent<T>) => Promise<void>;

export interface EventBusOptions {
  maxRetries?: number;
  initialBackoffMs?: number;
  enableCircuitBreaker?: boolean;
}

export interface IEventBus {
  publish<K extends EventTopic>(topic: K, payload: EventPayloadMap[K], metadata: { tenantId: string; projectId: string }): Promise<BaseEvent<EventPayloadMap[K]>>;
  subscribe<K extends EventTopic>(topic: K, handler: EventHandler<EventPayloadMap[K]>): void;
}

export class InMemoryEventBus implements IEventBus {
  private handlers = new Map<EventTopic, Array<EventHandler<unknown>>>();
  private circuitBreakers = new Map<EventTopic, CircuitBreaker>();
  private dlqManager = new DeadLetterQueueManager();
  private maxRetries: number;
  private initialBackoffMs: number;

  constructor(options: EventBusOptions = {}) {
    this.maxRetries = options.maxRetries ?? 3;
    this.initialBackoffMs = options.initialBackoffMs ?? 100;
  }

  public subscribe<K extends EventTopic>(topic: K, handler: EventHandler<EventPayloadMap[K]>): void {
    const list = this.handlers.get(topic) || [];
    list.push(handler as EventHandler<unknown>);
    this.handlers.set(topic, list);

    if (!this.circuitBreakers.has(topic)) {
      this.circuitBreakers.set(topic, new CircuitBreaker());
    }
  }

  public async publish<K extends EventTopic>(
    topic: K,
    payload: EventPayloadMap[K],
    metadata: { tenantId: string; projectId: string }
  ): Promise<BaseEvent<EventPayloadMap[K]>> {
    const event: BaseEvent<EventPayloadMap[K]> = {
      eventId: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      topic,
      timestamp: new Date().toISOString(),
      tenantId: metadata.tenantId,
      projectId: metadata.projectId,
      payload,
    };

    const subscribers = this.handlers.get(topic) || [];
    const cb = this.circuitBreakers.get(topic) || new CircuitBreaker();

    for (const handler of subscribers) {
      this.dispatchWithRetries(event, handler, cb).catch((err) => {
        console.error(`[EventBus] Unhandled background error processing event ${event.eventId}:`, err);
      });
    }

    return event;
  }

  private async dispatchWithRetries<T>(
    event: BaseEvent<T>,
    handler: EventHandler<T>,
    circuitBreaker: CircuitBreaker
  ): Promise<void> {
    let attempt = 0;
    while (attempt <= this.maxRetries) {
      try {
        await circuitBreaker.execute(() => handler(event));
        return;
      } catch (err: unknown) {
        attempt += 1;
        if (attempt > this.maxRetries) {
          await this.dlqManager.pushToDLQ(event, err instanceof Error ? err : new Error(String(err)), attempt - 1);
          return;
        }
        const backoffMs = this.initialBackoffMs * Math.pow(2, attempt - 1);
        await new Promise((res) => setTimeout(res, backoffMs));
      }
    }
  }

  public getDLQManager(): DeadLetterQueueManager {
    return this.dlqManager;
  }
}
