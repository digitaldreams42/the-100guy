// app/admin/dashboard/sales/page.js
'use client';

import { useState, useEffect } from 'react';
import { Search, Calendar, Download, Filter, MoreVertical, Eye, Trash2, DollarSign, User, Package, CreditCard } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import { useStore } from '../../../../context/StoreContext';

export default function SalesManagement() {
    const [sales, setSales] = useState([]);
    const [filteredSales, setFilteredSales] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortField, setSortField] = useState('date');
    const [sortDirection, setSortDirection] = useState('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const { sales: storeSales, refetchAdminData } = useStore();

    // Simulate fetching sales data
    useEffect(() => {
        // In real implementation, this would come from the API
        if (storeSales && storeSales.length > 0) {
            setSales(storeSales);
        } else {
            // Mock data for demonstration
            const mockSales = [
                { id: '1', orderNumber: 'ORD-001', customer: 'John Smith', email: 'john@example.com', product: 'Business Mastery Course', amount: 199.99, status: 'completed', date: '2023-06-15', paymentMethod: 'Credit Card' },
                { id: '2', orderNumber: 'ORD-002', customer: 'Sarah Johnson', email: 'sarah@example.com', product: 'Conversion Template Pack', amount: 149.99, status: 'completed', date: '2023-06-14', paymentMethod: 'PayPal' },
                { id: '3', orderNumber: 'ORD-003', customer: 'Mike Williams', email: 'mike@example.com', product: 'Content Creation Blueprint', amount: 99.99, status: 'pending', date: '2023-06-13', paymentMethod: 'Credit Card' },
                { id: '4', orderNumber: 'ORD-004', customer: 'Emily Davis', email: 'emily@example.com', product: 'Brand Strategy Guide', amount: 299.99, status: 'refunded', date: '2023-06-12', paymentMethod: 'Bank Transfer' },
                { id: '5', orderNumber: 'ORD-005', customer: 'David Brown', email: 'david@example.com', product: 'Social Media Kit', amount: 79.99, status: 'shipped', date: '2023-06-11', paymentMethod: 'Credit Card' },
                { id: '6', orderNumber: 'ORD-006', customer: 'Lisa Miller', email: 'lisa@example.com', product: 'Business Mastery Course', amount: 199.99, status: 'completed', date: '2023-06-10', paymentMethod: 'PayPal' },
                { id: '7', orderNumber: 'ORD-007', customer: 'James Wilson', email: 'james@example.com', product: 'Conversion Template Pack', amount: 149.99, status: 'completed', date: '2023-06-09', paymentMethod: 'Credit Card' },
                { id: '8', orderNumber: 'ORD-008', customer: 'Anna Taylor', email: 'anna@example.com', product: 'Content Creation Blueprint', amount: 99.99, status: 'processing', date: '2023-06-08', paymentMethod: 'Credit Card' },
                { id: '9', orderNumber: 'ORD-009', customer: 'Robert Anderson', email: 'robert@example.com', product: 'Brand Strategy Guide', amount: 299.99, status: 'completed', date: '2023-06-07', paymentMethod: 'Bank Transfer' },
                { id: '10', orderNumber: 'ORD-010', customer: 'Maria Thomas', email: 'maria@example.com', product: 'Social Media Kit', amount: 79.99, status: 'cancelled', date: '2023-06-06', paymentMethod: 'PayPal' },
            ];
            setSales(mockSales);
        }
    }, [storeSales]);

    // Apply filters and search
    useEffect(() => {
        let result = [...sales];

        // Apply search term
        if (searchTerm) {
            result = result.filter(sale =>
                sale.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                sale.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                sale.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                sale.product.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply date range filter
        if (dateRange.start && dateRange.end) {
            result = result.filter(sale => {
                const saleDate = new Date(sale.date);
                const startDate = new Date(dateRange.start);
                const endDate = new Date(dateRange.end);
                return saleDate >= startDate && saleDate <= endDate;
            });
        }

        // Apply status filter
        if (statusFilter !== 'all') {
            result = result.filter(sale => sale.status === statusFilter);
        }

        // Apply sorting
        result.sort((a, b) => {
            let aValue, bValue;
            if (sortField === 'amount' || sortField === 'date') {
                aValue = sortField === 'amount' ? parseFloat(a[sortField]) : new Date(a[sortField]);
                bValue = sortField === 'amount' ? parseFloat(b[sortField]) : new Date(b[sortField]);
            } else {
                aValue = a[sortField].toLowerCase();
                bValue = b[sortField].toLowerCase();
            }

            if (sortDirection === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        setFilteredSales(result);
        setCurrentPage(1); // Reset to first page when filters change
    }, [searchTerm, dateRange, statusFilter, sortField, sortDirection, sales]);

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentSales = filteredSales.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredSales.length / itemsPerPage);

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('desc');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'processing': return 'bg-blue-100 text-blue-800';
            case 'shipped': return 'bg-indigo-100 text-indigo-800';
            case 'refunded': return 'bg-purple-100 text-purple-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Sales Management</h1>
                    <p className="mt-2 text-gray-600">Manage and track all sales transactions</p>
                </div>
                <div className="flex space-x-4">
                    <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Export CSV
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search orders..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                        <div className="grid grid-cols-2 gap-2">
                            <input
                                type="date"
                                value={dateRange.start}
                                onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                            <input
                                type="date"
                                value={dateRange.end}
                                onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        >
                            <option value="all">All Statuses</option>
                            <option value="completed">Completed</option>
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="refunded">Refunded</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>

                    <div className="flex items-end">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setSearchTerm('');
                                setDateRange({ start: '', end: '' });
                                setStatusFilter('all');
                            }}
                        >
                            <Filter className="mr-2 h-4 w-4" />
                            Reset Filters
                        </Button>
                    </div>
                </div>
            </div>

            {/* Sales Table */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                onClick={() => handleSort('orderNumber')}
                            >
                                <div className="flex items-center">
                                    Order #
                                    {sortField === 'orderNumber' && (
                                        <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                                    )}
                                </div>
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                onClick={() => handleSort('customer')}
                            >
                                <div className="flex items-center">
                                    Customer
                                    {sortField === 'customer' && (
                                        <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                                    )}
                                </div>
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                onClick={() => handleSort('product')}
                            >
                                <div className="flex items-center">
                                    Product
                                    {sortField === 'product' && (
                                        <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                                    )}
                                </div>
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                onClick={() => handleSort('amount')}
                            >
                                <div className="flex items-center">
                                    Amount
                                    {sortField === 'amount' && (
                                        <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                                    )}
                                </div>
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                onClick={() => handleSort('date')}
                            >
                                <div className="flex items-center">
                                    Date
                                    {sortField === 'date' && (
                                        <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                                    )}
                                </div>
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {currentSales.length > 0 ? (
                            currentSales.map((sale) => (
                                <tr key={sale.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10 bg-yellow-100 rounded-full flex items-center justify-center">
                                                <Package className="h-5 w-5 text-yellow-800" />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{sale.orderNumber}</div>
                                                <div className="text-sm text-gray-500">{sale.paymentMethod}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{sale.customer}</div>
                                        <div className="text-sm text-gray-500">{sale.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{sale.product}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <div className="flex items-center">
                                            <DollarSign className="h-4 w-4 mr-1 text-gray-400" />
                                            ${sale.amount.toFixed(2)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div className="flex items-center">
                                            <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                                            {new Date(sale.date).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(sale.status)}`}>
                                            {sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end space-x-2">
                                            <button className="text-gray-400 hover:text-blue-500">
                                                <Eye className="h-5 w-5" />
                                            </button>
                                            <button className="text-gray-400 hover:text-red-500">
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                            <button className="text-gray-400 hover:text-gray-600">
                                                <MoreVertical className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                                    No sales found matching your criteria.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {filteredSales.length > itemsPerPage && (
                <div className="mt-6 flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                        Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                        <span className="font-medium">{Math.min(indexOfLastItem, filteredSales.length)}</span> of{' '}
                        <span className="font-medium">{filteredSales.length}</span> results
                    </div>
                    <div className="flex space-x-2">
                        <Button
                            variant="outline"
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </Button>
                        <span className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md">
                            {currentPage} of {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}

            {/* Stats Summary */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center">
                        <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm text-gray-500">Total Revenue</p>
                            <p className="text-2xl font-bold text-gray-900">
                                ${filteredSales.reduce((sum, sale) => sum + sale.amount, 0).toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center">
                        <div className="p-3 rounded-lg bg-green-100 text-green-600">
                            <Package className="w-6 h-6" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm text-gray-500">Total Orders</p>
                            <p className="text-2xl font-bold text-gray-900">{filteredSales.length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center">
                        <div className="p-3 rounded-lg bg-yellow-100 text-yellow-600">
                            <User className="w-6 h-6" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm text-gray-500">Customers</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {new Set(filteredSales.map(s => s.email)).size}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center">
                        <div className="p-3 rounded-lg bg-purple-100 text-purple-600">
                            <CreditCard className="w-6 h-6" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm text-gray-500">Avg. Order Value</p>
                            <p className="text-2xl font-bold text-gray-900">
                                ${filteredSales.length > 0 
                                    ? (filteredSales.reduce((sum, sale) => sum + sale.amount, 0) / filteredSales.length).toFixed(2) 
                                    : '0.00'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}