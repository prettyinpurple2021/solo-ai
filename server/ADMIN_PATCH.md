# Admin Routes Manual Patch Guide

This file documents the patch applied to `server/routes/admin.ts` to complete the production implementation.
**STATUS: APPLIED**
Verified on: December 31, 2025

## Change 1: Add JWT Import

**Location:** Line 2 (after `import rateLimit from 'express-rate-limit';`)

**Add:**
```typescript
import jwt from 'jsonwebtoken';
```

**Result:**
```typescript
import express, { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';  // ← ADD THIS LINE
import { db } from '../db';
```

---

## Change 2: Update /verify-pin Endpoint

**Location:** Lines 30-49

**Find:**
```typescript
router.post('/verify-pin', verifyPinRateLimiter, authMiddleware, async (req: Request, res: Response) => {
    try {
        const { pin } = req.body;
        const userEmail = ((req as unknown) as AuthRequest).userEmail;

        if (!userEmail || !pin) {
            return res.status(400).json({ error: 'Missing requirements' });
        }

        const isValid = await verifyAdminPin(userEmail, pin);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid PIN' });
        }

        res.json({ success: true });
    } catch (error) {
        console.error('PIN verification error:', error);
        res.status(500).json({ error: 'Verification failed' });
    }
});
```

**Replace with:**
```typescript
router.post('/verify-pin', verifyPinRateLimiter, authMiddleware, async (req: Request, res: Response) => {
    try {
        const { pin } = req.body;
        const userEmail = ((req as unknown) as AuthRequest).userEmail;
        const userId = ((req as unknown) as AuthRequest).userId;  // ← ADD THIS LINE

        if (!userEmail || !pin || !userId) {  // ← MODIFY THIS LINE
            return res.status(400).json({ error: 'Missing requirements' });
        }

        const isValid = await verifyAdminPin(userEmail, pin);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid PIN' });
        }

        // ← ADD THESE LINES START
        // Generate Admin Session JWT Token
        const adminToken = jwt.sign(
            { 
                userId, 
                email: userEmail, 
                role: 'admin', 
                adminSession: true 
            },
            process.env.JWT_SECRET!,
            { expiresIn: '2h' } // 2-hour admin session
        );

        res.json({ success: true, adminToken });  // ← MODIFY THIS LINE
        // ← ADD THESE LINES END
    } catch (error) {
        console.error('PIN verification error:', error);
        res.status(500).json({ error: 'Verification failed' });
    }
});
```

**Summary of changes:**
1. Add `userId` extraction
2. Add `userId` to validation check
3. Generate JWT token with admin session
4. Return `adminToken` in response


**Canonical implementation:** `server/routes/admin.ts` — `POST /users/:userId/suspend` updates `users.suspended`, `users.suspended_at`, and `users.suspended_reason`, then inserts an `adminActions` audit row. User IDs are string UUIDs (`req.params.userId`), matching the shared Drizzle schema.

**Reference (matches production; column names are snake_case in DB):**
---

## Change 3: Update /users/:userId/suspend Endpoint

**Status (Apr 2026):** This endpoint is **already implemented** in the repository. The “Find” snippet below describes the **pre-patch** behavior only (for older forks or audits). Do not treat those comments as current code.
```typescript
router.post('/users/:userId/suspend', async (req: express.Request, res: express.Response) => {
    try {
        const userId = req.params.userId as string;
        const { reason } = req.body;
        const adminUserId = req.userId!;

        await db.update(users)
            .set({
                suspended: true,
                suspended_at: new Date(),
                suspended_reason: reason || 'Account suspended by administrator'
            })
            .where(eq(users.id, userId));

        await db.insert(adminActions).values({
            adminId: adminUserId,
            action: 'suspend_user',
            targetUserId: userId,
            metadata: { reason }
        });

        return res.json({ success: true, message: 'User suspended successfully' });
    } catch (error) {
        logError('Error suspending user', error);
        return res.status(500).json({ error: 'Failed to suspend user' });
    }
});
```

**Historical “Find” (before patch — do not copy into production):**
```typescript
// In a real app, we'd have a suspended flag or status
// For now, we'll just log the action
```

**Summary of what was fixed:**
1. Persist suspension on the user row (`suspended`, timestamps, reason).
2. Record the action in `admin_actions` for audit.
3. Return a clear success response; log and 500 on failure.

---

## Verification

After making these changes:

1. **Check imports are correct**
2. **Verify JWT secret is in environment** (`process.env.JWT_SECRET`)
3. **Test PIN verification returns token**
4. **Test user suspension updates database**

## Quick Test Commands

```bash
# Compile to check for errors
cd server && npm run build

# If successful, restart server
npm run dev
```

---

## What These Changes Do

1. **JWT Import**: Enables JWT token generation for admin sessions
2. **verify-pin**: Returns a 2-hour session token that frontend stores
3. **suspend**: Persists suspension on the user row and writes an audit record (see Change 3 reference above)

The live `server/routes/admin.ts` file is the source of truth; pre-patch snippets in this guide are archival only.
