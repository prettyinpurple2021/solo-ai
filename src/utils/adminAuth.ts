/**
 * Client-side admin session validation utilities
 */

import { logError } from '@/lib/logger';

const ADMIN_SESSION_KEY = 'admin_session';
const ADMIN_SESSION_EXPIRES_KEY = 'admin_session_expires';

/**
 * Check if admin session is valid and not expired
 * @returns true if session is valid, false otherwise
 */
export function isAdminSessionValid(): boolean {
    try {
        const token = sessionStorage.getItem(ADMIN_SESSION_KEY);
        const expiresStr = sessionStorage.getItem(ADMIN_SESSION_EXPIRES_KEY);

        if (!token || !expiresStr) {
            return false;
        }

        const expires = Number(expiresStr);
        return Date.now() < expires;
    } catch (error) {
        logError('Error checking admin session', { error });
        return false;
    }
}

/**
 * Get the admin session token
 * @returns token string if valid, null otherwise
 */
export function getAdminToken(): string | null {
    if (!isAdminSessionValid()) {
        return null;
    }

    return sessionStorage.getItem(ADMIN_SESSION_KEY);
}

/**
 * Store admin session token with expiration
 * @param token - JWT admin token
 * @param expiresInMs - Expiration time in milliseconds (default: 2 hours)
 */
export function setAdminSession(token: string, expiresInMs: number = 2 * 60 * 60 * 1000): void {
    try {
        sessionStorage.setItem(ADMIN_SESSION_KEY, token);
        sessionStorage.setItem(ADMIN_SESSION_EXPIRES_KEY, String(Date.now() + expiresInMs));
    } catch (error) {
        logError('Error setting admin session', { error });
    }
}

/**
 * Clear admin session (logout)
 */
export function clearAdminSession(): void {
    try {
        sessionStorage.removeItem(ADMIN_SESSION_KEY);
        sessionStorage.removeItem(ADMIN_SESSION_EXPIRES_KEY);
    } catch (error) {
        logError('Error clearing admin session', { error });
    }
}

/**
 * Get time remaining in session (in milliseconds)
 * @returns milliseconds until expiration, 0 if expired
 */
export function getSessionTimeRemaining(): number {
    const expiresStr = sessionStorage.getItem(ADMIN_SESSION_EXPIRES_KEY);
    if (!expiresStr) return 0;

    const expires = Number(expiresStr);
    const remaining = expires - Date.now();

    return Math.max(0, remaining);
}

/**
 * Format session time remaining as human-readable string
 * @returns formatted time string (e.g., "1h 23m")
 */
export function getSessionTimeRemainingFormatted(): string {
    const ms = getSessionTimeRemaining();
    if (ms === 0) return 'Expired';

    const minutes = Math.floor(ms / 60000);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours > 0) {
        return `${hours}h ${remainingMinutes}m`;
    }
    return `${remainingMinutes}m`;
}
