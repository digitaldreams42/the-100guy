// app/api/products/route.js
import { NextResponse } from 'next/server';
import { adminDb } from '../../../lib/firebase-admin';
import admin from 'firebase-admin';
import cloudinary from '../../../lib/cloudinary';
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
    const session = await getIronSession(cookies(), sessionOptions);
    if (!session.user || !session.user.isAdmin) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

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
            stock: parseInt(productData.stock, 10) || 0, // Inventory management
            salesCount: 0,
            lowStockThreshold: parseInt(productData.lowStockThreshold, 10) || 5, // For inventory alerts
            status: productData.status || 'published', // Added status field
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

// PUT: Update a product
export async function PUT(request) {
    const session = await getIronSession(cookies(), sessionOptions);
    if (!session.user || !session.user.isAdmin) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    try {
        const body = await request.json();
        const { id, ...updateData } = body;

        if (!id) {
            return NextResponse.json({ message: 'Product ID is required.' }, { status: 400 });
        }

        const productRef = getProductsCollection().doc(id);
        const productSnap = await productRef.get();

        if (!productSnap.exists) {
            return NextResponse.json({ message: 'Product not found.' }, { status: 404 });
        }

        // Prepare update data
        const updateObj = {};
        for (const [key, value] of Object.entries(updateData)) {
            if (['name', 'description', 'price', 'category', 'stock', 'lowStockThreshold', 'status', 'features'].includes(key)) {
                if (key === 'price') {
                    updateObj[key] = parseFloat(value);
                } else if (key === 'stock') {
                    updateObj[key] = parseInt(value, 10); // Inventory management
                } else if (key === 'lowStockThreshold') {
                    updateObj[key] = parseInt(value, 10);
                } else {
                    updateObj[key] = value;
                }
            }
        }

        updateObj.updatedAt = admin.firestore.FieldValue.serverTimestamp();

        await productRef.update(updateObj);

        // Fetch updated product to return
        const updatedSnap = await productRef.get();
        const updatedProduct = { id: updatedSnap.id, ...updatedSnap.data() };

        return NextResponse.json(updatedProduct, { status: 200 });
        } catch (error) { // Re-adding the catch block
        console.error('API PUT Product Error:', error);
        return NextResponse.json({ message: 'Failed to update product.', error: error.message }, { status: 500 });
    }
    }
