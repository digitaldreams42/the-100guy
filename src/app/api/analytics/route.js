// app/api/analytics/route.js
import { NextResponse } from 'next/server';
import { adminDb } from '../../../lib/firebase-admin';
import { calculateStoreAnalytics, getPeriodAnalytics, formatAnalyticsForDisplay } from '../../../lib/analytics-service';

// Reusable collection references
const getSalesCollection = () => {
    const collectionPath = `artifacts/${process.env.NEXT_PUBLIC_FIREBASE_APP_ID}/public/data/sales`;
    return adminDb.collection(collectionPath);
};

const getProductsCollection = () => {
    const collectionPath = `artifacts/${process.env.NEXT_PUBLIC_FIREBASE_APP_ID}/public/data/products`;
    return adminDb.collection(collectionPath);
};

const getSubscribersCollection = () => {
    const collectionPath = `artifacts/${process.env.NEXT_PUBLIC_FIREBASE_APP_ID}/public/data/subscribers`;
    return adminDb.collection(collectionPath);
};

export async function GET(request) {
    try {
        // Fetch all necessary data from Firestore
        const [salesSnapshot, productsSnapshot, subscribersSnapshot] = await Promise.all([
            getSalesCollection().get(),
            getProductsCollection().get(),
            getSubscribersCollection().get()
        ]);

        // Convert Firestore data to arrays
        const salesData = salesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date() // Convert Firestore timestamp to Date
        }));

        const productsData = productsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        const subscriberData = subscribersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Calculate analytics using the service
        const rawAnalytics = await calculateStoreAnalytics(salesData, productsData, subscriberData);

        // Calculate period-based analytics
        const periodData = {
            day: getPeriodAnalytics(salesData, 'day'),
            week: getPeriodAnalytics(salesData, 'week'),
            month: getPeriodAnalytics(salesData, 'month'),
        };

        // Combine with additional metrics
        const analytics = {
            ...rawAnalytics,
            ...periodData,
            totalProducts: productsData.length,
            totalSubscribers: subscriberData.length,
        };

        // Format for display
        const formattedAnalytics = formatAnalyticsForDisplay(analytics);

        return NextResponse.json(formattedAnalytics, { status: 200 });

    } catch (error) {
        console.error('API GET Analytics Error:', error);
        return NextResponse.json({ message: 'Failed to fetch analytics data.', error: error.message }, { status: 500 });
    }
}
