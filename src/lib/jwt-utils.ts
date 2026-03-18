const JWT_SECRET = process.env.JWT_SECRET || process.env.AUTH_SECRET || 'your-secret-key-change-in-production'
const JWT_TTL_SECONDS = 7 * 24 * 60 * 60 // 7 days

function base64UrlEncode(input: string | Uint8Array): string {
  const bytes = typeof input === 'string' ? new TextEncoder().encode(input) : input
  let binary = ''
  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }

  const base64 =
    typeof btoa === 'function'
      ? btoa(binary)
      : Buffer.from(binary, 'binary').toString('base64')

  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

/**
 * Generates an HS256 JWT that works in both Node and Edge runtimes.
 */
export async function generateBackendToken(userId: string, email: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  const header = {
    alg: 'HS256',
    typ: 'JWT',
  }
  const payload = {
    userId,
    email,
    iat: now,
    exp: now + JWT_TTL_SECONDS,
  }

  const encodedHeader = base64UrlEncode(JSON.stringify(header))
  const encodedPayload = base64UrlEncode(JSON.stringify(payload))
  const unsignedToken = `${encodedHeader}.${encodedPayload}`

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(JWT_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(unsignedToken))
  const encodedSignature = base64UrlEncode(new Uint8Array(signature))

  return `${unsignedToken}.${encodedSignature}`
}
