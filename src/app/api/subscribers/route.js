// app/api/subscribers/route.js
import { NextResponse } from 'next/server';
import { adminDb } from '../../../lib/firebase-admin';
import admin from 'firebase-admin';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import nodemailer from 'nodemailer';

const sessionOptions = {
  cookieName: 'gstore-session',
  password: process.env.SESSION_SECRET || 'complex_password_at_least_32_characters_long',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
};

// Create email transporter
const createEmailTransporter = () => {
    if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.warn('Email configuration missing. Email notifications will be disabled.');
        return null;
    }

    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT),
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
};

// Send welcome email
const sendWelcomeEmail = async (email) => {
    const transporter = createEmailTransporter();

    if (!transporter) {
        console.log('Email transporter not configured. Skipping welcome email.');
        return { success: true, message: 'Email transporter not configured, but subscription continued' };
    }

    try {
        const mailOptions = {
            from: process.env.SMTP_FROM || process.env.SMTP_USER,
            to: email,
            subject: 'Welcome to the George K. Community!',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #333; text-align: center;">Welcome!</h1>
                    <p>Hi there,</p>
                    <p>Thank you for subscribing to our newsletter. You're now part of our community of entrepreneurs and creators.</p>

                    <p>We'll keep you updated with the latest tips, product releases, and exclusive offers.</p>

                    <p>Best regards,<br>
                    The George K. Team</p>
                </div>
            `,
        };

        const result = await transporter.sendMail(mailOptions);
        console.log('Welcome email sent successfully to:', email);
        return { success: true, messageId: result.messageId };
    } catch (error) {
        console.error('Error sending welcome email:', error);
        return { success: false, message: error.message };
    }
};

// Reusable collection reference
const getSubscribersCollection = () => {
    const collectionPath = `artifacts/${process.env.NEXT_PUBLIC_FIREBASE_APP_ID}/public/data/subscribers`;
    return adminDb.collection(collectionPath);
};

// GET: Fetch all subscribers
export async function GET() {
    const session = await getIronSession(cookies(), sessionOptions);
    if (!session.user || !session.user.isAdmin) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const snapshot = await getSubscribersCollection().get();
        if (snapshot.empty) {
            return NextResponse.json([], { status: 200 });
        }
        const subscribers = snapshot.docs.map(doc => {
            const data = doc.data();
            // Convert Firestore Timestamps to ISO strings for all date fields
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
        return NextResponse.json(subscribers, { status: 200 });
    } catch (error) {
        console.error('API GET Subscribers Error:', error);
        return NextResponse.json({ message: 'Failed to fetch subscribers.', error: error.message }, { status: 500 });
    }
}

// POST: Create a new subscriber (for example, from a newsletter signup)
export async function POST(request) {
    try {
        const subscriberData = await request.json();

        // Basic validation
        if (!subscriberData || !subscriberData.email) {
            return NextResponse.json({ message: 'Email is required for subscription.' }, { status: 400 });
        }

        // Check for duplicate email
        const existingSubscriber = await getSubscribersCollection().where('email', '==', subscriberData.email).limit(1).get();
        if (!existingSubscriber.empty) {
            return NextResponse.json({ message: 'This email is already subscribed.' }, { status: 409 }); // 409 Conflict
        }

        const dataToSave = {
            ...subscriberData,
            subscribedAt: admin.firestore.FieldValue.serverTimestamp(),
            status: 'active',
            tags: ['website_signup']
        };

        const docRef = await getSubscribersCollection().add(dataToSave);

        // Send welcome email asynchronously (don't wait for it to complete)
        try {
            await sendWelcomeEmail(subscriberData.email);
        } catch (emailError) {
            // Log the error but don't fail the subscription if email sending fails
            console.error('Failed to send welcome email:', emailError);
        }

        return NextResponse.json({ id: docRef.id, ...dataToSave }, { status: 201 });
    } catch (error) {
        console.error('API POST Subscriber Error:', error);
        return NextResponse.json({ message: 'Failed to create subscriber.', error: error.message }, { status: 500 });
    }
}
