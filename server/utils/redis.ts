import { Redis } from '@upstash/redis';

let redisClient: Redis | null = null;

/**
 * Lazily initialize and return a shared Upstash Redis client.
 * The client is only created on first call, so importing this module
 * never triggers a connection or warning at startup when env vars are absent.
 */
export function getRedis(): Redis {
    if (!redisClient) {
        const url = process.env.UPSTASH_REDIS_REST_URL;
        const token = process.env.UPSTASH_REDIS_REST_TOKEN;
        if (!url || !token) {
            throw new Error(
                'UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN environment variables are required but not set.'
            );
        }
        redisClient = new Redis({ url, token });
    }
    return redisClient;
}
