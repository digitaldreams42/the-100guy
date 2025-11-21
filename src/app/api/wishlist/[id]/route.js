// app/api/wishlist/[id]/route.js
import { NextResponse } from 'next/server';
import { adminDb } from '../../../../lib/firebase-admin';

// Reusable collection reference
const getWishlistCollection = (userId) => {
    const collectionPath = `artifacts/${process.env.NEXT_PUBLIC_FIREBASE_APP_ID}/public/data/users/${userId}/wishlist`;
    return adminDb.collection(collectionPath);
};

// DELETE: Remove item from user's wishlist
export async function DELETE(request, { params }) {
    try {
        const productId = params.id;
        const requestBody = await request.json();
        const userId = requestBody.userId;

        if (!userId || !productId) {
            return NextResponse.json({ message: 'User ID and Product ID are required.' }, { status: 400 });
        }

        // Find the document with the specific product ID
        const wishlistRef = getWishlistCollection(userId);
        const querySnapshot = await wishlistRef.where('productId', '==', productId).get();

        if (querySnapshot.empty) {
            return NextResponse.json({ message: 'Item not found in wishlist.' }, { status: 404 });
        }

        // Delete the document
        const docToDelete = querySnapshot.docs[0];
        await docToDelete.ref.delete();

        return NextResponse.json({ message: 'Item removed from wishlist successfully.' }, { status: 200 });
    } catch (error) {
        console.error('API DELETE Wishlist Error:', error);
        return NextResponse.json({ message: 'Failed to remove item from wishlist.', error: error.message }, { status: 500 });
    }
}