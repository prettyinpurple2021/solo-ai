type RateLimitEntry = { count: number; ts: number }

declare global {
  // eslint-disable-next-line no-var
  var __rateLimits: Map<string, Map<string, RateLimitEntry>> | undefined
}

function getBucket(bucketName: string) {
  if (!globalThis.__rateLimits) {
    globalThis.__rateLimits = new Map()
  }
  let bucket = globalThis.__rateLimits.get(bucketName)
  if (!bucket) {
    bucket = new Map<string, RateLimitEntry>()
    globalThis.__rateLimits.set(bucketName, bucket)
  }
  return bucket
}

export function rateLimitByIp(
  bucketName: string,
  ip: string,
  windowMs: number,
  max: number
): { allowed: boolean; remaining: number } {
  const bucket = getBucket(bucketName)
  const now = Date.now()
  const entry = bucket.get(ip)
  if (!entry || now - entry.ts > windowMs) {
    bucket.set(ip, { count: 1, ts: now })
    return { allowed: true, remaining: max - 1 }
  }
  entry.count += 1
  entry.ts = now
  const remaining = Math.max(0, max - entry.count)
  return { allowed: entry.count <= max, remaining }
}


