// components/admin/DashboardShell.jsx
'use client';

import React from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminSidebar from './AdminSidebar';
import { useRouter } from 'next/navigation'; // Assuming useRouter is imported

export default function DashboardShell({ children, title, description }) {
    const { isUserAdmin, isLoading } = useAuth();

    // NOTE: In a real Next.js app, this check happens in the layout.js
    // Since we're simulating, we'll use a client-side check.

    if (isLoading) {
        return <div className="h-screen w-full flex items-center justify-center text-xl text-gray-500">Loading Admin...</div>;
    }

    if (!isUserAdmin) {
        // In a real app, use router.replace('/admin/login')
        return (
            <div className="h-screen w-full flex items-center justify-center flex-col p-8">
                <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
                <p className="text-gray-600">You must be logged in as an administrator to view this page.</p>
                <a href="/admin/login" className="mt-4 text-blue-600 hover:underline">Go to Admin Login</a>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <AdminSidebar />
            <main className="flex-1 lg:ml-64 p-4 md:p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-gray-900">{title}</h1>
                    <p className="text-gray-500">{description}</p>
                </div>
                {children}
            </main>
        </div>
    );
}