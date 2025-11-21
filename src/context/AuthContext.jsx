// context/AuthContext.jsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    sendEmailVerification
} from 'firebase/auth';
import { auth, authenticateUser } from '../lib/firebase';
import { registerUser, loginUser, logoutUser as userLogout, resetPassword } from '../lib/auth-service';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(() => {
        if (typeof window === 'undefined') return false;
        try {
            return localStorage.getItem('gstoreIsAdmin') === 'true';
        } catch (error) {
            console.error("Error reading admin status from localStorage", error);
            return false;
        }
    });

    // This is now the source of truth for admin status
    const isUserAdmin = isAdmin;

    useEffect(() => {
        // If we're logged in as a mock admin, we can set a mock user and skip Firebase.
        if (isAdmin) {
            if (!user) { // Only set mock user if not already set (e.g., on initial load)
                 setUser({ email: process.env.NEXT_PUBLIC_ADMIN_EMAIL, uid: 'admin-mock-uid', isMock: true });
            }
            setIsLoading(false);
            return;
        }

        // For regular users, we still want to use Firebase anonymous auth.
        authenticateUser();

        const unsubscribe = onAuthStateChanged(auth, (u) => {
            if (!isAdmin) {
                setUser(u);
            }
            setIsLoading(false);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, [isAdmin]); // Rerun this effect if the admin status changes.

    const loginAdmin = (email, password) => {
        // Input validation and sanitization
        if (!email || !password) {
            return { success: false, message: 'Email and password are required.' };
        }

        // Sanitize inputs
        const sanitizedEmail = email.trim().toLowerCase();
        const sanitizedPassword = password.trim();

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(sanitizedEmail)) {
            return { success: false, message: 'Please enter a valid email address.' };
        }

        // Check if credentials match expected values
        if (
            sanitizedEmail === process.env.NEXT_PUBLIC_ADMIN_EMAIL &&
            sanitizedPassword === process.env.NEXT_PUBLIC_ADMIN_PASSWORD
        ) {
            try {
                localStorage.setItem('gstoreIsAdmin', 'true');
            } catch (error) {
                console.error("Failed to save admin status to localStorage", error);
                return { success: false, message: 'Failed to store admin status due to local storage issue' };
            }
            setIsAdmin(true);
            // The useEffect will handle setting the user and loading state
            return { success: true };
        } else {
            setIsLoading(false);
            return { success: false, message: 'Invalid credentials. Please check your email and password.' };
        }
    };

    const registerCustomer = async (email, password, displayName) => {
        // Input validation and sanitization
        if (!email || !password || !displayName) {
            return { success: false, message: 'All fields are required.' };
        }

        // Sanitize inputs
        const sanitizedEmail = email.trim().toLowerCase();
        const sanitizedPassword = password.trim();
        const sanitizedDisplayName = displayName.trim();

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(sanitizedEmail)) {
            return { success: false, message: 'Please enter a valid email address.' };
        }

        // Password strength check
        if (sanitizedPassword.length < 6) {
            return { success: false, message: 'Password must be at least 6 characters long.' };
        }

        // Display name validation
        if (sanitizedDisplayName.length < 2) {
            return { success: false, message: 'Display name must be at least 2 characters long.' };
        }

        setIsLoading(true);
        const result = await registerUser(sanitizedEmail, sanitizedPassword, sanitizedDisplayName);
        if (result.success) {
            setUser(result.user);
        }
        setIsLoading(false);
        return result;
    };

    const loginCustomer = async (email, password) => {
        // Input validation and sanitization
        if (!email || !password) {
            return { success: false, message: 'Email and password are required.' };
        }

        // Sanitize inputs
        const sanitizedEmail = email.trim().toLowerCase();
        const sanitizedPassword = password.trim();

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(sanitizedEmail)) {
            return { success: false, message: 'Please enter a valid email address.' };
        }

        setIsLoading(true);
        const result = await loginUser(sanitizedEmail, sanitizedPassword);
        if (result.success) {
            setUser(result.user);
        }
        setIsLoading(false);
        return result;
    };

    const logoutCustomer = async () => {
        setIsLoading(true);
        const result = await userLogout();
        if (result.success) {
            setUser(null);
        }
        setIsLoading(false);
        return result;
    };

    const forgotPassword = async (email) => {
        // Input validation and sanitization
        if (!email) {
            return { success: false, message: 'Email is required.' };
        }

        const sanitizedEmail = email.trim().toLowerCase();

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(sanitizedEmail)) {
            return { success: false, message: 'Please enter a valid email address.' };
        }

        return await resetPassword(sanitizedEmail);
    };

    const logout = async () => {
        if (isAdmin) {
            try {
                localStorage.removeItem('gstoreIsAdmin');
            } catch (error) {
                console.error("Failed to remove admin status from localStorage", error);
            }
            setUser(null);
            setIsAdmin(false);
        } else if (user) {
            await signOut(auth);
        }
    };

    const value = {
        user,
        isLoading,
        isUserAdmin,
        loginAdmin,
        logout,
        // Customer authentication methods
        registerCustomer,
        loginCustomer,
        logoutCustomer,
        forgotPassword,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}