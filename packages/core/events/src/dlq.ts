import { BaseEvent } from './events.js';

export interface DeadLetterEntry<T = unknown> {
  id: string;
  originalEvent: BaseEvent<T>;
  errorReason: string;
  stackTrace?: string;
  failedAt: string;
  totalRetries: number;
}

export interface DLQStorageProvider {
  storeDeadLetter(entry: DeadLetterEntry): Promise<void>;
  listDeadLetters(limit?: number): Promise<DeadLetterEntry[]>;
  purgeDeadLetter(id: string): Promise<boolean>;
}

export class InMemoryDLQStorage implements DLQStorageProvider {
  private entries: Map<string, DeadLetterEntry> = new Map();

  public async storeDeadLetter(entry: DeadLetterEntry): Promise<void> {
    this.entries.set(entry.id, entry);
  }

  public async listDeadLetters(limit = 100): Promise<DeadLetterEntry[]> {
    return Array.from(this.entries.values()).slice(0, limit);
  }

  public async purgeDeadLetter(id: string): Promise<boolean> {
    return this.entries.delete(id);
  }
}

export class DeadLetterQueueManager {
  constructor(private readonly storage: DLQStorageProvider = new InMemoryDLQStorage()) {}

  public async pushToDLQ<T>(event: BaseEvent<T>, error: Error, totalRetries: number): Promise<DeadLetterEntry<T>> {
    const entry: DeadLetterEntry<T> = {
      id: `dlq_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      originalEvent: event,
      errorReason: error.message,
      stackTrace: error.stack,
      failedAt: new Date().toISOString(),
      totalRetries,
    };
    await this.storage.storeDeadLetter(entry);
    return entry;
  }

  public async getDeadLetters(): Promise<DeadLetterEntry[]> {
    return this.storage.listDeadLetters();
  }
}
