// components/modals/ProductModal.jsx
'use client';

import React, { useState } from 'react';
import { X, Check, Star, Tag, Loader2 } from 'lucide-react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { useStore } from '../../context/StoreContext';
import Image from 'next/image';

export default function ProductModal() {
    const { selectedProduct, setSelectedProduct, addToCart, showNotification } = useStore();
    const [isLoading, setIsLoading] = useState(false);

    if (!selectedProduct) return null;

    const product = selectedProduct;

    const handleBuyNow = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/checkout_sessions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ cart: [product] }), // Send only the current product
            });

            const { url, message } = await response.json();

            if (response.ok) {
                window.location.href = url; // Redirect to Stripe checkout
            } else {
                throw new Error(message || 'Failed to create checkout session.');
            }
        } catch (error) {
            console.error(error);
            showNotification(error.message, 'error');
            setIsLoading(false);
        }
    };
    
    const handleAddToCart = () => {
        addToCart(product);
        setSelectedProduct(null);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white w-full max-w-4xl h-[90vh] max-h-[700px] rounded-3xl shadow-2xl flex overflow-hidden">
                {/* Left Side: Image (fixed) */}
                <div className="relative hidden md:block md:w-1/2">
                    {product.coverImage ? (
                        <Image 
                            src={product.coverImage} 
                            alt={product.name} 
                            layout="fill" 
                            objectFit="cover" 
                        />
                    ) : (
                        <div className={`h-full w-full bg-gradient-to-br ${product.coverColor}`}></div>
                    )}
                    <div className="absolute inset-0 bg-black/20"></div> {/* Overlay */}

                    {/* Content on top of image */}
                    <div className="absolute bottom-8 left-8 right-8 z-10 text-white">
                        <Badge type={product.type} className="mb-4">{product.type}</Badge>
                        <h2 className="text-4xl font-black mb-2 leading-tight">{product.name}</h2>
                        <p className="text-white/80">{product.subtitle}</p>
                    </div>
                </div>

                {/* Right Side: Details (scrollable) */}
                <div className="w-full md:w-1/2 p-8 relative overflow-y-auto">
                    <button 
                        onClick={() => setSelectedProduct(null)} 
                        className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full"
                    >
                        <X size={24} />
                    </button>

                    <div className="flex items-center gap-2 mb-4 text-gray-600 text-sm">
                        <Tag size={16} />
                        <span>{product.category}</span>
                    </div>
                    
                    <h1 className="text-3xl font-bold text-gray-900 mt-4 mb-2">{product.name}</h1>
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
                    
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 mt-auto">
                        <div className="flex justify-between items-end mb-4">
                            <span className="text-gray-500">Total Price</span>
                            <span className="text-4xl font-black text-gray-900">${product.price?.toFixed(2)}</span>
                        </div>
                        <div className="text-sm text-gray-600 mb-4">
                            Stock: {product.stock === 0 ? 'Unlimited' : product.stock > 0 ? `${product.stock} left` : 'Out of Stock'}
                        </div>
                        <div className="grid gap-3">
                            <Button 
                                onClick={handleAddToCart}
                                className="w-full"
                                disabled={product.stock !== 0 && product.stock <= 0 || isLoading}
                            >
                                Add to Cart
                            </Button>
                            {product.status === 'published' && (
                                <Button 
                                    onClick={handleBuyNow}
                                    variant="secondary" 
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                    disabled={product.stock !== 0 && product.stock <= 0 || isLoading}
                                    loading={isLoading}
                                    icon={isLoading ? Loader2 : null}
                                >
                                    Buy Now
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}