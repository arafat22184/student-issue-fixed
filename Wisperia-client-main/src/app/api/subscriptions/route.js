import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe';
import { auth } from '@/lib/auth';


export async function POST() {
  try {
    const headersList = await headers()
    const origin = headersList.get('origin')
    const userSession = await  auth.api.getSession({
       headers: await headers()
    })
    const PRICE_ID = 'price_1Tkc4317KfH9DgY0PYSDTlot'
    const user = userSession?.user

    // Create Checkout Sessions from body params.
    const session = await stripe.checkout.sessions.create({
        customer_email:user.email,
      line_items: [
        {
          // Provide the exact Price ID (for example, price_1234) of the product you want to sell
          price:PRICE_ID,
          quantity: 1,
        },
      ],
      metadata:{
        priceId: PRICE_ID,
        userId:user.id,
        userRole:user.role,
        userEmail:user.email
      },
      mode: 'payment',
      success_url: `${origin}/pricing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/payment/cancel`,
    });
    return NextResponse.redirect(session.url, 303)
  } catch (err) {
    return NextResponse.json(
      { error: err.message },
      { status: err.statusCode || 500 }
    )
  }
}
