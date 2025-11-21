// app/admin/dashboard/sales/page.js
'use client';

import React, { useEffect, useState } from 'react';
import { useStore } from '../../../../context/StoreContext';
import { Loader2, DollarSign } from 'lucide-react';

export default function AdminSalesPage() {
    const { sales, isLoadingData, refetchAdminData } = useStore();
    const [loading, setLoading] = useState(true); // Local loading state for initial fetch

    useEffect(() => {
        // Since refetchAdminData is called on initial load in StoreProvider,
        // we just need to ensure we reflect the loading state from there.
        // We'll also call it again here to ensure fresh data if navigated directly.
        if (!isLoadingData) {
            setLoading(false);
        }
        refetchAdminData(); // Ensure sales data is fresh
    }, [isLoadingData, refetchAdminData]);


    if (loading) {
        return (
            <div className="flex justify-center items-center h-48">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                <p className="ml-2 text-gray-600">Loading sales data...</p>
            </div>
        );
    }

    if (sales.length === 0) {
        return (
            <div className="py-20 text-center">
                <DollarSign size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No sales recorded yet.</h3>
                <p className="text-gray-500">Your sales will appear here after a successful purchase.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Sales History</h1>
            
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {sales.map((sale) => (
                            <tr key={sale.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{sale.productName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sale.customerEmail}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${sale.productPrice?.toFixed(2)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${sale.productPrice?.toFixed(2)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {sale.createdAt?.toDate ? new Date(sale.createdAt.toDate()).toLocaleDateString() : 'N/A'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
