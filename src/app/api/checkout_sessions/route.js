// app/api/checkout_sessions/route.js
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
    try {
        const { cart } = await request.json();

        if (!cart || !Array.isArray(cart) || cart.length === 0) {
            return NextResponse.json({ message: 'Cart is empty or invalid.' }, { status: 400 });
        }

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        const line_items = cart.map(item => ({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: item.name,
                    description: item.description,
                    images: [item.coverImage],
                    metadata: {
                        productId: item.id,
                        productFile: item.productFile,
                    }
                },
                unit_amount: Math.round(item.price * 100), // Price in cents
            },
            quantity: 1,
        }));
        
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items,
            mode: 'payment',
            success_url: `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${appUrl}/cancel`,
            metadata: {
                // Store cart details as a string, useful for webhooks
                cart: JSON.stringify(cart.map(item => item.id)),
            }
        });

        return NextResponse.json({ sessionId: session.id, url: session.url }, { status: 200 });

    } catch (error) {
        console.error('Stripe Session Error:', error);
        return NextResponse.json({ message: 'Failed to create Stripe session.', error: error.message }, { status: 500 });
    }
}
