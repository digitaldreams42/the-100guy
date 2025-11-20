// app/api/products/route.js
import { NextResponse } from 'next/server';
import { adminDb } from '../../../lib/firebase-admin';
import admin from 'firebase-admin';

// Reusable collection reference
const getProductsCollection = () => {
    const collectionPath = `artifacts/${process.env.NEXT_PUBLIC_FIREBASE_APP_ID}/public/data/products`;
    return adminDb.collection(collectionPath);
};

// GET: Fetch all products
export async function GET() {
    try {
        const snapshot = await getProductsCollection().get();
        if (snapshot.empty) {
            return NextResponse.json([], { status: 200 });
        }
        const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return NextResponse.json(products, { status: 200 });
    } catch (error) {
        console.error('API GET Products Error:', error);
        return NextResponse.json({ message: 'Failed to fetch products.', error: error.message }, { status: 500 });
    }
}

// POST: Create a new product
export async function POST(request) {
    try {
        const productData = await request.json();

        // Basic validation
        if (!productData || !productData.title || !productData.price) {
            return NextResponse.json({ message: 'Title and price are required.' }, { status: 400 });
        }

        const dataToSave = {
            ...productData,
            price: parseFloat(productData.price),
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            status: productData.status || 'draft',
            downloads: 0
        };

        const docRef = await getProductsCollection().add(dataToSave);

        return NextResponse.json({ id: docRef.id, ...dataToSave }, { status: 201 });
    } catch (error) {
        console.error('API POST Product Error:', error);
        return NextResponse.json({ message: 'Failed to create product.', error: error.message }, { status: 500 });
    }
}
