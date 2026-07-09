import { queueNames } from './names';
import { createQueue } from './connection';

export function createFingerprintQueue() {
  return createQueue(queueNames.fingerprints);
}

export function createAlertQueue() {
  return createQueue(queueNames.alerts);
}

export function createBillingQueue() {
  return createQueue(queueNames.billing);
}
