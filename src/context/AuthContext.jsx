// context/AuthContext.jsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    signInWithEmailAndPassword,
    signOut,
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch('/api/user');
                const data = await res.json();
                setUser(data);
            } catch (error) {
                console.error('Failed to fetch user', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUser();
    }, []);

    const registerCustomer = async (email, password, displayName) => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password, displayName }),
            });
            const data = await res.json();
            if (data.success) {
                setUser(data);
                router.push('/profile');
            }
            return data;
        } catch (error) {
            console.error('Registration failed', error);
            return { success: false, error: error.message };
        } finally {
            setIsLoading(false);
        }
    };

    const loginCustomer = async (email, password) => {
        setIsLoading(true);
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const token = await userCredential.user.getIdToken();

            const res = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token }),
            });

            const data = await res.json();
            if (data.success) {
                setUser(data);
                router.push('/profile');
            }
            return data;
        } catch (error) {
            console.error('Login failed', error);
            return { success: false, error: error.message };
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);
        try {
            await signOut(auth);
            await fetch('/api/logout', { method: 'POST' });
            setUser(null);
            router.push('/');
        } catch (error) {
            console.error('Logout failed', error);
        } finally {
            setIsLoading(false);
        }
    };

    const value = {
        user,
        isLoading,
        registerCustomer,
        loginCustomer,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}