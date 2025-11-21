// app/api/sales/route.js
import { NextResponse } from 'next/server';
import { adminDb } from '../../../lib/firebase-admin';
import admin from 'firebase-admin'; // Import admin for FieldValue.serverTimestamp()

// For email functionality in a server component, we'll import the service
// but only use it in server-side code
import nodemailer from 'nodemailer';

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

// Send order confirmation email
const sendOrderConfirmation = async (customerEmail, orderDetails) => {
    const transporter = createEmailTransporter();

    if (!transporter) {
        console.log('Email transporter not configured. Skipping email notification.');
        return { success: true, message: 'Email transporter not configured, but order processing continued' };
    }

    try {
        const mailOptions = {
            from: process.env.SMTP_FROM || process.env.SMTP_USER,
            to: customerEmail,
            subject: 'Order Confirmation - Your Purchase is Complete!',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #333; text-align: center;">Order Confirmation</h1>
                    <p>Hi there,</p>
                    <p>Thank you for your purchase! Your order has been processed successfully.</p>

                    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
                        <h3>Order Details:</h3>
                        <p><strong>Order ID:</strong> ${orderDetails.id}</p>
                        <p><strong>Product:</strong> ${orderDetails.productTitle}</p>
                        <p><strong>Price:</strong> $${orderDetails.amount?.toFixed(2)}</p>
                        <p><strong>Date:</strong> ${new Date(orderDetails.createdAt).toLocaleString()}</p>
                    </div>

                    <p>You will receive another email once your product is ready for download.</p>
                    <p>If you have any questions, feel free to reply to this email.</p>

                    <p>Best regards,<br>
                    The George K. Team</p>
                </div>
            `,
        };

        const result = await transporter.sendMail(mailOptions);
        console.log('Order confirmation email sent successfully to:', customerEmail);
        return { success: true, messageId: result.messageId };
    } catch (error) {
        console.error('Error sending order confirmation email:', error);
        return { success: false, message: error.message };
    }
};

// Reusable collection references
const getSalesCollection = () => {
    const collectionPath = `artifacts/${process.env.NEXT_PUBLIC_FIREBASE_APP_ID}/public/data/sales`;
    return adminDb.collection(collectionPath);
};

const getProductsCollection = () => {
    const collectionPath = `artifacts/${process.env.NEXT_PUBLIC_FIREBASE_APP_ID}/public/data/products`;
    return adminDb.collection(collectionPath);
};

// GET: Fetch all sales or filter by customer email
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const customerEmail = searchParams.get('customerEmail');

        let query = getSalesCollection();

        if (customerEmail) {
            // Filter sales by customer email for user-specific orders
            query = query.where('customerEmail', '==', customerEmail).orderBy('createdAt', 'desc');
        } else {
            // Order by createdAt for all sales
            query = query.orderBy('createdAt', 'desc');
        }

        const snapshot = await query.get();
        if (snapshot.empty) {
            return NextResponse.json([], { status: 200 });
        }

        const sales = snapshot.docs.map(doc => {
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

        return NextResponse.json(sales, { status: 200 });
    } catch (error) {
        console.error('API GET Sales Error:', error);
        return NextResponse.json({ message: 'Failed to fetch sales.', error: error.message }, { status: 500 });
    }
}

// POST: Create a new sale record
export async function POST(request) {
    try {
        const { item, customerEmail } = await request.json();

        if (!item || !item.id || !customerEmail) {
            return NextResponse.json({ message: 'Item ID and customer email are required.' }, { status: 400 });
        }

        // First, check product inventory if applicable (for physical products)
        const productRef = getProductsCollection().doc(item.id);
        const productSnap = await productRef.get();

        if (productSnap.exists) {
            const productData = productSnap.data();

            // For products with limited inventory, check and update stock
            if (productData.stock !== undefined && productData.stock !== null) {
                if (productData.stock <= 0) {
                    return NextResponse.json({ message: 'This product is out of stock.' }, { status: 400 });
                }

                // Update product stock (decrease by 1 for this sale)
                await productRef.update({
                    stock: admin.firestore.FieldValue.increment(-1),
                    salesCount: admin.firestore.FieldValue.increment(1)
                });
            } else {
                // For digital products, just increment sales count
                await productRef.update({
                    salesCount: admin.firestore.FieldValue.increment(1)
                });
            }
        }

        const dataToSave = {
            productId: item.id,
            productTitle: item.title,
            productPrice: item.price, // Added for user orders display
            amount: item.price,
            customerEmail: customerEmail,
            status: 'completed',
            type: item.type,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };

        const docRef = await getSalesCollection().add(dataToSave);
        const newSale = { id: docRef.id, ...dataToSave };

        // Send email notification asynchronously (don't wait for it to complete)
        try {
            await sendOrderConfirmation(customerEmail, newSale);
        } catch (emailError) {
            // Log the error but don't fail the sale if email sending fails
            console.error('Failed to send order confirmation email:', emailError);
        }

        return NextResponse.json(newSale, { status: 201 });
    } catch (error) {
        console.error('API POST Sale Error:', error);
        return NextResponse.json({ message: 'Failed to create sale record.', error: error.message }, { status: 500 });
    }
}