// app/api/products/[id]/route.js
import { NextResponse } from 'next/server';
import { adminDb } from '../../../../lib/firebase-admin';
import admin from 'firebase-admin';

// Reusable document reference
const getProductDoc = (id) => {
    const docPath = `artifacts/${process.env.NEXT_PUBLIC_FIREBASE_APP_ID}/public/data/products/${id}`;
    return adminDb.doc(docPath);
};

// GET: Fetch a single product (optional, good practice to have)
export async function GET(request, { params }) {
    try {
        const { id } = params;
        const doc = await getProductDoc(id).get();

        if (!doc.exists) {
            return NextResponse.json({ message: 'Product not found.' }, { status: 404 });
        }

        return NextResponse.json({ id: doc.id, ...doc.data() }, { status: 200 });
    } catch (error) {
        console.error(`API GET Product ${params.id} Error:`, error);
        return NextResponse.json({ message: 'Failed to fetch product.', error: error.message }, { status: 500 });
    }
}

// PUT: Update an existing product
export async function PUT(request, { params }) {
    try {
        const { id } = params;
        const productData = await request.json();

        // Basic validation
        if (!productData) {
            return NextResponse.json({ message: 'Product data is required.' }, { status: 400 });
        }

        const dataToUpdate = {
            ...productData,
            price: parseFloat(productData.price),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };
        // Remove fields that should not be overwritten
        delete dataToUpdate.id;
        delete dataToUpdate.createdAt;

        await getProductDoc(id).update(dataToUpdate);

        return NextResponse.json({ message: 'Product updated successfully.' }, { status: 200 });
    } catch (error) {
        console.error(`API PUT Product ${params.id} Error:`, error);
        return NextResponse.json({ message: 'Failed to update product.', error: error.message }, { status: 500 });
    }
}

// DELETE: Delete a product
export async function DELETE(request, { params }) {
    try {
        const { id } = params;
        await getProductDoc(id).delete();
        return NextResponse.json({ message: 'Product deleted successfully.' }, { status: 200 });
    } catch (error) {
        console.error(`API DELETE Product ${params.id} Error:`, error);
        return NextResponse.json({ message: 'Failed to delete product.', error: error.message }, { status: 500 });
    }
}
