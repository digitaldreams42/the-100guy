// app/page.js
'use client';

import React from 'react';
import Link from 'next/link';
import Hero from '../components/store/Hero';
import ProductGrid from '../components/store/ProductGrid';
import Button from '../components/ui/Button';
import { Package, Users, Download, ArrowRight, Bell, Star, Sparkles, Target, Zap, Award } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { PRODUCT_TYPES } from '../lib/constants';

export default function HomePage() {
    const { products, setActiveFilter, handleSubscribe, subscribers } = useStore();
    const featuredProducts = products.slice(0, 3);
    const [email, setEmail] = React.useState('');

    const handleNewsletterSubmit = (e) => {
        e.preventDefault();
        handleSubscribe(email);
        setEmail('');
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Hero />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10 mb-20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[PRODUCT_TYPES.BOOK, PRODUCT_TYPES.COURSE, PRODUCT_TYPES.TEMPLATE].map(type => (
                        <div key={type} className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:-translate-y-1 transition-transform duration-300">
                            <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center mb-4 text-yellow-600">
                                {type === PRODUCT_TYPES.BOOK ? <Package size={24}/> : type === PRODUCT_TYPES.COURSE ? <Users size={24}/> : <Download size={24}/>}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{type}s</h3>
                            <p className="text-gray-500 mb-4">Premium {type.toLowerCase()}s to accelerate your growth.</p>
                            <Link href="/store" passHref>
                                <button
                                    onClick={() => setActiveFilter(type)}
                                    className="text-yellow-600 font-bold flex items-center text-sm hover:underline"
                                >
                                    View {type}s <ArrowRight size={16} className="ml-1" />
                                </button>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 mb-2">Products</h2>
                        <p className="text-gray-500">Hand-picked by George himself.</p>
                    </div>
                    <Link href="/store" passHref>
                        <Button variant="ghost">
                            View All
                        </Button>
                    </Link>
                </div>
                <ProductGrid items={featuredProducts} />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
                <div className="grid md:grid-cols-2 bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100">
                    <div className="p-12 flex flex-col justify-center">
                        <h2 className="text-3xl font-black text-gray-900 mb-4">About George</h2>
                        <p className="text-gray-600 mb-6 text-lg">
                            I built a $100k business with nothing but a laptop and an internet connection. Now I'm sharing the exact blueprints, templates, and strategies I used to get here. No fluff, just actionable value.
                        </p>
                        <div className="flex gap-4">
                            <Link href="/about" passHref>
                                <Button variant="secondary">Read My Story</Button>
                            </Link>
                        </div>
                    </div>
                    <div className="bg-gray-900 h-full min-h-[300px] relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-black"></div>
                        <div className="absolute inset-0 flex items-center justify-center opacity-10">
                            <span className="text-9xl font-black text-white -rotate-12">$100</span>
                        </div>
                    </div>
                </div>
            </div>

            <div id="newsletter" className="bg-yellow-400 py-20">
                <div className="max-w-3xl mx-auto px-4 text-center">
                    <div className="w-16 h-16 bg-black text-yellow-400 rounded-2xl mx-auto flex items-center justify-center mb-6 transform rotate-3">
                        <Bell size={32} />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black text-black mb-4">Join {subscribers.length > 100 ? subscribers.length : '1,200+'} Wealth Builders</h2>
                    <p className="text-black/80 font-medium mb-8 text-lg">Get free tips, early access to drops, and exclusive discounts from George himself.</p>

                    <form
                        onSubmit={(e) => { e.preventDefault(); handleSubscribe(e.target.email.value); e.target.reset(); }}
                        className="flex flex-col md:flex-row gap-4 max-w-lg mx-auto"
                    >
                        <input
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        className="flex-1 px-6 py-4 rounded-xl border-2 border-black focus:outline-none focus:ring-4 focus:ring-black/20 font-medium"
                        required
                        />
                        <button type="submit" className="bg-black text-white px-8 py-4 rounded-xl font-bold hover:bg-gray-900 hover:scale-105 transition-all">
                        Subscribe Now
                        </button>
                    </form>
                    <p className="text-xs font-bold uppercase tracking-widest mt-4 opacity-50">No Spam. Unsubscribe anytime.</p>
                </div>
            </div>
        </div>
    );
}