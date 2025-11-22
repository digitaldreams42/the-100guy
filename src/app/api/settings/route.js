// app/api/settings/route.js
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

// Reference to site settings document
const getSettingsDoc = () => {
    const docPath = `artifacts/${process.env.NEXT_PUBLIC_FIREBASE_APP_ID}/public/data/settings`;
    return adminDb.doc(docPath);
};

// GET: Fetch site settings
export async function GET() {
    try {
        const doc = await getSettingsDoc().get();
        
        if (!doc.exists) {
            // Return default settings if the document doesn't exist yet
            return NextResponse.json({
                siteName: 'GStore',
                siteDescription: 'Your go-to store for digital products',
                siteLogo: '/logo.png',
                siteFavicon: '/favicon.ico',
                contactEmail: 'admin@example.com',
                socialLinks: {
                    twitter: '',
                    facebook: '',
                    instagram: '',
                    linkedin: ''
                },
                footerText: '© 2023 GStore. All rights reserved.',
                enableNewsletter: true,
                enableBlog: true,
                enableWishlist: true,
                analyticsId: '',
                theme: 'default',
                customCss: '',
                customJs: '',
                currency: 'USD',
                timezone: 'UTC',
                dateFormat: 'MM/DD/YYYY',
                timeFormat: 'HH:mm'
            }, { status: 200 });
        }

        return NextResponse.json(doc.data(), { status: 200 });

    } catch (error) {
        console.error('API GET Settings Error:', error);
        return NextResponse.json({ message: 'Failed to fetch site settings.', error: error.message }, { status: 500 });
    }
}

// PUT: Update site settings
export async function PUT(request) {
    const session = await getIronSession(cookies(), sessionOptions);
    if (!session.user || !session.user.isAdmin) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const settingsData = await request.json();
        
        // Validate required fields
        const requiredFields = ['siteName', 'siteDescription', 'contactEmail'];
        for (const field of requiredFields) {
            if (!settingsData[field]) {
                return NextResponse.json({ message: `Missing required field: ${field}` }, { status: 400 });
            }
        }

        // Update the settings document
        await getSettingsDoc().set(settingsData, { merge: true });

        // Return the updated settings
        const updatedDoc = await getSettingsDoc().get();
        return NextResponse.json(updatedDoc.data(), { status: 200 });

    } catch (error) {
        console.error('API PUT Settings Error:', error);
        return NextResponse.json({ message: 'Failed to update site settings.', error: error.message }, { status: 500 });
    }
}