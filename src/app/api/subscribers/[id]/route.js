// app/api/subscribers/[id]/route.js
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

// Reusable document reference
const getSubscriberDoc = (id) => {
    const docPath = `artifacts/${process.env.NEXT_PUBLIC_FIREBASE_APP_ID}/public/data/subscribers/${id}`;
    return adminDb.doc(docPath);
};

// DELETE: Delete a subscriber
export async function DELETE(request, { params }) {
    const session = await getIronSession(cookies(), sessionOptions);
    if (!session.user || !session.user.isAdmin) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    try {
        await getSubscriberDoc(id).delete();
        return NextResponse.json({ message: 'Subscriber deleted successfully.' }, { status: 200 });
    } catch (error) {
        console.error(`API DELETE Subscriber ${id} Error:`, error);
        return NextResponse.json({ message: 'Failed to delete subscriber.', error: error.message }, { status: 500 });
    }
}
