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
            // Convert Firestore Timestamps to ISO strings for all date fields
            const processedData = Object.entries(data).reduce((acc, [key, value]) => {
                if (value && typeof value.toDate === 'function') { // Check if it's a Firestore Timestamp
                    acc[key] = value.toDate().toISOString();
                } else {
                    acc[key] = value;
                }
                return acc;
            }, {});
            return { id: doc.id, ...processedData };
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
