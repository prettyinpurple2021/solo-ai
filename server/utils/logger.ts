type LogContext = Record<string, unknown>

function formatContext(context?: LogContext) {
  return context && Object.keys(context).length > 0 ? ` | context=${JSON.stringify(context)}` : ''
}

/** Set DEBUG_SERVER_LOGS=1 to print server logError output while NODE_ENV=test (e.g. debugging CI). */
function emitServerLogsInTest(): boolean {
  return process.env.DEBUG_SERVER_LOGS === '1'
}

export function logInfo(message: string, context?: LogContext) {
  if (process.env.NODE_ENV === 'development') {
    console.info(`[info] ${message}${formatContext(context)}`)
  }
}

export function logWarn(message: string, context?: LogContext) {
  if (process.env.NODE_ENV !== 'test') {
    console.warn(`[warn] ${message}${formatContext(context)}`)
  }
}

export function logError(message: string, error?: unknown, context?: LogContext) {
  if (process.env.NODE_ENV === 'test' && !emitServerLogsInTest()) {
    return
  }
  const errMsg =
    error instanceof Error
      ? ` | error=${error.message} | stack=${process.env.NODE_ENV === 'development' ? error.stack : ''}`
      : error
        ? ` | error=${String(error)}`
        : ''
  console.error(`[error] ${message}${errMsg}${formatContext(context)}`)
}

/** Use when the caught value must become an Error for logError's second parameter. */
export function caughtToError(caught: unknown): Error {
  return caught instanceof Error ? caught : new Error(String(caught))
}

