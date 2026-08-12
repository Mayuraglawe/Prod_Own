import { z } from 'zod';

export const IngestionPayloadSchema = z.object({
  tenantId: z.string().uuid("tenantId must be a valid UUID"),
  projectId: z.string().uuid("projectId must be a valid UUID"),
  rawBody: z.string().min(1, "Payload Body Cannot Be Empty"),
  headers: z.record(z.string(), z.string().optional())
    .refine(
      (headers) => !!headers['x-sdk-name'],
      { message: "Missing required header: x-sdk-name" }
    )
    .refine(
      (headers) => !!headers['x-sdk-version'],
      { message: "Missing required header: x-sdk-version" }
    )
});

export type IngestionPayload = z.infer<typeof IngestionPayloadSchema>;
