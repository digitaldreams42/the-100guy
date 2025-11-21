// components/store/ProductGrid.jsx
'use client';

import React from 'react';
import { Package, Users, ArrowRight, Check, Star, ChevronRight, Heart } from 'lucide-react';
import Badge from '../ui/Badge';
import { useStore } from '../../context/StoreContext';
import Image from 'next/image'; // Import Next.js Image component
import Link from 'next/link'; // Import Link for navigation

export default function ProductGrid({ items }) {
    const { addToWishlist, wishlist } = useStore();

    const isInWishlist = (productId) => {
        return wishlist.some(item => item.id === productId);
    };

    if (!items || items.length === 0) {
        return (
            <div className="col-span-full py-20 text-center">
                <Package size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No products found</h3>
                <p className="text-gray-500">Try adjusting your search or filters.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {items.map(product => (
                <div key={product.id} className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col">
                    <Link href={`/products/${product.id}`}>
                        <div className="relative h-48 overflow-hidden cursor-pointer">
                            {product.coverImage ? (
                                <Image
                                    src={product.coverImage}
                                    alt={product.name}
                                    layout="fill"
                                    objectFit="cover"
                                    className="transition-transform group-hover:scale-105"
                                />
                            ) : (
                                <div
                                    className={`h-full w-full bg-gradient-to-br ${product.coverColor} flex items-center justify-center text-white text-lg font-bold cursor-pointer`}
                                >
                                    No Image
                                </div>
                            )}
                        </div>
                    </Link>

                    <div className="relative">
                        <div className="absolute top-4 left-4 z-10">
                            <Badge type={product.type}>{product.type}</Badge>
                        </div>
                        {product.status === 'coming-soon' && (
                            <div className="absolute top-4 right-4 z-10">
                                <Badge type="coming-soon">Coming Soon</Badge>
                            </div>
                        )}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                addToWishlist(product);
                            }}
                            className={`absolute top-4 right-4 z-20 p-2 rounded-full transition-colors ${
                                isInWishlist(product.id)
                                    ? 'bg-red-500 text-white'
                                    : 'bg-white/80 text-gray-700 hover:bg-white hover:text-red-500'
                            }`}
                        >
                            <Heart
                                size={16}
                                className={isInWishlist(product.id) ? 'fill-current' : ''}
                            />
                        </button>
                    </div>

                    <Link href={`/products/${product.id}`}>
                        <div className="p-6 flex-1 flex flex-col cursor-pointer">
                            <div className="flex-1">
                                <h3
                                    className="text-xl font-bold text-gray-900 mb-1 group-hover:text-yellow-500 transition-colors cursor-pointer"
                                >
                                    {product.name}
                                </h3>
                                <p className="text-sm text-gray-500 mb-2">{product.category}</p> {/* Display Category */}
                                <p
                                    className="text-sm text-gray-500 mb-4 cursor-pointer"
                                >
                                    {product.subtitle}
                                </p>

                                <div className="space-y-2 mb-6">
                                    {product.features?.slice(0, 2).map((feature, i) => (
                                        <div key={i} className="flex items-center text-xs text-gray-600">
                                            <Check size={12} className="text-green-500 mr-2" />
                                            {feature}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
                                <span className="text-2xl font-black text-yellow-500">${product.price?.toFixed(2) || '0.00'}</span>
                                <span
                                    className="text-sm font-bold text-gray-900 flex items-center group-hover:translate-x-1 transition-transform cursor-pointer"
                                >
                                    View Details <ChevronRight size={16} className="ml-1" />
                                </span>
                            </div>
                        </div>
                    </Link>
                </div>
            ))}
        </div>
    );
}