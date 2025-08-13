type LogLevel = 'debug' | 'info' | 'warn' | 'error'

type ApiLog = {
  timestamp: string
  level: LogLevel
  route: string
  status?: number
  userId?: string | null
  message: string
  meta?: Record<string, unknown>
}

export function logApiEvent(event: Omit<ApiLog, 'timestamp'>) {
  const payload: ApiLog = { timestamp: new Date().toISOString(), ...event }
  // Console JSON for easy ingestion by log platforms
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(payload))
}


