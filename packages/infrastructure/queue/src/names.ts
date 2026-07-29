/**
 * Static registry of BullMQ queue names used across the platform.
 */
export const queueNames = {
  /** Queue for processing, scrubbing, and fingerprinting raw ingested error payloads */
  fingerprints: 'fingerprints',
  /** Queue for dispatching alert webhooks/notifications to Slack */
  alerts: 'alerts',
  /** Queue for processing billing ledger events from Razorpay */
  billing: 'billing'
} as const;

