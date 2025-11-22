// components/admin/DashboardShell.jsx
'use client';

import React from 'react';
import AdminSidebar from './AdminSidebar';

export default function DashboardShell({ children, title, description }) {
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