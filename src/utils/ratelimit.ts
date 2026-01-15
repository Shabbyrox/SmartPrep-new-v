// src/utils/ratelimit.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Create a new ratelimiter, that allows 5 requests per 60 seconds
export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '60 s'),
  analytics: true,
  /**
   * Optional prefix for the keys in Redis.
   * Useful if you share the Redis with other apps.
   */
  prefix: '@upstash/ratelimit',
})