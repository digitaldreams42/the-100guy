// components/modals/CartModal.jsx
'use client';

import React from 'react';
import { X, ShoppingCart, Trash2 } from 'lucide-react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { useStore } from '../../context/StoreContext';

export default function CartModal() {
    const { isCartOpen, setIsCartOpen, cart, removeFromCart, processPayment, isProcessing } = useStore();

    if (!isCartOpen) return null;

    const total = cart.reduce((sum, item) => sum + parseFloat(item.price || 0), 0);

    return (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-in-right">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900">Your Cart</h2>
                    <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400">
                            <ShoppingCart size={64} className="mb-4 opacity-20" />
                            <p>Your cart is empty</p>
                            <Button onClick={() => setIsCartOpen(false)} variant="ghost" className="mt-4">
                                Continue Shopping
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {cart.map((item) => (
                                <div key={item.id} className="flex gap-4 bg-gray-50 p-4 rounded-xl">
                                    <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${item.coverColor} flex-shrink-0`}></div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-gray-900 line-clamp-1">{item.title}</h4>
                                        <Badge type={item.type}>{item.type}</Badge>
                                        <div className="mt-1 font-medium text-gray-900">${item.price?.toFixed(2)}</div>
                                    </div>
                                    <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {cart.length > 0 && (
                    <div className="p-6 border-t border-gray-100 bg-white">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-gray-500">Subtotal</span>
                            <span className="text-2xl font-black text-gray-900">${total.toFixed(2)}</span>
                        </div>
                        <p className="text-xs text-gray-400 mb-4 text-center">Secured by Stripe/Flutterwave</p>
                        <Button 
                            onClick={processPayment} 
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white hover:shadow-blue-200"
                            loading={isProcessing}
                            disabled={isProcessing}
                        >
                            {isProcessing ? 'Processing...' : 'Checkout Now'}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}