/**
 * Production-ready logging utility for SoloSuccess AI Platform
 * Replaces console.log statements with proper logging levels
 */
export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}
interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  context?: Record<string, unknown>
  error?: Error
}
class Logger {
  private logLevel: LogLevel
  private isDevelopment: boolean
  constructor() {
    // Set log level based on environment
    this.isDevelopment = process.env.NODE_ENV === 'development'
    this.logLevel = this.isDevelopment ? LogLevel.DEBUG : LogLevel.INFO
  }
  private shouldLog(level: LogLevel): boolean {
    return level <= this.logLevel
  }
  private formatLogEntry(entry: LogEntry): string {
    const levelNames = ['ERROR', 'WARN', 'INFO', 'DEBUG']
    const levelName = levelNames[entry.level]
    let logMessage = `[${entry.timestamp}] ${levelName}: ${entry.message}`
    if (entry.context && Object.keys(entry.context).length > 0) {
      logMessage += ` | Context: ${JSON.stringify(entry.context)}`
    }
    if (entry.error) {
      logMessage += ` | Error: ${entry.error.message}`
      if (this.isDevelopment && entry.error.stack) {
        logMessage += ` | Stack: ${entry.error.stack}`
      }
    }
    return logMessage
  }
  private log(level: LogLevel, message: string, context?: Record<string, unknown>, error?: Error): void {
    if (!this.shouldLog(level)) return
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error,
    }
    const formattedMessage = this.formatLogEntry(entry)
    // Use appropriate console method based on log level
    // Only log to console in development or for critical errors
    if (this.isDevelopment || level === LogLevel.ERROR) {
      switch (level) {
        case LogLevel.ERROR:
          if (typeof console !== 'undefined' && console.error) {
            console.error(formattedMessage)
          }
          break
        case LogLevel.WARN:
          if (typeof console !== 'undefined' && console.warn) {
            console.warn(formattedMessage)
          }
          break
        case LogLevel.INFO:
          if (typeof console !== 'undefined' && console.info) {
            console.info(formattedMessage)
          }
          break
        case LogLevel.DEBUG:
          if (typeof console !== 'undefined' && console.debug) {
            console.debug(formattedMessage)
          }
          break
      }
    }
    // Send logs to an external service or error tracking system if configured
    if (!this.isDevelopment && level <= LogLevel.WARN) {
      this.sendToExternalService(entry)
    }
  }
  private async sendToExternalService(entry: LogEntry): Promise<void> {
    // Ensure logs are structured and formatted for observability stacks
    try {
      // Send to log ingestion endpoint if configured
      if (process.env.LOG_INGEST_URL) {
          await fetch(process.env.LOG_INGEST_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(entry),
          });
      }
    } catch (logError) {
      // Don't let logging errors break the application
      // Errors should be sent to an error tracking service if available
      if (this.isDevelopment && typeof console !== 'undefined' && console.error) {
        console.error('Failed to send log to external service:', logError)
      }
    }
  }
  error(message: string, context?: Record<string, unknown>, error?: Error): void {
    this.log(LogLevel.ERROR, message, context, error)
  }
  warn(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, message, context)
  }
  info(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, message, context)
  }
  debug(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, message, context)
  }
  // Convenience method for API route logging
  apiLog(method: string, path: string, statusCode: number, duration?: number, context?: Record<string, unknown>): void {
    const message = `${method} ${path} - ${statusCode}${duration ? ` (${duration}ms)` : ''}`
    const level = statusCode >= 500 ? LogLevel.ERROR : statusCode >= 400 ? LogLevel.WARN : LogLevel.INFO
    this.log(level, message, {
      method,
      path,
      statusCode,
      duration,
      ...context,
    })
  }
  // Convenience method for database operation logging
  dbLog(operation: string, table: string, duration?: number, context?: Record<string, unknown>): void {
    const message = `DB ${operation} on ${table}${duration ? ` (${duration}ms)` : ''}`
    this.log(LogLevel.DEBUG, message, {
      operation,
      table,
      duration,
      ...context,
    })
  }
  // Convenience method for authentication logging
  authLog(action: string, userId?: string, success: boolean = true, context?: Record<string, unknown>): void {
    const message = `Auth ${action}${userId ? ` for user ${userId}` : ''} - ${success ? 'SUCCESS' : 'FAILED'}`
    const level = success ? LogLevel.INFO : LogLevel.WARN
    this.log(level, message, {
      action,
      userId,
      success,
      ...context,
    })
  }
}
// Export singleton instance
export const logger = new Logger()
// Export convenience functions for common use cases
export const logError = (message: string, contextOrError?: unknown, error?: unknown) => {
  if (contextOrError instanceof Error) {
    logger.error(message, undefined, contextOrError)
  } else if (typeof contextOrError === 'object' && contextOrError !== null) {
    logger.error(message, contextOrError as Record<string, unknown>, error as Error | undefined)
  } else {
    logger.error(message, undefined, error as Error | undefined)
  }
}
export const logWarn = (message: string, context?: unknown) =>
  logger.warn(message, (context as Record<string, unknown>) || undefined)
export const logInfo = (message: string, context?: unknown) =>
  logger.info(message, (context as Record<string, unknown>) || undefined)
export const logDebug = (message: string, context?: unknown) =>
  logger.debug(message, (context as Record<string, unknown>) || undefined)
export const logApi = (method: string, path: string, statusCode: number, duration?: number, context?: unknown) =>
  logger.apiLog(method, path, statusCode, duration, (context as Record<string, unknown>) || undefined)
export const logDb = (operation: string, table: string, duration?: number, context?: unknown) =>
  logger.dbLog(operation, table, duration, (context as Record<string, unknown>) || undefined)
export const logAuth = (action: string, userId?: string, success?: boolean, context?: unknown) =>
  logger.authLog(action, userId, success, (context as Record<string, unknown>) || undefined)
