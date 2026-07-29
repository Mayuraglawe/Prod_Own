import { queueNames } from './names';
import { createQueue } from './connection';

/**
 * Creates and returns the queue instance dedicated to fingerprint processing.
 */
export function createFingerprintQueue() {
  return createQueue(queueNames.fingerprints);
}

/**
 * Creates and returns the queue instance dedicated to alert dispatching.
 */
export function createAlertQueue() {
  return createQueue(queueNames.alerts);
}

/**
 * Creates and returns the queue instance dedicated to billing hooks processing.
 */
export function createBillingQueue() {
  return createQueue(queueNames.billing);
}

