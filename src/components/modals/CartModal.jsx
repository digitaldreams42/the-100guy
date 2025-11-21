// components/modals/CartModal.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { X, ShoppingCart, Trash2, Loader2, Tag, Percent, Truck } from 'lucide-react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { trackAbandonedCart } from '../../lib/abandoned-cart-service';
import { validateCoupon, applyCoupon } from '../../lib/coupon-service';
import Image from 'next/image';

export default function CartModal() {
    const { isCartOpen, setIsCartOpen, cart, removeFromCart, showNotification } = useStore();
    const { user } = useAuth();
    const [isProcessing, setIsProcessing] = useState(false);
    const [previousCart, setPreviousCart] = useState([]);
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponError, setCouponError] = useState('');

    // Track cart changes to detect if items were added
    useEffect(() => {
        if (cart.length > 0 && previousCart.length === 0) {
            // Cart was just populated, save it for later tracking
            setPreviousCart([...cart]);
        } else if (cart.length === 0 && previousCart.length > 0) {
            // Cart was emptied, reset tracking
            setPreviousCart([]);
        } else if (cart.length > 0 && previousCart.length > 0) {
            // Cart items changed, update tracking
            setPreviousCart([...cart]);
        }
    }, [cart, previousCart.length]);

    if (!isCartOpen) return null;

    const subtotal = cart.reduce((sum, item) => sum + parseFloat(item.price || 0), 0);
    const discount = appliedCoupon ? appliedCoupon.discount : 0;
    const total = Math.max(subtotal - discount, 0); // Ensure total doesn't go below 0

    const handleCheckout = async () => {
        setIsProcessing(true);
        try {
            const checkoutCart = {
                ...cart,
                appliedCoupon: appliedCoupon || null,
                subtotal,
                discount,
                total
            };

            const response = await fetch('/api/checkout_sessions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cart: checkoutCart }),
            });

            const { url, message } = await response.json();

            if (response.ok) {
                window.location.href = url;
                // Clear the cart tracking when checkout is successful
                setPreviousCart([]);
                // Clear applied coupon
                setAppliedCoupon(null);
                setCouponCode('');
            } else {
                throw new Error(message || 'Failed to create checkout session.');
            }
        } catch (error) {
            console.error(error);
            showNotification(error.message, 'error');
            setIsProcessing(false);
        }
    };

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) {
            setCouponError('Please enter a coupon code');
            return;
        }

        const result = applyCoupon(couponCode.trim(), cart);

        if (result.valid) {
            setAppliedCoupon(result);
            setCouponError('');
            showNotification(`Coupon applied! You saved $${result.savings.toFixed(2)}`, 'success');
        } else {
            setCouponError(result.message);
            setAppliedCoupon(null);
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setCouponCode('');
        setCouponError('');
    };

    // Handle cart modal closing - track abandoned cart if user has items but doesn't checkout
    const handleClose = () => {
        if (cart.length > 0 && user) {
            // User has items in cart but is closing without checking out
            trackAbandonedCart(user.email, cart).then(result => {
                if (result.success) {
                    console.log('Abandoned cart tracked for:', user.email);
                }
            }).catch(error => {
                console.error('Error tracking abandoned cart:', error);
            });
        }
        setIsCartOpen(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="cart-modal-title">
            <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-in-right">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 id="cart-modal-title" className="text-xl font-bold text-gray-900">Your Cart</h2>
                    <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label="Close cart">
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
                                    <div className="w-16 h-16 rounded-lg relative overflow-hidden flex-shrink-0">
                                        {item.coverImage && (
                                            <Image
                                                src={item.coverImage}
                                                alt={item.name}
                                                layout="fill"
                                                objectFit="cover"
                                            />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-gray-900 line-clamp-1">{item.name}</h4>
                                        <Badge type={item.type}>{item.type}</Badge>
                                        <div className="mt-1 font-medium text-gray-900">${item.price?.toFixed(2)}</div>
                                    </div>
                                    <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}

                            {/* Coupon section */}
                            <div className="mt-6 p-4 border border-gray-200 rounded-xl">
                                <div className="flex items-center mb-2">
                                    <Tag className="text-gray-500 mr-2" size={16} />
                                    <h3 className="font-medium text-gray-900">Discount Code</h3>
                                </div>

                                <div className="flex">
                                    <input
                                        type="text"
                                        value={couponCode}
                                        onChange={(e) => {
                                            setCouponCode(e.target.value);
                                            if (couponError) setCouponError('');
                                        }}
                                        placeholder="Enter coupon code"
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                                        onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
                                    />
                                    {appliedCoupon ? (
                                        <Button
                                            variant="outline"
                                            className="border-l-0 rounded-l-none rounded-r-lg bg-red-50 text-red-600 hover:bg-red-100"
                                            onClick={handleRemoveCoupon}
                                        >
                                            Remove
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="secondary"
                                            className="border-l-0 rounded-l-none rounded-r-lg"
                                            onClick={handleApplyCoupon}
                                        >
                                            Apply
                                        </Button>
                                    )}
                                </div>

                                {couponError && (
                                    <p className="text-red-500 text-sm mt-2">{couponError}</p>
                                )}

                                {appliedCoupon && (
                                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                        <div className="flex justify-between items-center">
                                            <span className="text-green-700 font-medium">{appliedCoupon.coupon.code}</span>
                                            <span className="text-green-700 font-bold">-${appliedCoupon.savings.toFixed(2)}</span>
                                        </div>
                                        <p className="text-green-600 text-xs mt-1">{appliedCoupon.coupon.description}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {cart.length > 0 && (
                    <div className="p-6 border-t border-gray-100 bg-white">
                        <div className="space-y-2 mb-4">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Subtotal</span>
                                <span className="text-gray-900">${subtotal.toFixed(2)}</span>
                            </div>

                            {appliedCoupon && (
                                <div className="flex justify-between text-green-600">
                                    <span>Discount ({appliedCoupon.coupon.code})</span>
                                    <span className="font-medium">-${appliedCoupon.savings.toFixed(2)}</span>
                                </div>
                            )}

                            <div className="flex justify-between pt-2 border-t border-gray-200">
                                <span className="text-gray-900 font-medium">Total</span>
                                <span className="text-2xl font-black text-gray-900">${total.toFixed(2)}</span>
                            </div>
                        </div>

                        <p className="text-xs text-gray-400 mb-4 text-center">Secured by Stripe</p>
                        <Button
                            onClick={handleCheckout}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white hover:shadow-blue-200"
                            loading={isProcessing}
                            disabled={isProcessing}
                            icon={isProcessing ? Loader2 : null}
                        >
                            {isProcessing ? 'Processing...' : 'Checkout Now'}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}