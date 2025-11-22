// app/api/blog/route.js
import { NextResponse } from 'next/server';
import { adminDb } from '../../../lib/firebase-admin';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';

const sessionOptions = {
  cookieName: 'gstore-session',
  password: process.env.SESSION_SECRET || 'complex_password_at_least_32_characters_long',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
};

// Reusable collection reference for blog posts
const getBlogCollection = () => {
    const collectionPath = `artifacts/${process.env.NEXT_PUBLIC_FIREBASE_APP_ID}/public/data/blog`;
    return adminDb.collection(collectionPath);
};

// GET: Fetch all blog posts
export async function GET() {
    const session = await getIronSession(cookies(), sessionOptions);
    if (!session.user || !session.user.isAdmin) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const snapshot = await getBlogCollection().orderBy('createdAt', 'desc').get();
        if (snapshot.empty) {
            return NextResponse.json([], { status: 200 });
        }
        const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return NextResponse.json(posts, { status: 200 });
    } catch (error) {
        console.error('API GET Blog Posts Error:', error);
        return NextResponse.json({ message: 'Failed to fetch blog posts.', error: error.message }, { status: 500 });
    }
}

// POST: Create a new blog post
export async function POST(request) {
    const session = await getIronSession(cookies(), sessionOptions);
    if (!session.user || !session.user.isAdmin) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { title, content, excerpt, author, status, coverImage, tags } = body;

        // Validate required fields
        const requiredFields = ['title', 'content', 'excerpt', 'author'];
        for (const field of requiredFields) {
            if (!body[field]) {
                return NextResponse.json({ message: `Missing required field: ${field}` }, { status: 400 });
            }
        }

        const postData = {
            title,
            content,
            excerpt,
            author,
            status: status || 'draft',
            coverImage: coverImage || null,
            tags: tags || [],
            createdAt: adminDb.FieldValue.serverTimestamp(),
            updatedAt: adminDb.FieldValue.serverTimestamp(),
        };

        const docRef = await getBlogCollection().add(postData);
        const newPost = { id: docRef.id, ...postData };

        return NextResponse.json(newPost, { status: 201 });
    } catch (error) {
        console.error('API POST Blog Post Error:', error);
        return NextResponse.json({ message: 'Failed to create blog post.', error: error.message }, { status: 500 });
    }
}