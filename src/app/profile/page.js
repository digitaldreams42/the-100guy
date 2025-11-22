// app/profile/page.js
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { User, Mail, Calendar, ShoppingCart, Star, Package, Download, Users, ArrowRight } from 'lucide-react';
import Button from '../../components/ui/Button';
import Link from 'next/link';

export default function ProfilePage() {
    const { user, isLoading, logout } = useAuth();
    const { userOrders, refetchUserOrders, wishlist } = useStore();
    const [editMode, setEditMode] = useState(false);
    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');

    useEffect(() => {
        if (user) {
            setDisplayName(user.displayName || user.email?.split('@')[0] || '');
            setEmail(user.email || '');
        }
    }, [user]);

    const handleSaveProfile = async () => {
        // In a real implementation, this would update the user's profile in Firebase
        // For now, just switch back to view mode
        setEditMode(false);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 py-12">
                <div className="max-w-3xl mx-auto px-4 text-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Profile Access</h1>
                    <p className="text-gray-600 mb-6">Please log in to access your profile.</p>
                    <Button variant="primary" onClick={() => window.location.href = '/login'}>
                        Login
                    </Button>
                </div>
            </div>
        );
    }

    // Group orders by status
    const completedOrders = userOrders.filter(order => order.status === 'completed');
    const pendingOrders = userOrders.filter(order => order.status !== 'completed');

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-6xl mx-auto px-4">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">My Account</h1>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Profile Info Section */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 sticky top-24">
                            <div className="flex flex-col items-center mb-6">
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mb-4">
                                    <User className="h-12 w-12 text-white" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">
                                    {editMode ? (
                                        <input
                                            type="text"
                                            value={displayName}
                                            onChange={(e) => setDisplayName(e.target.value)}
                                            className="border-b border-gray-300 text-center text-xl font-bold text-gray-900 bg-transparent"
                                        />
                                    ) : (
                                        user.displayName || user.email?.split('@')[0] || 'User'
                                    )}
                                </h2>
                                <p className="text-gray-500 text-sm">{user.email}</p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center text-gray-600">
                                    <Mail className="w-4 h-4 mr-3" />
                                    <span className="text-sm">{user.email}</span>
                                </div>
                            </div>

                            <div className="mt-6 space-y-3">
                                {editMode ? (
                                    <>
                                        <Button
                                            variant="primary"
                                            className="w-full"
                                            onClick={handleSaveProfile}
                                        >
                                            Save Changes
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                            onClick={() => setEditMode(false)}
                                        >
                                            Cancel
                                        </Button>
                                    </>
                                ) : (
                                    <Button
                                        variant="secondary"
                                        className="w-full"
                                        onClick={() => setEditMode(true)}
                                    >
                                        Edit Profile
                                    </Button>
                                )}

                                <Button
                                    variant="outline"
                                    className="w-full text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
                                    onClick={logout}
                                >
                                    Logout
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-3 space-y-8">
                        {/* Stats Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
                                <div className="flex items-center">
                                    <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
                                        <ShoppingCart className="w-6 h-6" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm text-gray-500">Total Orders</p>
                                        <p className="text-2xl font-bold text-gray-900">{userOrders.length}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
                                <div className="flex items-center">
                                    <div className="p-3 rounded-lg bg-green-100 text-green-600">
                                        <Package className="w-6 h-6" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm text-gray-500">Wishlist</p>
                                        <p className="text-2xl font-bold text-gray-900">{wishlist.length}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
                                <div className="flex items-center">
                                    <div className="p-3 rounded-lg bg-yellow-100 text-yellow-600">
                                        <Star className="w-6 h-6" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm text-gray-500">Spent</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            ${userOrders.reduce((total, order) => total + (order.productPrice || 0), 0).toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Orders Section */}
                        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                                    <ShoppingCart className="w-5 h-5 mr-2" />
                                    Order History
                                </h3>
                                <Link href="/store" className="text-sm text-yellow-600 hover:text-yellow-500 flex items-center">
                                    Continue shopping <ArrowRight className="w-4 h-4 ml-1" />
                                </Link>
                            </div>

                            {userOrders.length === 0 ? (
                                <div className="text-center py-12">
                                    <ShoppingCart className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                                    <p className="text-gray-500">No orders yet</p>
                                    <p className="text-sm text-gray-400 mt-1">Your purchased products will appear here</p>
                                    <Link href="/store">
                                        <Button variant="primary" className="mt-4">
                                            Browse Store
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {completedOrders.map((order) => (
                                        <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-medium text-gray-900">{order.productTitle}</h4>
                                                    <p className="text-sm text-gray-500">Order ID: {order.id}</p>
                                                    <p className="text-sm text-gray-500">
                                                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Date unknown'}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-gray-900">${order.productPrice?.toFixed(2)}</p>
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        {order.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {pendingOrders.length > 0 && (
                                        <>
                                            <h4 className="text-md font-bold text-gray-900 mt-6 mb-3">Pending Orders</h4>
                                            {pendingOrders.map((order) => (
                                                <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h4 className="font-medium text-gray-900">{order.productTitle}</h4>
                                                            <p className="text-sm text-gray-500">Order ID: {order.id}</p>
                                                            <p className="text-sm text-gray-500">
                                                                {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Date unknown'}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-bold text-gray-900">${order.productPrice?.toFixed(2)}</p>
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                                {order.status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Wishlist Preview */}
                        {wishlist.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-bold text-gray-900 flex items-center">
                                        <Star className="w-5 h-5 mr-2" />
                                        My Wishlist ({wishlist.length})
                                    </h3>
                                    <Link href="/wishlist" className="text-sm text-yellow-600 hover:text-yellow-500 flex items-center">
                                        View All <ArrowRight className="w-4 h-4 ml-1" />
                                    </Link>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {wishlist.slice(0, 3).map((product) => (
                                        <div key={product.id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors">
                                            <div className="flex items-center">
                                                <div className="w-12 h-12 rounded bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center mr-3">
                                                    <Package className="w-6 h-6 text-white" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-medium text-gray-900 truncate">{product.name}</h4>
                                                    <p className="text-sm text-yellow-500 font-bold">${product.price?.toFixed(2)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}