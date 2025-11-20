// components/modals/ProductModal.jsx
'use client';

import React from 'react';
import { X, Package, Check, Star } from 'lucide-react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { useStore } from '../../context/StoreContext';

export default function ProductModal() {
    const { selectedProduct, setSelectedProduct, addToCart, setIsCartOpen } = useStore();

    if (!selectedProduct) return null;

    const product = selectedProduct;

    const handleBuyNow = () => {
        addToCart(product);
        setSelectedProduct(null);
        setIsCartOpen(true);
    }
    
    const handleAddToCart = () => {
        addToCart(product);
        setSelectedProduct(null);
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto animate-fade-in">
                <div className="grid md:grid-cols-2">
                    <div className={`bg-gradient-to-br ${product.coverColor} p-12 flex flex-col justify-center items-center text-white relative`}>
                        <button 
                            onClick={() => setSelectedProduct(null)} 
                            className="absolute top-4 left-4 p-2 bg-black/20 rounded-full hover:bg-black/40 md:hidden"
                        >
                            <X size={20} />
                        </button>
                        <Package size={64} className="mb-6 opacity-90" />
                        <h2 className="text-3xl font-black text-center mb-2">{product.title}</h2>
                        <p className="text-white/80 text-center">{product.subtitle}</p>
                        
                        <div className="mt-12 grid grid-cols-2 gap-8 w-full max-w-xs">
                            <div className="text-center">
                                <div className="text-2xl font-bold">{product.downloads || 0}</div>
                                <div className="text-xs opacity-75 uppercase tracking-wider">Downloads</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold flex items-center justify-center">4.9 <Star size={16} className="fill-white ml-1"/></div>
                                <div className="text-xs opacity-75 uppercase tracking-wider">Rating</div>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 relative">
                        <button 
                            onClick={() => setSelectedProduct(null)} 
                            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full hidden md:block"
                        >
                            <X size={24} />
                        </button>

                        <Badge type={product.type}>{product.type}</Badge>
                        <h1 className="text-3xl font-bold text-gray-900 mt-4 mb-2">{product.title}</h1>
                        <p className="text-lg text-gray-600 mb-6">{product.description}</p>

                        <h3 className="font-bold text-gray-900 mb-3">What's Included:</h3>
                        <ul className="space-y-3 mb-8">
                            {product.features?.map((feature, i) => (
                                <li key={i} className="flex items-center text-gray-700">
                                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mr-3 text-green-600 flex-shrink-0">
                                        <Check size={12} />
                                    </div>
                                    {feature}
                                </li>
                            ))}
                        </ul>

                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 mb-6">
                            <div className="flex justify-between items-end mb-4">
                                <span className="text-gray-500">Total Price</span>
                                <span className="text-4xl font-black text-gray-900">${product.price?.toFixed(2)}</span>
                            </div>
                            <div className="grid gap-3">
                                <Button 
                                    onClick={handleAddToCart}
                                    className="w-full"
                                >
                                    Add to Cart
                                </Button>
                                {product.status === 'published' && (
                                    <Button 
                                        onClick={handleBuyNow}
                                        variant="secondary" 
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                        Buy Now
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}