/**
 * Structured logging utility for consistent logging across the application
 * Logs are formatted as JSON for easier parsing by log management systems
 */

import * as Sentry from '@sentry/nextjs';
import { NextRequest } from 'next/server';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogParams {
  level?: LogLevel;
  message: string;
  route?: string;
  status?: number;
  userId?: string;
  error?: Error | unknown;
  meta?: Record<string, any>;
}

/**
 * Log a message with structured metadata
 */
export function log({
  level = 'info',
  message,
  route,
  status,
  userId,
  error,
  meta = {},
}: LogParams): void {
  const timestamp = new Date().toISOString();
  
  // Build the log entry
  const logEntry = {
    timestamp,
    level,
    message,
    ...(route && { route }),
    ...(status && { status }),
    ...(userId && { userId }),
    ...(Object.keys(meta).length > 0 && { meta }),
  };

  // Log to console
  console.log(JSON.stringify(logEntry));
  
  // For errors, also log to Sentry if available
  if (level === 'error' && error instanceof Error) {
    try {
      Sentry.captureException(error, {
        tags: {
          ...(route && { route }),
          ...(userId && { userId }),
        },
        extra: {
          ...meta,
          ...(status && { status }),
        },
      });
    } catch (sentryError) {
      // Fail silently if Sentry isn't configured
      console.error('Failed to log to Sentry:', sentryError);
    }
  }
}

/**
 * Log debug information
 */
export function debug(message: string, params: Omit<LogParams, 'level' | 'message'> = {}): void {
  log({ level: 'debug', message, ...params });
}

/**
 * Log informational messages
 */
export function info(message: string, params: Omit<LogParams, 'level' | 'message'> = {}): void {
  log({ level: 'info', message, ...params });
}

/**
 * Log warning messages
 */
export function warn(message: string, params: Omit<LogParams, 'level' | 'message'> = {}): void {
  log({ level: 'warn', message, ...params });
}

/**
 * Log error messages
 */
export function error(message: string, params: Omit<LogParams, 'level' | 'message'> = {}): void {
  log({ level: 'error', message, ...params });
}

/**
 * Create a logger instance with preset context
 */
export function createLogger(context: Partial<LogParams>) {
  return {
    debug: (message: string, params: Partial<LogParams> = {}) => 
      debug(message, { ...context, ...params }),
    info: (message: string, params: Partial<LogParams> = {}) => 
      info(message, { ...context, ...params }),
    warn: (message: string, params: Partial<LogParams> = {}) => 
      warn(message, { ...context, ...params }),
    error: (message: string, params: Partial<LogParams> = {}) => 
      error(message, { ...context, ...params }),
  };
}

/**
 * Log API event with standard format
 * Extracts common fields from the request
 */
export function logApiEvent(params: LogParams): void {
  log(params);
}

/**
 * Create an API route logger with request context
 */
export function createApiLogger(req: NextRequest, route: string) {
  const userId = req.headers.get('x-user-id') || undefined;
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  
  return {
    debug: (message: string, params: Partial<LogParams> = {}) => 
      debug(message, { route, userId, meta: { ...params.meta, ip }, ...params }),
    info: (message: string, params: Partial<LogParams> = {}) => 
      info(message, { route, userId, meta: { ...params.meta, ip }, ...params }),
    warn: (message: string, params: Partial<LogParams> = {}) => 
      warn(message, { route, userId, meta: { ...params.meta, ip }, ...params }),
    error: (message: string, params: Partial<LogParams> = {}) => 
      error(message, { route, userId, meta: { ...params.meta, ip }, ...params }),
  };
}