// app/api/analytics/route.js
import { NextResponse } from 'next/server';
import { adminDb } from '../../../lib/firebase-admin';

export async function GET(request) {
    try {
        const analyticsDocRef = adminDb.doc(`artifacts/${process.env.NEXT_PUBLIC_FIREBASE_APP_ID}/public/data/analytics/summary`);
        const doc = await analyticsDocRef.get();

        if (!doc.exists) {
            // Return default values if the document doesn't exist yet
            return NextResponse.json({
                totalRevenue: 0,
                totalSalesCount: 0,
            }, { status: 200 });
        }
        
        return NextResponse.json(doc.data(), { status: 200 });

    } catch (error) {
        console.error('API GET Analytics Error:', error);
        return NextResponse.json({ message: 'Failed to fetch analytics data.', error: error.message }, { status: 500 });
    }
}
