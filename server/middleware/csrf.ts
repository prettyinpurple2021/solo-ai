import { Request, Response, NextFunction } from 'express';

/**
 * CSRF guard for cookie-authenticated mutation requests.
 *
 * Requests that authenticate via a Bearer token in the Authorization header are
 * inherently CSRF-safe (browsers cannot attach custom Authorization headers
 * cross-origin without a CORS pre-flight).
 *
 * Requests that instead rely on a cookie token (the fallback path in authMiddleware)
 * must include `X-Requested-With: XMLHttpRequest`. Browsers cannot set this header
 * on cross-origin requests without a CORS pre-flight, making it a valid, stateless
 * CSRF mitigation.
 *
 * GET / HEAD / OPTIONS are safe HTTP methods and skipped automatically.
 *
 * Routes that have their own request-level authentication (e.g. Stripe webhook
 * signature verification) are exempted from this guard.
 */
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

// Paths with their own out-of-band verification (not cookie-based)
const CSRF_EXEMPT_PREFIXES = ['/api/stripe/webhook'];

export function csrfGuard(req: Request, res: Response, next: NextFunction): void {
    if (SAFE_METHODS.has(req.method)) {
        return next();
    }

    // Exempt routes with their own verification scheme
    if (CSRF_EXEMPT_PREFIXES.some(prefix => req.path.startsWith(prefix))) {
        return next();
    }

    // Requests that supply a Bearer token are already CSRF-safe.
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
        return next();
    }

    // Cookie-only requests must include X-Requested-With to prove browser intent.
    const xrw = req.headers['x-requested-with'];
    if (xrw === 'XMLHttpRequest') {
        return next();
    }

    res.status(403).json({ error: 'CSRF check failed' });
}
