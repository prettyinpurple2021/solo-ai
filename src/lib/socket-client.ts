/**
 * Socket.IO connects to the standalone Railway API process, not Next.js `/api`.
 * Never use NEXT_PUBLIC_API_URL here when it points at the Vercel app.
 */
export function getSocketIoBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return (
      process.env.NEXT_PUBLIC_SOCKET_URL ||
      `${window.location.protocol}//${window.location.host}`
    );
  }
  return process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
}

/** JWT from GET /api/ws-token — must match Railway JWT_SECRET / AUTH_SECRET. */
export async function fetchSocketAuthToken(): Promise<string | null> {
  try {
    const res = await fetch('/api/ws-token', { credentials: 'include' });
    if (!res.ok) return null;
    const data = (await res.json()) as { token?: unknown };
    return typeof data.token === 'string' ? data.token : null;
  } catch {
    return null;
  }
}
