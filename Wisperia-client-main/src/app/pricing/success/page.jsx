import { subscriptions } from '@/lib/action/payment'
import { stripe } from '@/lib/stripe'
import { redirect } from 'next/navigation'
import { CheckCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import SessionRefresher from './SessionRefresher';

export default async function Success({ searchParams }) {
  const { session_id } = await searchParams

  if (!session_id)
    throw new Error('Please provide a valid session_id (`cs_test_...`)')

  const {
    status,
    metadata,
    customer_details: { email: customerEmail }
  } = await stripe.checkout.sessions.retrieve(session_id, {
    expand: ['line_items', 'payment_intent']
  })

  if (status === 'open') {
    return redirect('/')
  }

  if (status === 'complete') {
    // Register subscription in DB & upgrade user (server action → backend /subscriptions)
    await subscriptions({ ...metadata, sessionId: session_id })

    return (
      <main className="min-h-screen bg-[#fcf8f9] flex items-center justify-center py-20 px-6">
        {/*
          SessionRefresher is a Client Component that fires once on mount.
          It calls authClient.getSession({ cache: "no-store" }) to bust the
          better-auth JWT cookie cache so useSession() reflects plan: "premium"
          immediately — no sign-out required.
        */}
        <SessionRefresher />

        <div className="max-w-md w-full bg-white p-8 md:p-12 rounded-[2.5rem] border border-green-100 shadow-xl text-center flex flex-col items-center">
          <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center text-green-600 mb-6">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-extrabold text-[#670D2F] mb-4">Payment Successful!</h2>
          <span className="text-green-700 font-bold text-xs tracking-[0.2em] uppercase bg-green-50 px-6 py-2 rounded-full mb-6">
            Account Upgraded to Premium
          </span>
          <p className="text-gray-500 mb-8 leading-relaxed text-sm">
            Thank you for your purchase! Your account has been upgraded to Premium lifetime access. A confirmation email has been sent to <strong className="text-gray-700">{customerEmail}</strong>.
          </p>
          <div className="flex flex-col gap-3 w-full">
            <Link
              href="/dashboard"
              className="w-full text-center bg-[#670D2F] text-white py-3.5 rounded-xl font-bold hover:bg-[#5a0b27] transition-all flex items-center justify-center gap-2"
            >
              Go to Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/"
              className="w-full text-center border border-gray-100 text-gray-500 py-3 rounded-xl text-xs font-semibold hover:bg-gray-50 transition"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    )
  }
}