// lib/data.js
import { 
    collection, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    serverTimestamp,
    query,
    where,
    doc
} from 'firebase/firestore';
import { storage } from './firebase'; // Imports { appId, db, serverTimestamp, ... }

const getCollectionRef = (name) => {
    return collection(storage.db, 'artifacts', storage.appId, 'public', 'data', name);
};

// --- Product CRUD ---

export async function createProduct(productData) {
    try {
        await addDoc(getCollectionRef('products'), {
            ...productData,
            createdAt: serverTimestamp(),
            status: productData.status || 'draft',
            downloads: 0
        });
        return { success: true, message: 'Product created successfully.' };
    } catch (error) {
        console.error("Error creating product:", error);
        return { success: false, message: error.message };
    }
}

export async function updateProduct(productId, productData) {
    try {
        const productRef = doc(storage.db, 'artifacts', storage.appId, 'public', 'data', 'products', productId);
        await updateDoc(productRef, productData);
        return { success: true, message: 'Product updated successfully.' };
    } catch (error) {
        console.error("Error updating product:", error);
        return { success: false, message: error.message };
    }
}

export async function deleteProduct(productId) {
    try {
        const productRef = doc(storage.db, 'artifacts', storage.appId, 'public', 'data', 'products', productId);
        await deleteDoc(productRef);
        return { success: true, message: 'Product deleted successfully.' };
    } catch (error) {
        console.error("Error deleting product:", error);
        return { success: false, message: error.message };
    }
}

// --- Sales and Subscribers ---

export async function createSaleRecord(item, customerEmail) {
    try {
        await addDoc(getCollectionRef('sales'), {
            productId: item.id,
            productTitle: item.title,
            amount: item.price,
            customerEmail: customerEmail,
            date: new Date().toISOString(),
            status: 'completed',
            type: item.type,
            createdAt: serverTimestamp()
        });
        return { success: true };
    } catch (error) {
        console.error("Error creating sale record:", error);
        return { success: false };
    }
}

export async function subscribeEmail(email) {
    if (!email || !email.includes('@')) {
        return { success: false, message: 'Invalid email address.' };
    }
    try {
        await addDoc(getCollectionRef('subscribers'), {
            email,
            date: new Date().toISOString().split('T')[0],
            status: 'active',
            tags: ['website_signup'],
            subscribedAt: serverTimestamp()
        });
        return { success: true, message: "You're in! Welcome to the club." };
    } catch (error) {
        // Simple duplicate check simulation
        if (error.code === 'permission-denied') {
             return { success: false, message: 'You are already subscribed!' };
        }
        console.error("Error subscribing:", error);
        return { success: false, message: 'Error subscribing. Please try again.' };
    }
}

export async function deleteSubscriber(subscriberId) {
    try {
        const subscriberRef = doc(storage.db, 'artifacts', storage.appId, 'public', 'data', 'subscribers', subscriberId);
        await deleteDoc(subscriberRef);
        return { success: true, message: 'Subscriber deleted successfully.' };
    } catch (error) {
        console.error("Error deleting subscriber:", error);
        return { success: false, message: error.message };
    }
}

// Data fetching is handled via onSnapshot in Contexts for real-time data. 
// However, the query builder is useful:
export const productCollectionQuery = query(getCollectionRef('products'));
export const salesCollectionQuery = query(getCollectionRef('sales'));
export const subscriberCollectionQuery = query(getCollectionRef('subscribers'));