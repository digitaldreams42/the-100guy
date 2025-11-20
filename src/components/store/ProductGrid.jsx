// components/store/ProductGrid.jsx
'use client';

import React from 'react';
import { Package, Users, ArrowRight, Check, Star, ChevronRight } from 'lucide-react';
import Badge from '../ui/Badge';
import { useStore } from '../../context/StoreContext';

export default function ProductGrid({ items }) {
    const { setSelectedProduct } = useStore();

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
                <div 
                    key={product.id} 
                    onClick={() => setSelectedProduct(product)} 
                    className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100 flex flex-col"
                >
                    <div className={`h-48 bg-gradient-to-br ${product.coverColor} p-6 flex flex-col justify-between relative overflow-hidden`}>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
                        <div className="flex justify-between items-start z-10">
                            <Badge type={product.type}>{product.type}</Badge>
                            {product.status === 'coming-soon' && <Badge type="coming-soon">Coming Soon</Badge>}
                        </div>
                        <div className="z-10">
                            <div className="bg-white/20 backdrop-blur-md w-12 h-12 rounded-lg flex items-center justify-center text-white mb-2">
                                {product.type === 'Book' ? <ArrowRight size={24} /> : product.type === 'Course' ? <Users size={24} /> : <Package size={24} />}
                            </div>
                        </div>
                    </div>
                    
                    <div className="p-6 flex-1 flex flex-col">
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-yellow-500 transition-colors">{product.title}</h3>
                            <p className="text-sm text-gray-500 mb-4">{product.subtitle}</p>
                            
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
                            <span className="text-sm font-bold text-gray-900 flex items-center group-hover:translate-x-1 transition-transform">
                                View Details <ChevronRight size={16} className="ml-1" />
                            </span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}