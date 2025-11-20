// context/StoreContext.jsx
'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { onSnapshot } from 'firebase/firestore';
import { 
    subscribeEmail, 
    createSaleRecord, 
    productCollectionQuery,
    salesCollectionQuery,
    subscriberCollectionQuery
} from '../lib/data';
import { MOCK_PRODUCTS, PRODUCT_TYPES } from '../lib/constants';
import { useAuth } from './AuthContext';

const StoreContext = createContext();

export const useStore = () => useContext(StoreContext);

export function StoreProvider({ children }) {
    const { user, isLoading: isAuthLoading } = useAuth();
    
    // UI State
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [notification, setNotification] = useState(null); // { type: 'success'|'error', message: '' }
    const [isProcessing, setIsProcessing] = useState(false);
    
    // Core Data State
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [sales, setSales] = useState([]);
    const [subscribers, setSubscribers] = useState([]);
    
    // Filter State
    const [activeFilter, setActiveFilter] = useState(PRODUCT_TYPES.ALL);
    const [searchQuery, setSearchQuery] = useState('');

    // --- Actions ---

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const addToCart = (product) => {
        if (cart.find(item => item.id === product.id)) {
            showNotification('Item already in cart', 'error');
            return;
        }
        setCart([...cart, product]);
        setIsCartOpen(true);
        showNotification('Added to cart!');
    };

    const removeFromCart = (productId) => {
        setCart(cart.filter(item => item.id !== productId));
    };

    const processPayment = async () => {
        if (!user || cart.length === 0) return;
        
        setIsProcessing(true);
        try {
            // Simulate Payment Processing delay
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // In a real app, customer email would come from payment gateway/user profile
            const customerEmail = user.isAnonymous ? 'anonymous@example.com' : user.email || 'customer@example.com'; 

            // Create Sale Records in batch
            const batchPromises = cart.map(item => createSaleRecord(item, customerEmail));
            const results = await Promise.all(batchPromises);

            if (results.every(r => r.success)) {
                setCart([]);
                setIsCartOpen(false);
                showNotification('Payment successful! Check your email.');
            } else {
                showNotification('Payment processed but failed to record all sales.', 'error');
            }

        } catch (error) {
            console.error("Payment failed:", error);
            showNotification('Payment processing failed.', 'error');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSubscribe = async (email) => {
        const result = await subscribeEmail(email);
        showNotification(result.message, result.success ? 'success' : 'error');
    };

    // --- Effects: Firestore Listeners ---

    // Products Listener
    useEffect(() => {
        if (isAuthLoading || !user) return; 

        const unsubscribe = onSnapshot(productCollectionQuery, (snapshot) => {
            const loadedProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setProducts(loadedProducts);
        }, (error) => console.error("Error fetching products", error));
        
        return () => unsubscribe();
    }, [user, isAuthLoading]);

    // Admin Data Listeners (Sales & Subscribers)
    useEffect(() => {
        if (isAuthLoading || !user) return; 

        const unsubSales = onSnapshot(salesCollectionQuery, (snap) => {
            setSales(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });

        const unsubSub = onSnapshot(subscriberCollectionQuery, (snap) => {
            setSubscribers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });

        return () => { unsubSales(); unsubSub(); };
    }, [user, isAuthLoading]);
    
    // Filtered Products Memo
    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const matchesType = activeFilter === PRODUCT_TYPES.ALL || p.type === activeFilter;
            const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesType && matchesSearch;
        });
    }, [products, activeFilter, searchQuery]);


    const value = {
        // UI
        isCartOpen, setIsCartOpen,
        selectedProduct, setSelectedProduct,
        notification,
        isProcessing,

        // Data
        products,
        cart,
        sales,
        subscribers,
        
        // Filter
        activeFilter, setActiveFilter,
        searchQuery, setSearchQuery,
        filteredProducts,

        // Actions
        addToCart,
        removeFromCart,
        processPayment,
        handleSubscribe,
        showNotification
    };

    return (
        <StoreContext.Provider value={value}>
            {children}
        </StoreContext.Provider>
    );
}