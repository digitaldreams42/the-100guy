// app/api/broadcast/route.js
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { db } from '../../../lib/firebase'; // We need the admin instance to fetch data server-side
import { collection, getDocs } from 'firebase/firestore';

// Helper to get all subscribers from Firestore
async function getAllSubscribers() {
    const subscribersCollection = collection(db, 'artifacts', process.env.NEXT_PUBLIC_FIREBASE_APP_ID, 'public', 'data', 'subscribers');
    const snapshot = await getDocs(subscribersCollection);
    if (snapshot.empty) {
        console.log('No subscribers found.');
        return [];
    }
    return snapshot.docs.map(doc => doc.data().email);
}

export async function POST(request) {
    try {
        const { subject, htmlContent } = await request.json();

        if (!subject || !htmlContent) {
            return NextResponse.json({ message: 'Subject and content are required.' }, { status: 400 });
        }

        // 1. Configure Nodemailer transporter
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
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
            from: process.env.EMAIL_FROM,
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
