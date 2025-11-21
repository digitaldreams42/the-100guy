// app/api/blog/published/route.js
import { NextResponse } from 'next/server';
import { adminDb } from '../../../../lib/firebase-admin';

// Reusable collection reference for blog posts
const getBlogCollection = () => {
    const collectionPath = `artifacts/${process.env.NEXT_PUBLIC_FIREBASE_APP_ID}/public/data/blog`;
    return adminDb.collection(collectionPath);
};

// GET: Fetch all published blog posts
export async function GET() {
    try {
        const snapshot = await getBlogCollection()
            .where('status', '==', 'published')
            .orderBy('createdAt', 'desc')
            .get();
        
        if (snapshot.empty) {
            return NextResponse.json([], { status: 200 });
        }
        const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return NextResponse.json(posts, { status: 200 });
    } catch (error) {
        console.error('API GET Published Blog Posts Error:', error);
        return NextResponse.json({ message: 'Failed to fetch published blog posts.', error: error.message }, { status: 500 });
    }
}