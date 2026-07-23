import { z } from 'zod';

/**
 * Zod schema for the raw ingest HTTP request body.
 * Accepts both `content` (preferred, new SDK) and `error` (legacy field name).
 * All payloads must have a sourceId and a non-empty error/content string.
 */
export const rawIngestBodySchema = z.object({
  sourceId: z.string().min(1, 'sourceId is required'),
  /** Preferred field name for the error payload content */
  content: z.string().optional(),
  /** Legacy field name — accepted for backwards compatibility with older SDK versions */
  error: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  environment: z.string().optional(),
  release: z.string().optional(),
}).refine(
  (data) => Boolean(data.content ?? data.error),
  { message: 'Either content or error must be provided' }
);

export type RawIngestBody = z.infer<typeof rawIngestBodySchema>;

/**
 * Zod schema for the internal ingest payload stored in the Redis stream.
 * By the time data reaches the stream it must have both tenantId and sourceId resolved,
 * and the content field is normalised (no more legacy `error` alias).
 */
export const ingestPayloadSchema = z.object({
  tenantId: z.string().min(1),
  sourceId: z.string().min(1),
  content: z.string().min(1),
  metadata: z.record(z.unknown()).optional(),
  environment: z.string().optional(),
  release: z.string().optional(),
});

export type IngestPayload = z.infer<typeof ingestPayloadSchema>;

/**
 * Validates and normalises a raw ingest HTTP request body.
 * Throws a ZodError if validation fails.
 */
export function validateRawIngestBody(data: unknown): RawIngestBody {
  return rawIngestBodySchema.parse(data);
}

/**
 * Validates an internal ingest payload (pre-stream).
 * Throws a ZodError if validation fails.
 */
export function validateIngestPayload(data: unknown): IngestPayload {
  return ingestPayloadSchema.parse(data);
}
