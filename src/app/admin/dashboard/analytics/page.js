// app/admin/dashboard/analytics/page.js
'use client';

import { useState } from 'react';
import { Bar, Line, Pie } from 'recharts';
import { Calendar, TrendingUp, DollarSign, ShoppingCart, Users, Package, Filter } from 'lucide-react';
import Button from '../../../../components/ui/Button';

export default function AnalyticsPage() {
    const [timeRange, setTimeRange] = useState('30d');
    const [comparePrev, setComparePrev] = useState(false);

    // Mock data for analytics
    const salesData = [
        { date: '2023-06-01', revenue: 1200, orders: 15, conversions: 2.3 },
        { date: '2023-06-02', revenue: 1800, orders: 22, conversions: 2.7 },
        { date: '2023-06-03', revenue: 2100, orders: 28, conversions: 3.1 },
        { date: '2023-06-04', revenue: 1500, orders: 18, conversions: 2.5 },
        { date: '2023-06-05', revenue: 2300, orders: 30, conversions: 3.2 },
        { date: '2023-06-06', revenue: 2700, orders: 35, conversions: 3.6 },
        { date: '2023-06-07', revenue: 1900, orders: 24, conversions: 2.8 },
    ];

    const trafficSources = [
        { name: 'Organic Search', value: 45 },
        { name: 'Direct', value: 25 },
        { name: 'Social Media', value: 15 },
        { name: 'Email', value: 10 },
        { name: 'Referrals', value: 5 },
    ];

    const topProducts = [
        { name: 'Business Mastery Course', sales: 120, revenue: 18000 },
        { name: 'Conversion Template Pack', sales: 95, revenue: 9500 },
        { name: 'Content Creation Blueprint', sales: 78, revenue: 7800 },
        { name: 'Brand Strategy Guide', sales: 65, revenue: 13000 },
        { name: 'Social Media Kit', sales: 52, revenue: 5200 },
    ];

    const metrics = [
        { title: 'Total Revenue', value: '$124,592', change: '+12.5%', icon: DollarSign, color: 'text-green-600' },
        { title: 'Total Orders', value: '1,284', change: '+8.2%', icon: ShoppingCart, color: 'text-blue-600' },
        { title: 'Conversion Rate', value: '3.2%', change: '+0.4%', icon: TrendingUp, color: 'text-purple-600' },
        { title: 'Avg. Order Value', value: '$97.50', change: '+2.1%', icon: Package, color: 'text-yellow-600' },
        { title: 'Unique Visitors', value: '39,842', change: '+15.7%', icon: Users, color: 'text-teal-600' },
        { title: 'Page Views', value: '156,732', change: '+18.3%', icon: Calendar, color: 'text-indigo-600' },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
                <div className="flex space-x-4">
                    <div className="relative">
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                            className="appearance-none bg-white border border-gray-300 rounded-md pl-3 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="7d">Last 7 days</option>
                            <option value="30d">Last 30 days</option>
                            <option value="90d">Last 90 days</option>
                            <option value="12mo">Last 12 months</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                            <Calendar className="h-4 w-4" />
                        </div>
                    </div>
                    <Button
                        variant={comparePrev ? "primary" : "outline"}
                        onClick={() => setComparePrev(!comparePrev)}
                    >
                        Compare Previous Period
                    </Button>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {metrics.map((metric, index) => (
                    <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">{metric.title}</p>
                                <p className="mt-1 text-3xl font-bold text-gray-900">{metric.value}</p>
                            </div>
                            <div className={`p-3 rounded-full bg-gray-100 ${metric.color}`}>
                                <metric.icon size={24} />
                            </div>
                        </div>
                        <p className={`mt-2 text-sm ${metric.color}`}>
                            <span className="font-medium">{metric.change}</span> from previous period
                        </p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Revenue and Orders Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Revenue & Orders</h2>
                    <div className="h-80">
                        <Line
                            data={salesData}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            width={800}
                            height={300}
                        >
                            <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} name="Revenue ($)" />
                            <Line type="monotone" dataKey="orders" stroke="#10b981" strokeWidth={2} name="Orders" />
                        </Line>
                    </div>
                </div>

                {/* Conversion Rate Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Conversion Rate</h2>
                    <div className="h-80">
                        <Bar
                            data={salesData}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            width={800}
                            height={300}
                        >
                            <Bar dataKey="conversions" fill="#8b5cf6" name="Conversion Rate (%)" />
                        </Bar>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                {/* Traffic Sources */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Traffic Sources</h2>
                    <div className="h-80">
                        <Pie
                            data={trafficSources}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            fill="#8884d8"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        />
                    </div>
                </div>

                {/* Top Selling Products */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Top Selling Products</h2>
                    <div className="space-y-4">
                        {topProducts.map((product, index) => (
                            <div key={index} className="flex items-center justify-between border-b pb-4 last:border-b-0">
                                <div>
                                    <h3 className="font-medium text-gray-900">{product.name}</h3>
                                    <p className="text-sm text-gray-500">{product.sales} units sold</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-gray-900">${product.revenue.toLocaleString()}</p>
                                    <p className="text-sm text-gray-500">${(product.revenue / product.sales).toFixed(2)}/unit</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Additional Analytics Controls */}
            <div className="mt-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Export Data</h2>
                    <div className="flex space-x-2">
                        <Button variant="outline">
                            <Filter className="mr-2 h-4 w-4" />
                            Filter
                        </Button>
                        <Button variant="secondary">
                            Export as CSV
                        </Button>
                        <Button variant="primary">
                            Export as PDF
                        </Button>
                    </div>
                </div>
                <div className="text-sm text-gray-600">
                    Select date range and metrics to export your analytics data for external reporting.
                </div>
            </div>
        </div>
    );
}