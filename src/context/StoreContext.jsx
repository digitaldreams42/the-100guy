// context/StoreContext.jsx
'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { subscribeEmail, createSaleRecord } from '../lib/data';
import { PRODUCT_TYPES } from '../lib/constants';
import { useAuth } from './AuthContext';

const StoreContext = createContext();

export const useStore = () => useContext(StoreContext);

export function StoreProvider({ children }) {
    const { user, isLoading: isAuthLoading, isUserAdmin } = useAuth();
    
    // UI State
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [notification, setNotification] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);
    
    // Core Data State
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [sales, setSales] = useState([]);
    const [subscribers, setSubscribers] = useState([]);
    
    // Filter State
    const [activeFilter, setActiveFilter] = useState(PRODUCT_TYPES.ALL);
    const [searchQuery, setSearchQuery] = useState('');

    // --- Data Fetching Actions ---
    const fetchProducts = useCallback(async () => {
        try {
            const response = await fetch('/api/products');
            const data = await response.json();
            if (response.ok) {
                setProducts(data);
            } else {
                throw new Error(data.message || 'Failed to fetch products');
            }
        } catch (error) {
            console.error(error);
            showNotification(error.message, 'error');
        }
    }, []);

    const fetchAdminData = useCallback(async () => {
        setIsLoadingData(true);
        try {
            const [salesRes, subscribersRes] = await Promise.all([
                fetch('/api/sales'),
                fetch('/api/subscribers')
            ]);
            const salesData = await salesRes.json();
            const subscribersData = await subscribersRes.json();

            if (salesRes.ok) setSales(salesData);
            else throw new Error(salesData.message || 'Failed to fetch sales');
            
            if (subscribersRes.ok) setSubscribers(subscribersData);
            else throw new Error(subscribersData.message || 'Failed to fetch subscribers');

        } catch (error) {
            console.error(error);
            showNotification(error.message, 'error');
        } finally {
            setIsLoadingData(false);
        }
    }, []);

    // --- Initial Data Load ---
    useEffect(() => {
        if (!isAuthLoading) {
            fetchProducts();
            if (isUserAdmin) {
                fetchAdminData();
            } else {
                // If user is not admin, clear any potential stale admin data
                setSales([]);
                setSubscribers([]);
                setIsLoadingData(false);
            }
        }
    }, [isAuthLoading, isUserAdmin, fetchProducts, fetchAdminData]);


    // --- Other Actions ---
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
            const customerEmail = user.isMock ? 'admin@example.com' : user.email || 'customer@example.com';
            const batchPromises = cart.map(item => createSaleRecord(item, customerEmail));
            const results = await Promise.all(batchPromises);

            if (results.every(r => r.success)) {
                setCart([]);
                setIsCartOpen(false);
                showNotification('Payment successful! Check your email.');
                if(isUserAdmin) fetchAdminData(); // Refresh sales data after successful payment
            } else {
                throw new Error('Payment processed but failed to record all sales.');
            }

        } catch (error) {
            console.error("Payment failed:", error);
            showNotification(error.message, 'error');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSubscribe = async (email) => {
        const result = await subscribeEmail(email);
        showNotification(result.message, result.success ? 'success' : 'error');
        if (result.success && isUserAdmin) {
            fetchAdminData(); // Refresh subscriber data
        }
    };
    
    // --- Memoized Values ---
    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const matchesType = activeFilter === PRODUCT_TYPES.ALL || p.type === activeFilter;
            
            const searchStr = searchQuery.toLowerCase();
            const nameMatch = p.name ? p.name.toLowerCase().includes(searchStr) : false;
            const descriptionMatch = p.description ? p.description.toLowerCase().includes(searchStr) : false;
            
            const matchesSearch = nameMatch || descriptionMatch;

            return matchesType && matchesSearch;
        });
    }, [products, activeFilter, searchQuery]);


    const value = {
        // UI
        isCartOpen, setIsCartOpen,
        selectedProduct, setSelectedProduct,
        notification,
        isProcessing,
        isLoadingData,

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
        showNotification,
        refetchAdminData: fetchAdminData, // Expose refetch functions
        refetchProducts: fetchProducts
    };

    return (
        <StoreContext.Provider value={value}>
            {children}
        </StoreContext.Provider>
    );
}
