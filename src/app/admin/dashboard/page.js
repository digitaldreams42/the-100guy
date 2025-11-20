// app/admin/dashboard/page.js
'use client';

import React from 'react';
import { useStore } from '../../../context/StoreContext';
import { DollarSign, Package, Users, BarChart3, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Button from '../../../components/ui/Button';

export default function AdminDashboardHome() {
    const { sales, products, subscribers } = useStore();

    // Calculate metrics
    const totalRevenue = sales.reduce((sum, s) => sum + (s.amount || 0), 0);
    const totalSales = sales.length;
    const totalProducts = products.length;
    const activeSubscribers = subscribers.length;

    const stats = [
        { title: "Total Revenue", value: `$${totalRevenue.toFixed(2)}`, icon: DollarSign, color: "bg-green-100 text-green-600" },
        { title: "Total Sales", value: totalSales, icon: Package, color: "bg-blue-100 text-blue-600" },
        { title: "Total Products", value: totalProducts, icon: Package, color: "bg-yellow-100 text-yellow-600" },
        { title: "Subscribers", value: activeSubscribers, icon: Users, color: "bg-purple-100 text-purple-600" },
    ];

    const RecentSales = () => (
        <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Sales</h3>
            <ul className="space-y-3">
                {sales.slice(0, 5).map(sale => (
                    <li key={sale.id} className="flex justify-between items-center text-sm border-b pb-2 last:border-b-0">
                        <span className="font-medium text-gray-700">{sale.productTitle}</span>
                        <span className="font-bold text-green-600">${sale.amount?.toFixed(2)}</span>
                    </li>
                ))}
            </ul>
            {sales.length > 5 && (
                 <Link href="/admin/dashboard/analytics" passHref>
                    <div className="mt-4 text-sm text-yellow-600 font-bold flex items-center hover:underline cursor-pointer">
                        View All Sales <ArrowRight size={16} className="ml-1" />
                    </div>
                 </Link>
            )}
            {sales.length === 0 && <p className="text-gray-500 text-sm">No sales recorded yet.</p>}
        </div>
    );

    return (
        <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                            <div className={`p-2 rounded-full ${stat.color}`}>
                                <stat.icon size={20} />
                            </div>
                        </div>
                        <p className="mt-4 text-3xl font-black text-gray-900">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <RecentSales />
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                        <Link href="/admin/dashboard/products" passHref>
                            <Button variant="secondary" className="w-full justify-start text-white bg-blue-600 hover:bg-blue-700">
                                Add New Product
                            </Button>
                        </Link>
                        <Link href="/admin/dashboard/analytics" passHref>
                            <Button variant="outline" className="w-full justify-start border-gray-300">
                                Full Analytics Report
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}