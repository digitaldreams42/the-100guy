// app/api/products/[id]/route.js
import { NextResponse } from 'next/server';
import { adminDb } from '../../../../lib/firebase-admin';
import admin from 'firebase-admin';
import cloudinary from '../../../../lib/cloudinary';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';

const sessionOptions = {
  cookieName: 'gstore-session',
  password: process.env.SESSION_SECRET || 'complex_password_at_least_32_characters_long',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
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

// Helper function to extract public ID from Cloudinary URL
function extractPublicIdFromCloudinaryUrl(url) {
    const regex = /\/v\d+\/(.+)\.\w{3,4}$/;
    const match = url.match(regex);
    if (match && match[1]) {
        return match[1];
    }
    return null;
}

// Reusable document reference
const getProductDoc = (id) => {
    const docPath = `artifacts/${process.env.NEXT_PUBLIC_FIREBASE_APP_ID}/public/data/products/${id}`;
    return adminDb.doc(docPath);
};

// GET: Fetch a single product
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
    const session = await getIronSession(cookies(), sessionOptions);
    if (!session.user || !session.user.isAdmin) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = params;
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
            } else {
                productData[key] = value;
            }
        }

        if (!productData) {
            return NextResponse.json({ message: 'Product data is required.' }, { status: 400 });
        }

        const dataToUpdate = {
            ...productData,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        if (productData.price) {
            dataToUpdate.price = parseFloat(productData.price);
        }
        if (productData.stock) {
            dataToUpdate.stock = parseInt(productData.stock, 10);
        }

        if (coverImageFile) {
            dataToUpdate.coverImage = await uploadFileToCloudinary(coverImageFile, 'product_covers', 'image');
        } else if (productData.coverImage) {
            dataToUpdate.coverImage = productData.coverImage;
        }

        if (productFileFile) {
            dataToUpdate.productFile = await uploadFileToCloudinary(productFileFile, 'product_files', 'auto');
        } else if (productData.productFile) {
            dataToUpdate.productFile = productData.productFile;
        }

        delete dataToUpdate.id;
        delete dataToUpdate.createdAt;
        delete dataToUpdate.salesCount;

        await getProductDoc(id).update(dataToUpdate);

        const updatedDoc = await getProductDoc(id).get();

        return NextResponse.json({ id: updatedDoc.id, ...updatedDoc.data() }, { status: 200 });
    } catch (error) {
        console.error(`API PUT Product ${params.id} Error:`, error);
        return NextResponse.json({ message: 'Failed to update product.', error: error.message }, { status: 500 });
    }
}

// DELETE: Delete a product
export async function DELETE(request, { params }) {
    const session = await getIronSession(cookies(), sessionOptions);
    if (!session.user || !session.user.isAdmin) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = params;
        const productRef = getProductDoc(id);
        const productDoc = await productRef.get();

        if (!productDoc.exists) {
            return NextResponse.json({ message: 'Product not found.' }, { status: 404 });
        }

        const productData = productDoc.data();

        if (productData.coverImage) {
            const publicId = extractPublicIdFromCloudinaryUrl(productData.coverImage);
            if (publicId) {
                await cloudinary.uploader.destroy(publicId);
            }
        }

        if (productData.productFile) {
            const publicId = extractPublicIdFromCloudinaryUrl(productData.productFile);
            if (publicId) {
                await cloudinary.uploader.destroy(publicId, { resource_type: 'auto' });
            }
        }

        await productRef.delete();
        return NextResponse.json({ message: 'Product deleted successfully.' }, { status: 200 });
    } catch (error) {
        console.error(`API DELETE Product ${params.id} Error:`, error);
        return NextResponse.json({ message: 'Failed to delete product.', error: error.message }, { status: 500 });
    }
}