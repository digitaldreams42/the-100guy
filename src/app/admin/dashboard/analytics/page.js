// app/admin/dashboard/analytics/page.js
'use client';

import React, { useState } from 'react';
import { useStore } from '../../../../context/StoreContext';
import { Users, Package, DollarSign, Trash2, Loader2 } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import { deleteSubscriber } from '../../../../lib/data';
import ConfirmationModal from '../../../../components/modals/ConfirmationModal';

// Helper function to format date
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
        return 'Invalid Date';
    }
    return date.toLocaleDateString();
};


export default function AdminAnalyticsPage() {
    const { sales, subscribers, analytics, isLoadingData, showNotification, refetchAdminData } = useStore();
    const [isDeleting, setIsDeleting] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    // --- Calculations ---
    const totalRevenue = analytics?.totalRevenue || 0;
    const totalSales = analytics?.totalSalesCount || 0;
    const totalSubscribers = subscribers.length;
    const averageSaleValue = totalSales > 0 ? totalRevenue / totalSales : 0;

    const stats = [
        { title: "Total Revenue", value: `$${totalRevenue.toFixed(2)}`, icon: DollarSign },
        { title: "Total Sales", value: totalSales, icon: Package },
        { title: "Total Subscribers", value: totalSubscribers, icon: Users },
        { title: "Avg. Sale Value", value: `$${averageSaleValue.toFixed(2)}`, icon: DollarSign },
    ];
    
    // --- Handlers ---
    const openConfirmation = (item) => {
        setItemToDelete(item);
        setIsConfirmOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;

        setIsDeleting(true);
        const result = await deleteSubscriber(itemToDelete.id);
        setIsDeleting(false);
        setIsConfirmOpen(false);
        setItemToDelete(null);

        showNotification(result.message, result.success ? 'success' : 'error');
        if (result.success) {
            refetchAdminData();
        }
    };

    // --- Components ---
    const SalesTable = () => (
        <div id="sales" className="bg-white p-6 rounded-xl shadow-md overflow-x-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Sales History ({sales.length})</h2>
            
            {sales.length === 0 ? (
                 <p className="text-gray-500">No sales recorded.</p>
            ) : (
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {sales.map((sale) => (
                            <tr key={sale.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(sale.createdAt)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{sale.productName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">${(sale.productPrice || 0).toFixed(2)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sale.customerEmail}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );

    const SubscribersTable = () => (
        <div id="subscribers" className="bg-white p-6 rounded-xl shadow-md overflow-x-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Subscribers ({subscribers.length})</h2>
            
            {subscribers.length === 0 ? (
                 <p className="text-gray-500">No subscribers yet.</p>
            ) : (
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Subscribed</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {subscribers.map((sub) => (
                            <tr key={sub.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{sub.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(sub.subscribedAt)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button 
                                        onClick={() => openConfirmation(sub)}
                                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                                        disabled={isDeleting}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );

    return (
        <div className="space-y-8">
            <ConfirmationModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Confirm Deletion"
                message={`Are you sure you want to delete ${itemToDelete?.email}? This action cannot be undone.`}
                isLoading={isDeleting}
            />

            {isLoadingData ? (
                <div className="flex justify-center items-center h-48">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    <p className="ml-2 text-gray-600">Loading analytics data...</p>
                </div>
            ) : (
                <>
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {stats.map((stat, index) => (
                            <div key={index} className="bg-white p-6 rounded-xl shadow-md">
                                <div className="flex items-center">
                                    <stat.icon size={24} className="text-gray-400" />
                                    <p className="text-sm font-medium text-gray-500 ml-3">{stat.title}</p>
                                </div>
                                <p className="mt-4 text-3xl font-black text-gray-900">{stat.value}</p>
                            </div>
                        ))}
                    </div>

                    <SalesTable />
                    <SubscribersTable />
                </>
            )}
        </div>
    );
}
