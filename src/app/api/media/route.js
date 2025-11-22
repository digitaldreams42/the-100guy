// app/api/media/route.js
import { NextResponse } from 'next/server';
import { adminDb } from '../../../lib/firebase-admin';
import cloudinary from '../../../lib/cloudinary';
import admin from 'firebase-admin';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';

const sessionOptions = {
  cookieName: 'gstore-session',
  password: process.env.SESSION_SECRET || 'complex_password_at_least_32_characters_long',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
};

// Reference to media collection
const getMediaCollection = () => {
    const collectionPath = `artifacts/${process.env.NEXT_PUBLIC_FIREBASE_APP_ID}/public/data/media`;
    return adminDb.collection(collectionPath);
};

// Upload to Cloudinary helper
async function uploadToCloudinary(fileBuffer, folder, resourceType = 'image') {
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
                resolve(result);
            }
        );
        uploadStream.end(fileBuffer);
    });
}

// GET: Fetch all media items
export async function GET(request) {
    const session = await getIronSession(cookies(), sessionOptions);
    if (!session.user || !session.user.isAdmin) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type'); // Filter by type: image, video, document, etc.

        let query = getMediaCollection();
        
        if (type) {
            query = query.where('type', '==', type);
        }
        
        query = query.orderBy('createdAt', 'desc');

        const snapshot = await query.get();
        
        if (snapshot.empty) {
            return NextResponse.json([], { status: 200 });
        }

        const mediaItems = snapshot.docs.map(doc => {
            const data = doc.data();
            // Convert Firestore Timestamps to ISO strings
            const processedData = Object.entries(data).reduce((acc, [key, value]) => {
                if (value && typeof value.toDate === 'function') { // Check if it's a Firestore Timestamp
                    acc[key] = value.toDate().toISOString();
                } else {
                    acc[key] = value;
                }
                return acc;
            }, {});
            return { id: doc.id, ...processedData };
        });

        return NextResponse.json(mediaItems, { status: 200 });

    } catch (error) {
        console.error('API GET Media Error:', error);
        return NextResponse.json({ message: 'Failed to fetch media items.', error: error.message }, { status: 500 });
    }
}

// POST: Upload a new media item
export async function POST(request) {
    const session = await getIronSession(cookies(), sessionOptions);
    if (!session.user || !session.user.isAdmin) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const formData = await request.formData();
        const file = formData.get('file');
        const folder = formData.get('folder') || 'general';
        const altText = formData.get('altText') || '';
        const description = formData.get('description') || '';

        if (!file) {
            return NextResponse.json({ message: 'No file provided.' }, { status: 400 });
        }

        // Convert file to buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Determine resource type based on file type
        const fileType = file.type || 'file';
        const resourceType = fileType.startsWith('image/') ? 'image' : 
                            fileType.startsWith('video/') ? 'video' : 'raw';

        // Upload to Cloudinary
        const cloudinaryResult = await uploadToCloudinary(buffer, folder, resourceType);

        // Save metadata to Firestore
        const mediaData = {
            publicId: cloudinaryResult.public_id,
            url: cloudinaryResult.secure_url,
            type: resourceType,
            format: cloudinaryResult.format,
            size: cloudinaryResult.bytes,
            altText,
            description,
            folder,
            originalName: file.name,
            uploadedBy: 'admin', // This would come from auth in a real implementation
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        const docRef = await getMediaCollection().add(mediaData);
        const newMedia = { id: docRef.id, ...mediaData };

        return NextResponse.json(newMedia, { status: 201 });

    } catch (error) {
        console.error('API POST Media Error:', error);
        return NextResponse.json({ message: 'Failed to upload media.', error: error.message }, { status: 500 });
    }
}

// DELETE: Delete a media item
export async function DELETE(request) {
    const session = await getIronSession(cookies(), sessionOptions);
    if (!session.user || !session.user.isAdmin) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const publicId = searchParams.get('publicId');

        if (!id || !publicId) {
            return NextResponse.json({ message: 'Media ID and Public ID are required.' }, { status: 400 });
        }

        // Delete from Cloudinary
        await cloudinary.uploader.destroy(publicId);

        // Delete from Firestore
        const mediaRef = getMediaCollection().doc(id);
        await mediaRef.delete();

        return NextResponse.json({ message: 'Media item deleted successfully.' }, { status: 200 });

    } catch (error) {
        console.error('API DELETE Media Error:', error);
        return NextResponse.json({ message: 'Failed to delete media item.', error: error.message }, { status: 500 });
    }
}