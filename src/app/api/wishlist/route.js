// app/api/wishlist/route.js
import { NextResponse } from 'next/server';
import { adminDb } from '../../../lib/firebase-admin';
import admin from 'firebase-admin'; // Import admin for FieldValue.serverTimestamp()

// Reusable collection references
const getWishlistCollection = (userId) => {
    const collectionPath = `artifacts/${process.env.NEXT_PUBLIC_FIREBASE_APP_ID}/public/data/users/${userId}/wishlist`;
    return adminDb.collection(collectionPath);
};

// GET: Fetch user's wishlist
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ message: 'User ID is required.' }, { status: 400 });
        }

        const wishlistRef = getWishlistCollection(userId);
        const snapshot = await wishlistRef.get();

        if (snapshot.empty) {
            return NextResponse.json([], { status: 200 });
        }

        const wishlistItems = snapshot.docs.map(doc => {
            const data = doc.data();
            // Convert Firestore Timestamps to ISO strings
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

        return NextResponse.json(wishlistItems, { status: 200 });
    } catch (error) {
        console.error('API GET Wishlist Error:', error);
        return NextResponse.json({ message: 'Failed to fetch wishlist.', error: error.message }, { status: 500 });
    }
}

// POST: Add item to user's wishlist
export async function POST(request) {
    try {
        const { userId, productId, productData } = await request.json();

        if (!userId || !productId || !productData) {
            return NextResponse.json({ message: 'User ID, Product ID, and Product Data are required.' }, { status: 400 });
        }

        // Check if item already exists in wishlist
        const wishlistRef = getWishlistCollection(userId);
        const existingItem = await wishlistRef.where('productId', '==', productId).limit(1).get();

        if (!existingItem.empty) {
            return NextResponse.json({ message: 'Item already in wishlist.' }, { status: 409 });
        }

        const dataToSave = {
            ...productData,
            productId: productId,
            addedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        const docRef = await wishlistRef.add(dataToSave);

        return NextResponse.json({ id: docRef.id, ...dataToSave }, { status: 201 });
    } catch (error) {
        console.error('API POST Wishlist Error:', error);
        return NextResponse.json({ message: 'Failed to add item to wishlist.', error: error.message }, { status: 500 });
    }
}