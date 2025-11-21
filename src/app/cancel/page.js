// app/cancel/page.js
'use client';

import React from 'react';
import { XCircle } from 'lucide-react';
import Link from 'next/link';
import Button from '../../components/ui/Button';

export default function CancelPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white p-10 rounded-2xl shadow-lg max-w-2xl w-full text-center">
                <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Payment Cancelled</h1>
                <p className="text-gray-600 mb-8">Your order was cancelled. You have not been charged.</p>
                
                <div className="mt-10">
                    <Link href="/store" passHref>
                        <Button variant="outline">Return to Store</Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
