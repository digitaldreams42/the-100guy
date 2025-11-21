// app/wishlist/page.js
'use client';

import React from 'react';
import { useStore } from '../../context/StoreContext';
import { Heart, ShoppingCart, Package, ArrowRight } from 'lucide-react';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Image from 'next/image';
import Link from 'next/link';

export default function WishlistPage() {
    const { wishlist, removeFromWishlist, addToCart, setSelectedProduct } = useStore();

    const handleAddToCart = (product) => {
        addToCart(product);
    };

    const handleViewDetails = (product) => {
        setSelectedProduct(product);
    };

    if (wishlist.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 py-12">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="text-center py-20">
                        <Heart className="w-24 h-24 mx-auto text-gray-300 mb-6" />
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Wishlist is Empty</h1>
                        <p className="text-gray-600 mb-8 max-w-md mx-auto">
                            Items you save for later will appear here. Start browsing our store to find products you love.
                        </p>
                        <Link href="/store">
                            <Button variant="primary" className="px-8">
                                Browse Store
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
                    <span className="text-gray-500">{wishlist.length} items</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wishlist.map((product) => (
                        <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="relative h-48">
                                {product.coverImage ? (
                                    <Image
                                        src={product.coverImage}
                                        alt={product.name}
                                        layout="fill"
                                        objectFit="cover"
                                    />
                                ) : (
                                    <div className={`h-full w-full bg-gradient-to-br ${product.coverColor || 'from-gray-400 to-gray-600'} flex items-center justify-center`}>
                                        <Package size={32} className="text-white opacity-50" />
                                    </div>
                                )}
                                <div className="absolute top-4 left-4 z-10">
                                    <Badge type={product.type}>{product.type}</Badge>
                                </div>
                                <button
                                    onClick={() => removeFromWishlist(product.id)}
                                    className="absolute top-4 right-4 z-10 p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
                                >
                                    <Heart size={16} className="text-red-500 fill-current" />
                                </button>
                            </div>

                            <div className="p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-1">{product.name}</h3>
                                <p className="text-sm text-gray-500 mb-2">{product.category}</p>
                                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{product.subtitle}</p>

                                <div className="flex items-center justify-between mt-4">
                                    <span className="text-xl font-black text-yellow-500">${product.price?.toFixed(2) || '0.00'}</span>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleAddToCart(product)}
                                            className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                            title="Add to Cart"
                                        >
                                            <ShoppingCart size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleViewDetails(product)}
                                            className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                            title="View Details"
                                        >
                                            <ArrowRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}