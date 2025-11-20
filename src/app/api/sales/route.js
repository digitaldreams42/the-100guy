// app/api/sales/route.js
import { NextResponse } from 'next/server';
import { adminDb } from '../../../lib/firebase-admin';
import admin from 'firebase-admin'; // Import admin for FieldValue.serverTimestamp()

// Reusable collection reference
const getSalesCollection = () => {
    const collectionPath = `artifacts/${process.env.NEXT_PUBLIC_FIREBASE_APP_ID}/public/data/sales`;
    return adminDb.collection(collectionPath);
};

// GET: Fetch all sales
export async function GET() {
    try {
        const snapshot = await getSalesCollection().get();
        if (snapshot.empty) {
            return NextResponse.json([], { status: 200 });
        }
        const sales = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return NextResponse.json(sales, { status: 200 });
    } catch (error) {
        console.error('API GET Sales Error:', error);
        return NextResponse.json({ message: 'Failed to fetch sales.', error: error.message }, { status: 500 });
    }
}

// POST: Create a new sale record
export async function POST(request) {
    try {
        const { item, customerEmail } = await request.json();

        if (!item || !item.id || !customerEmail) {
            return NextResponse.json({ message: 'Item ID and customer email are required.' }, { status: 400 });
        }

        const dataToSave = {
            productId: item.id,
            productTitle: item.title,
            amount: item.price,
            customerEmail: customerEmail,
            status: 'completed',
            type: item.type,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };

        const docRef = await getSalesCollection().add(dataToSave);

        return NextResponse.json({ id: docRef.id, ...dataToSave }, { status: 201 });
    } catch (error) {
        console.error('API POST Sale Error:', error);
        return NextResponse.json({ message: 'Failed to create sale record.', error: error.message }, { status: 500 });
    }
}