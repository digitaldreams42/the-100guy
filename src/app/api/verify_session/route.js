// app/api/verify_session/route.js
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { adminDb } from '../../../../lib/firebase-admin'; // Import adminDb
import admin from 'firebase-admin'; // Import admin for FieldValue

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

        // Ensure the session was successful
        if (session.payment_status !== 'paid') {
            return NextResponse.json({ message: 'Payment not successful for this session.' }, { status: 400 });
        }

        const newSalesRecorded = [];

        for (const item of session.line_items.data) {
            const productId = item.price.product.metadata?.productId;
            const productFile = item.price.product.metadata?.productFile;
            const customerEmail = session.customer_details?.email || 'unknown@example.com';

            if (!productId || !productFile) {
                console.warn(`Missing product metadata for item: ${item.id}`);
                continue; // Skip if essential metadata is missing
            }

            // Check if sale already exists to prevent duplicates on refresh
            const salesCollectionRef = adminDb.collection(`artifacts/${process.env.NEXT_PUBLIC_FIREBASE_APP_ID}/public/data/sales`);
            const existingSaleQuery = await salesCollectionRef
                .where('sessionId', '==', sessionId)
                .where('productId', '==', productId)
                .limit(1)
                .get();

            if (existingSaleQuery.empty) {
                // Sale does not exist, create it
                const saleRecord = {
                    productId: productId,
                    productName: item.price.product.name,
                    productFile: productFile,
                    productPrice: item.amount_total / 100, // Amount is in cents
                    customerEmail: customerEmail,
                    sessionId: sessionId,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                };
                await salesCollectionRef.add(saleRecord);
                newSalesRecorded.push(productId);

                // Increment salesCount for the product
                const productDocRef = adminDb.doc(`artifacts/${process.env.NEXT_PUBLIC_FIREBASE_APP_ID}/public/data/products/${productId}`);
                await productDocRef.update({
                    salesCount: admin.firestore.FieldValue.increment(1),
                });
            }
        }

        return NextResponse.json({ 
            line_items: session.line_items.data,
            newSalesRecorded: newSalesRecorded,
        }, { status: 200 });

    } catch (error) {
        console.error('Stripe Verify Session Error:', error);
        return NextResponse.json({ message: 'Failed to verify Stripe session.', error: error.message }, { status: 500 });
    }
}