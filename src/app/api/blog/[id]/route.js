// app/api/blog/[id]/route.js
import { NextResponse } from 'next/server';
import { adminDb } from '../../../../lib/firebase-admin';

// Reusable collection reference for blog posts
const getBlogCollection = () => {
    const collectionPath = `artifacts/${process.env.NEXT_PUBLIC_FIREBASE_APP_ID}/public/data/blog`;
    return adminDb.collection(collectionPath);
};

// GET: Fetch a specific blog post
export async function GET(request, { params }) {
    try {
        const { id } = params;
        const doc = await getBlogCollection().doc(id).get();

        if (!doc.exists) {
            return NextResponse.json({ message: 'Blog post not found.' }, { status: 404 });
        }

        const post = { id: doc.id, ...doc.data() };
        return NextResponse.json(post, { status: 200 });
    } catch (error) {
        console.error('API GET Blog Post Error:', error);
        return NextResponse.json({ message: 'Failed to fetch blog post.', error: error.message }, { status: 500 });
    }
}

// PUT: Update a blog post
export async function PUT(request, { params }) {
    try {
        const { id } = params;
        const body = await request.json();
        const { title, content, excerpt, author, status, coverImage, tags } = body;

        // Validate required fields
        const requiredFields = ['title', 'content', 'excerpt', 'author'];
        for (const field of requiredFields) {
            if (!body[field]) {
                return NextResponse.json({ message: `Missing required field: ${field}` }, { status: 400 });
            }
        }

        const updateData = {
            title,
            content,
            excerpt,
            author,
            status: status || 'draft',
            coverImage: coverImage || null,
            tags: tags || [],
            updatedAt: adminDb.FieldValue.serverTimestamp(),
        };

        await getBlogCollection().doc(id).update(updateData);
        const updatedDoc = await getBlogCollection().doc(id).get();
        const updatedPost = { id: updatedDoc.id, ...updatedDoc.data() };

        return NextResponse.json(updatedPost, { status: 200 });
    } catch (error) {
        console.error('API PUT Blog Post Error:', error);
        return NextResponse.json({ message: 'Failed to update blog post.', error: error.message }, { status: 500 });
    }
}

// DELETE: Delete a blog post
export async function DELETE(request, { params }) {
    try {
        const { id } = params;
        const docRef = getBlogCollection().doc(id);

        const doc = await docRef.get();
        if (!doc.exists) {
            return NextResponse.json({ message: 'Blog post not found.' }, { status: 404 });
        }

        await docRef.delete();

        return NextResponse.json({ message: 'Blog post deleted successfully.' }, { status: 200 });
    } catch (error) {
        console.error('API DELETE Blog Post Error:', error);
        return NextResponse.json({ message: 'Failed to delete blog post.', error: error.message }, { status: 500 });
    }
}