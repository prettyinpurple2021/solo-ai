import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { stripe } from '@/lib/stripe'
import { logError, logInfo } from '@/lib/logger'

export async function POST(req: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { priceId } = await req.json()

        if (!priceId) {
            return NextResponse.json({ error: 'Price ID is required' }, { status: 400 })
        }

        logInfo(`Creating checkout session for user ${session.user.id}, price: ${priceId}`)

        const checkoutSession = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            customer_email: session.user.email || undefined,
            client_reference_id: session.user.id,
            success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pricing`,
            metadata: {
                userId: session.user.id,
            }
        });

        return NextResponse.json({
            url: checkoutSession.url,
            success: true
        })

    } catch (error) {
        logError('Error creating checkout session:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
