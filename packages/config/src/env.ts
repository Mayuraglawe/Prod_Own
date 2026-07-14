import { z } from 'zod';
import path from 'path';
import fs from 'fs';

// Native env loading resolution logic for Node 20.6+ / 22+.
// Traverses upwards from current execution working directory to search for root .env.
const envPaths = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), '../../.env'),
  path.resolve(process.cwd(), '../../../.env'),
];

// Load the first existing .env file discovered in directory path tree
for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    process.loadEnvFile(envPath);
    break;
  }
}

/**
 * Zod schema defining the environment configuration parameters.
 * Validates and casts environment variables to their appropriate types.
 */
const envSchema = z.object({
  /** PostgreSQL connection URI (e.g. postgresql://user:pass@host:port/db) */
  DATABASE_URL: z.string().url().or(z.string().startsWith('postgresql://')),
  /** Redis connection URI used by BullMQ (e.g. redis://host:6379) */
  REDIS_URL: z.string().url().or(z.string().startsWith('redis://')),
  /** The application frontend base URL for CORS protection policy */
  APP_URL: z.string().url(),
  /** HTTP header name carrying the tenant identifier string */
  TENANT_HEADER: z.string().default('x-tenant-id'),
  /** Incoming alert notification destination Slack Webhook URL */
  SLACK_WEBHOOK_URL: z.string().optional().default(''),
  /** Incoming alert notification destination n8n webhook URL */
  N8N_ALERT_WEBHOOK_URL: z.string().optional().default(''),
  /** Razorpay payment API Key ID */
  RAZORPAY_KEY_ID: z.string().optional().default(''),
  /** Razorpay payment API Key Secret */
  RAZORPAY_KEY_SECRET: z.string().optional().default(''),
  /** OpenTelemetry monitored Service Name */
  OTEL_SERVICE_NAME: z.string().default('prod-own'),
  /** OpenTelemetry OTLP trace HTTP collector URL endpoint */
  OTEL_EXPORTER_OTLP_ENDPOINT: z.string().optional().default('')
});

/**
 * Strict parser validating current process.env configuration.
 * Will throw ZodError immediately on startup if any required key is missing or invalid.
 */
export const env = envSchema.parse(process.env);

