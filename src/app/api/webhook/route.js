// app/api/webhook/route.js
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { adminDb } from '../../../lib/firebase-admin';
import admin from 'firebase-admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
    const sig = request.headers.get('stripe-signature');
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        const body = await request.text();
        event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    } catch (err) {
        console.error('Webhook signature verification failed:', err);
        return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;

            // Extract cart data from session metadata
            let cartItems = [];
            try {
                cartItems = JSON.parse(session.metadata?.cart || '[]');
            } catch (e) {
                console.error('Error parsing cart from session metadata:', e);
            }

            // Create sale records for each item in the cart
            for (const productId of cartItems) {
                try {
                    // Get product details from Firestore
                    const productRef = adminDb.collection(
                        `artifacts/${process.env.NEXT_PUBLIC_FIREBASE_APP_ID}/public/data/products`
                    ).doc(productId);
                    const productSnap = await productRef.get();
                    
                    if (productSnap.exists) {
                        const product = productSnap.data();
                        
                        // Add sale record to Firestore
                        const salesRef = adminDb.collection(
                            `artifacts/${process.env.NEXT_PUBLIC_FIREBASE_APP_ID}/public/data/sales`
                        );
                        
                        await salesRef.add({
                            productId: product.id,
                            productTitle: product.name,
                            productPrice: product.price,
                            amount: product.price,
                            customerEmail: session.customer_details?.email || 'unknown',
                            status: 'completed',
                            type: product.type,
                            stripeSessionId: session.id,
                            stripeCustomerId: session.customer,
                            createdAt: admin.firestore.FieldValue.serverTimestamp()
                        });
                        
                        // Update product sales count
                        await productRef.update({
                            salesCount: admin.firestore.FieldValue.increment(1)
                        });
                    }
                } catch (error) {
                    console.error('Error processing item from webhook:', error);
                }
            }

            console.log('Payment successful for session:', session.id);
            break;
            
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
}