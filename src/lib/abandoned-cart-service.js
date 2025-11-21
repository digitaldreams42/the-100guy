// lib/abandoned-cart-service.js

// Track abandoned cart - when a user adds items to cart but doesn't complete purchase
export const trackAbandonedCart = async (userEmail, cartItems) => {
    // In a real implementation, we would store this information in a database
    // with a timestamp and potentially send a reminder after a certain period

    // For this implementation, we'll just store in localStorage as a placeholder
    // In a production environment, this would use a real database

    const abandonedCart = {
        email: userEmail,
        items: cartItems,
        timestamp: new Date().toISOString(),
        remindersSent: 0
    };

    // Store in localStorage for demo purposes
    const abandonedCarts = JSON.parse(localStorage.getItem('abandonedCarts') || '[]');
    abandonedCarts.push(abandonedCart);
    localStorage.setItem('abandonedCarts', JSON.stringify(abandonedCarts));

    console.log(`Tracked abandoned cart for ${userEmail} with ${cartItems.length} items`);
    return { success: true, message: 'Abandoned cart tracked' };
};

// Check for abandoned carts that need reminders
export const checkForAbandonedCarts = () => {
    // In a real implementation, this would run as a scheduled job
    // For this demo, we'll just return any carts that were abandoned more than 1 hour ago
    const abandonedCarts = JSON.parse(localStorage.getItem('abandonedCarts') || '[]');
    
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);
    
    return abandonedCarts.filter(cart => {
        const cartTime = new Date(cart.timestamp);
        return cartTime < oneHourAgo && cart.remindersSent === 0; // Only send first reminder
    });
};

// Mark cart reminder as sent
export const markReminderSent = async (userEmail) => {
    const abandonedCarts = JSON.parse(localStorage.getItem('abandonedCarts') || '[]');
    const updatedCarts = abandonedCarts.map(cart => {
        if (cart.email === userEmail) {
            return { ...cart, remindersSent: cart.remindersSent + 1 };
        }
        return cart;
    });
    
    localStorage.setItem('abandonedCarts', JSON.stringify(updatedCarts));
    
    // Simulate sending a reminder email
    try {
        // In real implementation, send actual email here
        console.log(`Abandoned cart reminder sent to ${userEmail}`);
        return { success: true, message: 'Reminder sent' };
    } catch (error) {
        console.error('Error sending abandoned cart reminder:', error);
        return { success: false, message: error.message };
    }
};

// Cleanup old abandoned carts (older than 7 days)
export const cleanupAbandonedCarts = () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const abandonedCarts = JSON.parse(localStorage.getItem('abandonedCarts') || '[]');
    const cleanedCarts = abandonedCarts.filter(cart => {
        const cartTime = new Date(cart.timestamp);
        return cartTime > sevenDaysAgo;
    });
    
    localStorage.setItem('abandonedCarts', JSON.stringify(cleanedCarts));
};