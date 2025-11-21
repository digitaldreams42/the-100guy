// lib/data.js
// This file now acts as a client for the API routes.

// --- Helper for API calls ---
async function apiCall(method, url, data = null) {
    const options = {
        method,
    };

    if (data instanceof FormData) {
        // If data is FormData, browser will set Content-Type header automatically
        options.body = data;
    } else if (data) {
        options.headers = {
            'Content-Type': 'application/json',
        };
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(url, options);
        const result = await response.json();

        if (!response.ok) {
            // Throw an error with the message from the API
            throw new Error(result.message || `API call failed with status ${response.status}`);
        }
        return { success: true, ...result };
    } catch (error) {
        console.error(`API ${method} ${url} Error:`, error);
        return { success: false, message: error.message };
    }
}

// --- Product CRUD ---

export async function createProduct(productData) {
    const response = await apiCall('POST', '/api/products', productData);
    return { ...response, message: response.message || 'Product created successfully.' };
}

export async function updateProduct(productId, productData) {
    const response = await apiCall('PUT', `/api/products/${productId}`, productData);
    return { ...response, message: response.message || 'Product updated successfully.' };
}

export async function deleteProduct(productId) {
    const response = await apiCall('DELETE', `/api/products/${productId}`);
    return { ...response, message: response.message || 'Product deleted successfully.' };
}

// --- Sales and Subscribers ---

export async function createSaleRecord(item, customerEmail) {
    // This will call the new POST /api/sales route
    const response = await apiCall('POST', '/api/sales', { item, customerEmail });
    return { ...response, message: response.message || 'Sale record created successfully.' };
}

export async function subscribeEmail(email) {
    if (!email || !email.includes('@')) {
        return { success: false, message: 'Invalid email address.' };
    }
    const response = await apiCall('POST', '/api/subscribers', { email });
    // Handle specific conflict message from API
    if (!response.success && response.message && response.message.includes('already subscribed')) {
        response.message = 'You are already subscribed!';
    }
    return { ...response, message: response.message || "You're in! Welcome to the club." };
}

export async function deleteSubscriber(subscriberId) {
    const response = await apiCall('DELETE', `/api/subscribers/${subscriberId}`);
    return { ...response, message: response.message || 'Subscriber deleted successfully.' };
}
