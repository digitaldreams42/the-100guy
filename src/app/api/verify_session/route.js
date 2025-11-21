// app/api/verify_session/route.js
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get('session_id');

        if (!sessionId) {
            return NextResponse.json({ message: 'Session ID is required.' }, { status: 400 });
        }

        const session = await stripe.checkout.sessions.retrieve(sessionId, {
            expand: ['line_items.data.price.product'],
        });

        return NextResponse.json({ line_items: session.line_items.data }, { status: 200 });

    } catch (error) {
        console.error('Stripe Verify Session Error:', error);
        return NextResponse.json({ message: 'Failed to verify Stripe session.', error: error.message }, { status: 500 });
    }
}
