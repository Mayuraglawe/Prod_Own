import { z } from 'zod';
import path from 'path';
import fs from 'fs';

// Load .env variables natively in Node 20.6+ / 22+
const envPaths = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), '../../.env'),
  path.resolve(process.cwd(), '../../../.env'),
];

for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    process.loadEnvFile(envPath);
    break;
  }
}


const envSchema = z.object({
  DATABASE_URL: z.string().url().or(z.string().startsWith('postgresql://')),
  REDIS_URL: z.string().url().or(z.string().startsWith('redis://')),
  APP_URL: z.string().url(),
  TENANT_HEADER: z.string().default('x-tenant-id'),
  SLACK_WEBHOOK_URL: z.string().optional().default(''),
  N8N_ALERT_WEBHOOK_URL: z.string().optional().default(''),
  RAZORPAY_KEY_ID: z.string().optional().default(''),
  RAZORPAY_KEY_SECRET: z.string().optional().default(''),
  OTEL_SERVICE_NAME: z.string().default('prod-own'),
  OTEL_EXPORTER_OTLP_ENDPOINT: z.string().optional().default('')
});

export const env = envSchema.parse(process.env);
