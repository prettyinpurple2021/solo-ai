import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { stripe } from '@/lib/stripe'
import { db } from '@/db'
import { users } from '@/shared/db/schema'
import { eq } from 'drizzle-orm'
import { logError, logInfo } from '@/lib/logger'

export async function POST(_req: NextRequest): Promise<NextResponse> {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get customer ID from database
        const userResult = await db.select({
            stripeCustomerId: users.stripe_customer_id
        })
        .from(users)
        .where(eq(users.id, session.user.id))
        .limit(1);

        const customerId = userResult[0]?.stripeCustomerId;

        if (!customerId) {
            return NextResponse.json({ 
                error: 'No active subscription found. Please subscribe to a tier first.' 
            }, { status: 404 })
        }

        logInfo(`Creating billing portal session for user ${session.user.id}, customer: ${customerId}`)

        const portalSession = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/billing`,
        });

        return NextResponse.json({ 
            url: portalSession.url,
            success: true
        })

    } catch (error) {
        logError('Error creating billing portal session:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
