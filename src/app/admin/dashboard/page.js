// app/admin/dashboard/page.js
'use client';

import React, { useState } from 'react';
import { useStore } from '../../../context/StoreContext';
import { DollarSign, Package, Users, BarChart3, ShoppingCart, TrendingUp, Clock, Star, Settings, MessageSquare, FileText, Image } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Link from 'next/link';
import { Line, Bar } from 'recharts';

export default function AdminDashboardHome() {
    const { sales, products, subscribers, analytics, isLoadingData } = useStore();
    const [timeRange, setTimeRange] = useState('7d'); // 7 days, 30 days, 90 days

    // Use analytics data, with fallback to 0 if not loaded yet
    const totalRevenue = analytics?.totalRevenue || 0;
    const totalSales = analytics?.totalSalesCount || 0;
    const totalProducts = products.length;
    const activeSubscribers = subscribers.length;

    // Calculate Avg. Sale Value
    const avgSaleValue = totalSales > 0 ? totalRevenue / totalSales : 0;

    // Generate analytics chart data (mock data for demonstration)
    const generateChartData = () => {
        const data = [];
        const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
        
        for (let i = days; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            
            data.push({
                name: dateStr,
                revenue: Math.floor(Math.random() * 500) + 100,
                sales: Math.floor(Math.random() * 20) + 5
            });
        }
        return data;
    };

    const chartData = generateChartData();

    const stats = [
        { title: "Total Revenue", value: `$${totalRevenue.toFixed(2)}`, icon: DollarSign, color: "bg-green-100 text-green-600" },
        { title: "Total Sales", value: totalSales, icon: Package, color: "bg-blue-100 text-blue-600" },
        { title: "Active Products", value: totalProducts, icon: Package, color: "bg-yellow-100 text-yellow-600" },
        { title: "Subscribers", value: activeSubscribers, icon: Users, color: "bg-purple-100 text-purple-600" },
        { title: "Avg. Sale Value", value: `$${avgSaleValue.toFixed(2)}`, icon: BarChart3, color: "bg-indigo-100 text-indigo-600" },
        { title: "Conversion Rate", value: "2.5%", icon: TrendingUp, color: "bg-teal-100 text-teal-600" },
    ];

    const RecentSales = () => (
        <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">Recent Sales</h3>
                <span className="text-sm text-gray-500">{sales.length} total</span>
            </div>
            <ul className="space-y-3">
                {sales.slice(0, 5).map(sale => (
                    <li key={sale.id} className="flex justify-between items-center text-sm border-b pb-2 last:border-b-0">
                        <div>
                            <p className="font-medium text-gray-700">{sale.productName || 'Unknown Product'}</p>
                            <p className="text-xs text-gray-500">{sale.customerEmail}</p>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-green-600">${(sale.productPrice || 0).toFixed(2)}</p>
                            <p className="text-xs text-gray-500">{new Date(sale.createdAt).toLocaleDateString()}</p>
                        </div>
                    </li>
                ))}
                {sales.length === 0 && <p className="text-gray-500 text-sm">No sales recorded yet.</p>}
            </ul>
            <Link href="/admin/dashboard/sales" passHref>
                <Button variant="outline" className="w-full mt-4 border-gray-300">
                    View All Sales
                </Button>
            </Link>
        </div>
    );

    const ContentManager = () => (
        <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Content Management
            </h3>
            <div className="grid grid-cols-2 gap-4">
                <Link href="/admin/dashboard/products" passHref>
                    <Button variant="outline" className="w-full flex flex-col items-center justify-center border-gray-300 p-4 h-24">
                        <Package size={24} className="mb-2 text-gray-700" />
                        <span>Manage Products</span>
                    </Button>
                </Link>
                <Link href="/admin/dashboard/pages" passHref>
                    <Button variant="outline" className="w-full flex flex-col items-center justify-center border-gray-300 p-4 h-24">
                        <FileText size={24} className="mb-2 text-gray-700" />
                        <span>Edit Pages</span>
                    </Button>
                </Link>
                <Link href="/admin/dashboard/blog" passHref>
                    <Button variant="outline" className="w-full flex flex-col items-center justify-center border-gray-300 p-4 h-24">
                        <MessageSquare size={24} className="mb-2 text-gray-700" />
                        <span>Create Blog</span>
                    </Button>
                </Link>
                <Link href="/admin/dashboard/media" passHref>
                    <Button variant="outline" className="w-full flex flex-col items-center justify-center border-gray-300 p-4 h-24">
                        <Image size={24} className="mb-2 text-gray-700" />
                        <span>Media Library</span>
                    </Button>
                </Link>
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            {isLoadingData ? (
                <div className="flex justify-center items-center h-48">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <p className="ml-2 text-gray-600">Loading dashboard data...</p>
                </div>
            ) : (
                <>
                    {/* Time Range Selector */}
                    <div className="flex justify-end">
                        <div className="inline-flex rounded-md shadow-sm" role="group">
                            {['7d', '30d', '90d'].map(range => (
                                <button
                                    key={range}
                                    type="button"
                                    className={`px-4 py-2 text-sm font-medium ${
                                        timeRange === range
                                            ? 'z-10 text-white bg-blue-600 border border-blue-600'
                                            : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                                    } first:rounded-l-lg last:rounded-r-lg`}
                                    onClick={() => setTimeRange(range)}
                                >
                                    {range}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {stats.map((stat, index) => (
                            <div key={index} className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                                        <p className="mt-2 text-3xl font-black text-gray-900">{stat.value}</p>
                                    </div>
                                    <div className={`p-3 rounded-full ${stat.color}`}>
                                        <stat.icon size={24} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Chart Visualization */}
                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Revenue & Sales Trend</h3>
                        <div className="h-80">
                            <Line
                                width={800}
                                height={300}
                                data={chartData}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
                                <Line type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={2} />
                            </Line>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            <RecentSales />
                        </div>
                        <ContentManager />
                    </div>

                    {/* Additional Quick Actions */}
                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <Link href="/admin/dashboard/products/new" passHref>
                                <Button variant="secondary" className="w-full text-white bg-blue-600 hover:bg-blue-700">
                                    Add New Product
                                </Button>
                            </Link>
                            <Link href="/admin/dashboard/subscribers" passHref>
                                <Button variant="outline" className="w-full border-gray-300">
                                    Manage Subscribers
                                </Button>
                            </Link>
                            <Link href="/admin/dashboard/analytics" passHref>
                                <Button variant="outline" className="w-full border-gray-300">
                                    Detailed Analytics
                                </Button>
                            </Link>
                            <Link href="/admin/settings" passHref>
                                <Button variant="outline" className="w-full border-gray-300">
                                    Site Settings
                                </Button>
                            </Link>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}