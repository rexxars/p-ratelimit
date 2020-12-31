# p-ratelimit [![npm](https://img.shields.io/npm/v/p-ratelimit.svg)](https://www.npmjs.com/package/p-ratelimit) [![license](https://img.shields.io/github/license/natesilva/p-ratelimit.svg)](https://github.com/natesilva/p-ratelimit/blob/master/LICENSE) [![node](https://img.shields.io/node/v/p-ratelimit.svg)](https://www.npmjs.com/package/p-ratelimit)

> Makes sure you don’t call rate-limited APIs too quickly.

This is an easy-to-use utility for calling rate-limited APIs. It will prevent you from exceeding rate limits by queueing requests that would go over your rate limit quota.

Rate-limits can be applied across multiple servers if you use Redis.

It works with any API function that returns a Promise.

## Install

```
$ npm i @rexxars/p-ratelimit
```

## What’s different

- **True rate limiting**
  - Utilities like [p-limit](https://github.com/sindresorhus/p-limit) control how many functions are running concurrently. That won’t prevent you from exceeding limits on APIs that use token-bucket throttling.
  - **p-ratelimit** supports both concurrency and rate limits.
- **Works across API families**
  - Utilities like [Lodash throttle](https://lodash.com/docs#throttle) create separate quotas for each API function.
  - **p-ratelimit** can enforce a single shared quota for all functions in an API family.
- **Minimal implementation**
  - Utilities like [limiter](https://github.com/jhurliman/node-rate-limiter) provide low-level tooling that requires you to manage tokens and provide your own queue.
  - **p-ratelimit** requires minimal modification to your existing code.
- **Made for Promises and TypeScript friendly**
  - A rate-limited function returns the same Promise type as the original function.

## Changes in @rexxars-fork

- Targets ES5 - replaces some of the internal uses of ES6 classes with functions/closures
- Removes redis quota manager because of the more browser-focused target
- Removes some internal functions which were not used, reducing bundle size

See [https://github.com/natesilva/p-ratelimit](natesilva) for the original version!

## Example

```javascript
const { pRateLimit } = require('p-ratelimit');
// import { pRateLimit } from 'p-ratelimit';       // TypeScript

// create a rate limiter that allows up to 30 API calls per second,
// with max concurrency of 10
const limit = pRateLimit({
  interval: 1000, // 1000 ms == 1 second
  rate: 30, // 30 API calls per interval
  concurrency: 10, // no more than 10 running at once
  maxDelay: 2000, // an API call delayed > 2 sec is rejected
});

async function main() {
  // original WITHOUT rate limiter:
  result = await someFunction(42);
  // with rate limiter:
  result = await limit(() => someFunction(42));
}

main();
```

## Configuration

The `Quota` configuration object passed to `pRateLimit` offers the following configuration settings:

### If you care about rate limiting

Set both of these:

- `interval`: the interval over which to apply the rate limit, in milliseconds
- `rate`: how many API calls to allow over the interval period

### If you care about limiting concurrency

- `concurrency`: how many concurrent API calls to allow

### If you care about both rate limiting and concurrency

If you want both rate limiting and concurrency, use all three of the above settings (`interval`, `rate`, `concurrency`).

### Other options

- `maxDelay`: the maximum amount of time to wait (in milliseconds) before rejecting an API request with `RateLimitTimeoutError` (default: `0`, no timeout)
- `fastStart` (Redis only): if true, immediately begin processing requests using the full quota, instead of waiting several seconds to discover other servers (default: `false`)

If you make an API request that would exceed rate limits, it’s queued and delayed until it can run within the rate limits. Setting `maxDelay` will cause the API request to fail if it’s delayed too long.

## License

MIT © Nate Silva
