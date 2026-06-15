import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Rate limiter: 10 requests per 10 seconds per IP on auth endpoints
export const authRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "10 s"),
  analytics: true,
  prefix: "finvault:ratelimit:auth",
});

// Rate limiter: 30 requests per 10 seconds for API endpoints
export const apiRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, "10 s"),
  analytics: true,
  prefix: "finvault:ratelimit:api",
});
