import { dequeue } from '../dequeue';
import { Quota } from './quota';

export function getQuotaManager(quota: Quota) {
  let activeCount = 0;
  let history = dequeue();

  function start() {
    if (activeCount >= quota.concurrency) {
      return false;
    }

    if (quota.interval !== undefined && quota.rate !== undefined) {
      removeExpiredHistory();
      if (history.length() >= quota.rate) {
        return false;
      }
      history.push(Date.now());
    }

    activeCount++;
    return true;
  }

  function end() {
    activeCount--;
  }

  function maxDelay() {
    return quota.maxDelay || 0;
  }

  function removeExpiredHistory() {
    const expired = Date.now() - quota.interval;
    while (history.length && history.peekFront() < expired) {
      history.shift();
    }
  }

  return { activeCount: () => activeCount, quota, maxDelay, start, end };
}

export interface QuotaManager {
  activeCount(): number;
  maxDelay(): number;
  start(): boolean;
  end(): void;
  quota: Quota;
}
