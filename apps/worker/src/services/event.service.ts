import { prisma } from '@prod-own/db';
import type { Event } from '@prod-own/db';

export type RawEventPayload = {
  tenantId: string;
  sourceId: string;
  content: string;
  metadata?: any;
};

export class EventService {
  /**
   * Persists a raw error payload to the database as an Event.
   */
  async createRawEvent(payload: RawEventPayload): Promise<Event> {
    const event = await prisma.event.create({
      data: {
        tenantId: payload.tenantId,
        sourceId: payload.sourceId,
        content: payload.content,
        metadata: payload.metadata || {},
      },
    });

    return event;
  }
}

export const eventService = new EventService();
