// app/admin/dashboard/layout.js
'use client';

import React from 'react';
import DashboardShell from '../../../components/admin/DashboardShell';

export default function AdminDashboardLayout({ children }) {
    // DashboardShell handles the client-side authentication check and sidebar.
    // NOTE: In a real Next.js app, the authentication check would be middleware or a server component wrapper.
    // For this environment, the `DashboardShell` acts as the authentication boundary.
    return (
        <DashboardShell title="Dashboard Overview" description="Key metrics and summary of business performance.">
            {children}
        </DashboardShell>
    );
}