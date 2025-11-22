// app/api/products/route.js
import { NextResponse } from 'next/server';
import { adminDb } from '../../../lib/firebase-admin';
import admin from 'firebase-admin';
import cloudinary from '../../../lib/cloudinary';

// Reusable collection reference
const getProductsCollection = () => {
    const collectionPath = `artifacts/${process.env.NEXT_PUBLIC_FIREBASE_APP_ID}/public/data/products`;
    return adminDb.collection(collectionPath);
};

// Helper function to upload files to Cloudinary
async function uploadFileToCloudinary(file, folder, resourceType = 'image') {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: `gstore/${folder}`,
                resource_type: resourceType,
            },
            (error, result) => {
                if (error) {
                    console.error('Cloudinary upload error:', error);
                    return reject(new Error('Cloudinary upload failed'));
                }
                resolve(result.secure_url);
            }
        );
        uploadStream.end(buffer);
    });
}

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
        const formData = await request.formData();

        const productData = {};
        let coverImageFile = null;
        let productFileFile = null;

        for (const [key, value] of formData.entries()) {
            if (key === 'coverImageFile' && typeof value === 'object') {
                coverImageFile = value;
            } else if (key === 'productFileFile' && typeof value === 'object') {
                productFileFile = value;
            } else if (key === 'features') {
                try {
                    productData[key] = JSON.parse(value);
                } catch (e) {
                    console.error("Failed to parse features JSON:", e);
                    return NextResponse.json({ message: 'Invalid features format.' }, { status: 400 });
                }
            }
            else {
                productData[key] = value;
            }
        }

        // Validate required fields
        const requiredFields = ['name', 'description', 'price', 'category'];
        for (const field of requiredFields) {
            if (!productData[field]) {
                return NextResponse.json({ message: `Missing required field: ${field}` }, { status: 400 });
            }
        }

        const dataToSave = {
            ...productData,
            price: parseFloat(productData.price),
            stock: parseInt(productData.stock, 10) || 0,
            salesCount: 0,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        // Handle cover image upload
        if (coverImageFile) {
            dataToSave.coverImage = await uploadFileToCloudinary(coverImageFile, 'product_covers', 'image');
        } else if (productData.coverImage) {
            dataToSave.coverImage = productData.coverImage;
        } else {
            return NextResponse.json({ message: 'Missing required field: coverImage' }, { status: 400 });
        }


        // Handle product file upload
        if (productFileFile) {
            dataToSave.productFile = await uploadFileToCloudinary(productFileFile, 'product_files', 'auto');
        } else if (productData.productFile) {
            dataToSave.productFile = productData.productFile;
        } else {
            return NextResponse.json({ message: 'Missing required field: productFile' }, { status: 400 });
        }

        const docRef = await getProductsCollection().add(dataToSave);
        const newProduct = { id: docRef.id, ...dataToSave };

        return NextResponse.json(newProduct, { status: 201 });
    } catch (error) {
        console.error('API POST Product Error:', error);
        return NextResponse.json({ message: 'Failed to create product.', error: error.message }, { status: 500 });
    }
}