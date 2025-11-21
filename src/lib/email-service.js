// lib/email-service.js
import { createTransport } from 'nodemailer';

// Create a transporter using environment variables
const createEmailTransporter = () => {
    if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.warn('Email configuration missing. Email notifications will be disabled.');
        return null;
    }

    return createTransport({
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
export const sendOrderConfirmation = async (customerEmail, orderDetails) => {
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

// Send download ready email
export const sendDownloadReady = async (customerEmail, productDetails) => {
    const transporter = createEmailTransporter();
    
    if (!transporter) {
        console.log('Email transporter not configured. Skipping email notification.');
        return { success: true, message: 'Email transporter not configured, but order processing continued' };
    }

    try {
        const mailOptions = {
            from: process.env.SMTP_FROM || process.env.SMTP_USER,
            to: customerEmail,
            subject: 'Your Product is Ready for Download!',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #333; text-align: center;">Download Ready</h1>
                    <p>Hi there,</p>
                    <p>Your purchase is ready! You can now download your product.</p>
                    
                    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
                        <h3>Product Details:</h3>
                        <p><strong>Product:</strong> ${productDetails.name}</p>
                        <p><strong>Download Link:</strong> <a href="${productDetails.downloadUrl || '#'}" style="color: #d97706;">Download Now</a></p>
                    </div>
                    
                    <p>Thank you for choosing our product!</p>
                    
                    <p>Best regards,<br>
                    The George K. Team</p>
                </div>
            `,
        };

        const result = await transporter.sendMail(mailOptions);
        console.log('Download ready email sent successfully to:', customerEmail);
        return { success: true, messageId: result.messageId };
    } catch (error) {
        console.error('Error sending download ready email:', error);
        return { success: false, message: error.message };
    }
};

// Send newsletter subscription confirmation
export const sendWelcomeEmail = async (email) => {
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