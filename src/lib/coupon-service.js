// lib/coupon-service.js
// This service will handle coupon validation and application

// Mock database of coupons (in a real app, this would be stored in a database)
const COUPONS = {
    "WELCOME10": {
        code: "WELCOME10",
        type: "percentage",
        value: 10, // 10% off
        minimumAmount: 0,
        usageLimit: 100,
        usedCount: 32,
        expirationDate: "2025-12-31",
        description: "Welcome discount for new customers"
    },
    "SAVE20": {
        code: "SAVE20",
        type: "percentage",
        value: 20, // 20% off
        minimumAmount: 50,
        usageLimit: 50,
        usedCount: 28,
        expirationDate: "2025-11-30",
        description: "Special savings promotion"
    },
    "FREESHIP": {
        code: "FREESHIP",
        type: "shipping",
        value: 0, // Free shipping
        minimumAmount: 75,
        usageLimit: 200,
        usedCount: 142,
        expirationDate: "2025-10-31",
        description: "Free shipping on orders over $75"
    }
};

// Validate a coupon code
export const validateCoupon = (code, cartTotal = 0) => {
    if (!code) {
        return { valid: false, message: 'Please enter a coupon code' };
    }

    const coupon = COUPONS[code.toUpperCase()];
    
    if (!coupon) {
        return { valid: false, message: 'Invalid coupon code' };
    }

    // Check expiration
    const now = new Date();
    const expiry = new Date(coupon.expirationDate);
    if (now > expiry) {
        return { valid: false, message: 'This coupon has expired' };
    }

    // Check usage limit
    if (coupon.usedCount >= coupon.usageLimit) {
        return { valid: false, message: 'This coupon has reached its usage limit' };
    }

    // Check minimum purchase amount
    if (cartTotal < coupon.minimumAmount) {
        return { valid: false, message: `Minimum purchase of $${coupon.minimumAmount} required for this coupon` };
    }

    // Coupon is valid
    return {
        valid: true,
        coupon: {
            ...coupon,
            discount: calculateDiscount(coupon, cartTotal)
        }
    };
};

// Calculate discount amount based on coupon
const calculateDiscount = (coupon, cartTotal) => {
    switch (coupon.type) {
        case 'percentage':
            return (cartTotal * coupon.value) / 100;
        case 'fixed':
            return Math.min(coupon.value, cartTotal);
        case 'shipping':
            // For shipping discount, we'll return the shipping cost that would be waived
            // For now, assume a flat shipping rate of $10 for calculation
            return 10;
        default:
            return 0;
    }
};

// Apply coupon to cart
export const applyCoupon = (code, cart) => {
    const cartTotal = cart.reduce((sum, item) => sum + parseFloat(item.price || 0), 0);
    const validation = validateCoupon(code, cartTotal);

    if (!validation.valid) {
        return validation;
    }

    const { coupon } = validation;
    const discount = coupon.discount;
    
    // Calculate new total after discount
    let newTotal = 0;
    if (coupon.type === 'shipping') {
        // For shipping coupons, we just note the shipping discount
        newTotal = cartTotal; // Total doesn't change, but shipping is free
    } else {
        newTotal = cartTotal - discount;
        if (newTotal < 0) newTotal = 0;
    }

    return {
        valid: true,
        coupon,
        originalTotal: cartTotal,
        discount,
        newTotal,
        savings: discount
    };
};

// Get all available coupons
export const getAvailableCoupons = () => {
    const now = new Date();
    return Object.values(COUPONS).filter(coupon => {
        const expiry = new Date(coupon.expirationDate);
        return now <= expiry && coupon.usedCount < coupon.usageLimit;
    });
};