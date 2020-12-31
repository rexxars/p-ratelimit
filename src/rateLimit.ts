import { dequeue } from './dequeue';
import { Quota } from './quota/quota';
import { getQuotaManager, QuotaManager } from './quota/quotaManager';
import { RateLimitTimeoutError } from './rateLimitTimeoutError';

export function pRateLimit(
  quotaManager: QuotaManager | Quota
): <T>(fn: () => Promise<T>) => Promise<T> {
  if (!quotaManager || !('start' in quotaManager)) {
    return pRateLimit(getQuotaManager(quotaManager as Quota));
  }

  const queue = dequeue<Function>();
  let timerId: NodeJS.Timer = null;

  const next = () => {
    while (queue.length() && quotaManager.start()) {
      queue.shift()();
    }

    if (queue.length() && !quotaManager.activeCount() && !timerId) {
      timerId = setTimeout(() => {
        timerId = null;
        next();
      }, 100);
    }
  };

  return <T>(fn: () => Promise<T>) => {
    return new Promise<T>((resolve, reject) => {
      let timerId: NodeJS.Timer = null;
      if (quotaManager.maxDelay()) {
        timerId = setTimeout(() => {
          timerId = null;
          reject(new RateLimitTimeoutError('queue maxDelay timeout exceeded'));
          next();
        }, quotaManager.maxDelay());
      }

      const run = () => {
        if (quotaManager.maxDelay()) {
          if (timerId) {
            clearTimeout(timerId);
          } else {
            // timeout already fired
            return;
          }
        }

        fn()
          .then((val) => {
            quotaManager.end();
            resolve(val);
          })
          .catch((err) => {
            quotaManager.end();
            reject(err);
          })
          .then(() => {
            next();
          });
      };

      queue.push(run);
      next();
    });
  };
}
