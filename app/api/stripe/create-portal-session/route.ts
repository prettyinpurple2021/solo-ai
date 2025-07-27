import { type NextRequest, NextResponse } from "next/server"
import { stripe, getURL } from "@/lib/stripe"
import { createClient } from "@/lib/supabase/server"
import { withAuth } from "@/lib/auth-utils"

export const POST = withAuth(async (req: NextRequest, user) => {
  try {
    if (!stripe) {
      return NextResponse.json({ error: "Stripe is not configured" }, { status: 500 })
    }

    const supabase = await createClient()

    // Get user's Stripe customer ID
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single()

    if (error || !profile?.stripe_customer_id) {
      return NextResponse.json({ error: "No subscription found" }, { status: 404 })
    }

    // Create billing portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${getURL()}dashboard`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("Error creating portal session:", error)
    return NextResponse.json({ error: "Failed to create portal session" }, { status: 500 })
  }
})
