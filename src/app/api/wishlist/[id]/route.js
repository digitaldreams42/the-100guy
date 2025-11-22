// app/api/wishlist/[id]/route.js
import { NextResponse } from 'next/server';
import { adminDb } from '../../../../lib/firebase-admin';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';

const sessionOptions = {
  cookieName: 'gstore-session',
  password: process.env.SESSION_SECRET || 'complex_password_at_least_32_characters_long',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
};

// Reusable collection reference
const getWishlistCollection = (userId) => {
    const collectionPath = `artifacts/${process.env.NEXT_PUBLIC_FIREBASE_APP_ID}/public/data/users/${userId}/wishlist`;
    return adminDb.collection(collectionPath);
};

// DELETE: Remove item from user's wishlist
export async function DELETE(request, { params }) {
    try {
        const session = await getIronSession(cookies(), sessionOptions);
        if (!session.user || !session.user.uid) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        const userId = session.user.uid;

        const productId = params.id;

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