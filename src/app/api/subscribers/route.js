// app/api/subscribers/route.js
import { NextResponse } from 'next/server';
import { adminDb } from '../../../lib/firebase-admin';
import admin from 'firebase-admin';

// Reusable collection reference
const getSubscribersCollection = () => {
    const collectionPath = `artifacts/${process.env.NEXT_PUBLIC_FIREBASE_APP_ID}/public/data/subscribers`;
    return adminDb.collection(collectionPath);
};

// GET: Fetch all subscribers
export async function GET() {
    try {
        const snapshot = await getSubscribersCollection().get();
        if (snapshot.empty) {
            return NextResponse.json([], { status: 200 });
        }
        const subscribers = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                subscribedAt: data.subscribedAt.toDate().toISOString(),
            };
        });
        return NextResponse.json(subscribers, { status: 200 });
    } catch (error) {
        console.error('API GET Subscribers Error:', error);
        return NextResponse.json({ message: 'Failed to fetch subscribers.', error: error.message }, { status: 500 });
    }
}

// POST: Create a new subscriber (for example, from a newsletter signup)
export async function POST(request) {
    try {
        const subscriberData = await request.json();

        // Basic validation
        if (!subscriberData || !subscriberData.email) {
            return NextResponse.json({ message: 'Email is required for subscription.' }, { status: 400 });
        }

        // Check for duplicate email
        const existingSubscriber = await getSubscribersCollection().where('email', '==', subscriberData.email).limit(1).get();
        if (!existingSubscriber.empty) {
            return NextResponse.json({ message: 'This email is already subscribed.' }, { status: 409 }); // 409 Conflict
        }

        const dataToSave = {
            ...subscriberData,
            subscribedAt: admin.firestore.FieldValue.serverTimestamp(),
            status: 'active',
            tags: ['website_signup']
        };

        const docRef = await getSubscribersCollection().add(dataToSave);

        return NextResponse.json({ id: docRef.id, ...dataToSave }, { status: 201 });
    } catch (error) {
        console.error('API POST Subscriber Error:', error);
        return NextResponse.json({ message: 'Failed to create subscriber.', error: error.message }, { status: 500 });
    }
}
