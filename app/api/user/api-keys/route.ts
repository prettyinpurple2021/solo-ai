import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-server';
import { db } from '@/db';
import { userApiKeys } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const saveKeysSchema = z.object({
    keys: z.array(z.object({
        service: z.string(),
        key_value: z.string().min(1)
    }))
});

export async function GET(request: NextRequest) {
    try {
        const { user, error } = await authenticateRequest();
        if (error || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const keys = await db
            .select({
                service: userApiKeys.service,
                key_value: userApiKeys.key_value
            })
            .from(userApiKeys)
            .where(eq(userApiKeys.user_id, user.id));

        // Mask keys for security
        const maskedKeys = keys.map(k => ({
            service: k.service,
            // Show first 4 and last 4 chars, mask the rest
            masked_value: k.key_value.length > 8
                ? `${k.key_value.substring(0, 4)}...${k.key_value.substring(k.key_value.length - 4)}`
                : '********',
            is_configured: true
        }));

        return NextResponse.json({ keys: maskedKeys });
    } catch (error) {
        console.error('Error fetching API keys:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const { user, error } = await authenticateRequest();
        if (error || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { keys } = saveKeysSchema.parse(body);

        // Upsert keys
        for (const key of keys) {
            // Check if exists
            const existing = await db
                .select()
                .from(userApiKeys)
                .where(and(
                    eq(userApiKeys.user_id, user.id),
                    eq(userApiKeys.service, key.service)
                ))
                .limit(1);

            if (existing.length > 0) {
                await db
                    .update(userApiKeys)
                    .set({
                        key_value: key.key_value,
                        updated_at: new Date()
                    })
                    .where(eq(userApiKeys.id, existing[0].id));
            } else {
                await db
                    .insert(userApiKeys)
                    .values({
                        user_id: user.id,
                        service: key.service,
                        key_value: key.key_value
                    });
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error saving API keys:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
