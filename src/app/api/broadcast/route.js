// app/api/broadcast/route.js
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { adminDb } from '../../../lib/firebase-admin'; // Use the server-side admin instance
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';

const sessionOptions = {
  cookieName: 'gstore-session',
  password: process.env.SESSION_SECRET || 'complex_password_at_least_32_characters_long',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
};

// Helper to get all subscribers from Firestore using Admin SDK
async function getAllSubscribers() {
    // Note: Ensure your environment variables are available in your deployment environment.
    const collectionPath = `artifacts/${process.env.NEXT_PUBLIC_FIREBASE_APP_ID}/public/data/subscribers`;
    const subscribersCollectionRef = adminDb.collection(collectionPath);
    
    const snapshot = await subscribersCollectionRef.get();
    
    if (snapshot.empty) {
        console.log('No subscribers found in database.');
        return [];
    }
    
    return snapshot.docs.map(doc => doc.data().email);
}

export async function POST(request) {
    const session = await getIronSession(cookies(), sessionOptions);
    if (!session.user || !session.user.isAdmin) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { subject, htmlContent } = await request.json();

        if (!subject || !htmlContent) {
            return NextResponse.json({ message: 'Subject and content are required.' }, { status: 400 });
        }

        // 1. Configure Nodemailer transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASS,
            },
        });

        // 2. Fetch all subscribers
        const subscribers = await getAllSubscribers();

        if (subscribers.length === 0) {
            return NextResponse.json({ message: 'Broadcast not sent: No subscribers to send to.' }, { status: 400 });
        }
        
        console.log(`Starting broadcast to ${subscribers.length} subscribers...`);

        // 3. Send email to all subscribers
        // In a real large-scale app, this should be a background job.
        // For now, we send it directly. BCC is used to protect subscriber privacy.
        const mailOptions = {
            from: process.env.EMAIL,
            bcc: subscribers, // Send to all subscribers via BCC
            subject: subject,
            html: htmlContent,
        };

        await transporter.sendMail(mailOptions);
        
        console.log('Broadcast sent successfully.');

        return NextResponse.json({ message: `Broadcast sent to ${subscribers.length} subscribers.` }, { status: 200 });

    } catch (error) {
        console.error('API Broadcast Error:', error);
        return NextResponse.json({ message: 'Failed to send broadcast.', error: error.message }, { status: 500 });
    }
}
