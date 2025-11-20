// context/AuthContext.jsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
    onAuthStateChanged, 
    signInWithEmailAndPassword, 
    signOut 
} from 'firebase/auth';
import { auth, authenticateUser } from '../lib/firebase';
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
                 setUser({ email: process.env.NEXT_PUBLIC_ADMIN_EMAIL, uid: 'admin-mock-uid' });
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
        setIsLoading(true);
        if (
            email === process.env.NEXT_PUBLIC_ADMIN_EMAIL &&
            password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD
        ) {
            try {
                localStorage.setItem('gstoreIsAdmin', 'true');
            } catch (error) {
                console.error("Failed to save admin status to localStorage", error);
            }
            setIsAdmin(true);
            // The useEffect will handle setting the user and loading state
            return { success: true };
        } else {
            setIsLoading(false);
            return { success: false, message: 'Invalid Credentials. Please use the admin credentials provided in the .env file.' };
        }
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
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}