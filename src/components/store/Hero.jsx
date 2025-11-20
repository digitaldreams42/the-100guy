// components/store/Hero.jsx

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import Button from '../ui/Button';

// Static content, can be a Server Component (no 'use client')
export default function Hero() {
    return (
        <div className="relative bg-gradient-to-br from-yellow-300 via-yellow-400 to-orange-500 pt-20 pb-32 overflow-hidden">
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-72 h-72 bg-orange-600 opacity-20 rounded-full blur-3xl"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <h2 className="text-lg font-bold tracking-wider text-yellow-900 uppercase mb-4">Build Digital Wealth</h2>
        <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-6 leading-tight">
          THE $100 GUY<br/>
          <span className="text-white text-stroke">BLUEPRINT</span>
        </h1>
        <p className="max-w-2xl mx-auto text-xl text-gray-800 font-medium mb-10">
          Books that challenge everything you've been told. Truth that makes you uncomfortable. Ideas that change lives.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/store" passHref>
                        <Button variant="secondary" icon={ShoppingCart}>
                            Browse Store
                        </Button>
                    </Link>
          <Button onClick={() => document.getElementById('newsletter')?.scrollIntoView({behavior: 'smooth'})} variant="outline" className="bg-white/20 border-gray-900">
            Get Free Updates
          </Button>
        </div>
      </div>
    </div>
    );
}