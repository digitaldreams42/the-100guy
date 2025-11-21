// app/success/page.js
'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Download, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Button from '../../components/ui/Button';
import { useStore } from '../../context/StoreContext'; // Import useStore

// New component to encapsulate client-side logic using useSearchParams
function SuccessContent() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const [lineItems, setLineItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [salesStatusMessage, setSalesStatusMessage] = useState(''); // New state for message
    const { refetchProducts, refetchAdminData } = useStore(); // Use store functions

    useEffect(() => {
        if (sessionId) {
            const fetchSession = async () => {
                try {
                    const response = await fetch(`/api/verify_session?session_id=${sessionId}`);
                    const data = await response.json();
                    if (response.ok) {
                        setLineItems(data.line_items);
                        // Check if new sales were recorded
                        if (data.newSalesRecorded && data.newSalesRecorded.length > 0) {
                            setSalesStatusMessage('Your purchase was recorded. Thank you!');
                            refetchProducts(); // Update product data (e.g., salesCount)
                            refetchAdminData(); // Update admin dashboard sales
                        } else {
                            setSalesStatusMessage('Your purchase details have been retrieved.');
                        }
                    } else {
                        throw new Error(data.message || 'Failed to verify session.');
                    }
                } catch (err) {
                    setError(err.message);
                } finally {
                    setLoading(false);
                }
            };
            fetchSession();
        } else {
            setLoading(false);
            setError('No session ID found.');
        }
    }, [sessionId, refetchProducts, refetchAdminData]); // Add refetch functions to dependencies

    return (
        <div className="bg-white p-10 rounded-2xl shadow-lg max-w-2xl w-full text-center">
            {loading ? (
                <div className="flex flex-col items-center">
                    <Loader2 className="w-16 h-16 text-blue-500 animate-spin mb-4" />
                    <h1 className="text-2xl font-bold text-gray-800">Verifying your purchase...</h1>
                </div>
            ) : error ? (
                <div className="text-red-500">
                    <h1 className="text-2xl font-bold mb-4">Error</h1>
                    <p>{error}</p>
                </div>
            ) : (
                <div>
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Payment Successful!</h1>
                    <p className="text-gray-600 mb-2">{salesStatusMessage}</p> {/* Display sales status */}
                    <p className="text-gray-600 mb-8">You can download your items below.</p>
                    
                    <div className="space-y-4 text-left">
                        {lineItems.map(item => (
                            <div key={item.id} className="bg-gray-100 p-4 rounded-lg flex justify-between items-center">
                                <div>
                                    <h4 className="font-bold text-gray-900">{item.price.product.name}</h4>
                                    <p className="text-sm text-gray-500">{item.description}</p>
                                </div>
                                <a 
                                    href={item.price.product.metadata.productFile} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                >
                                    <Download size={16} />
                                    Download
                                </a>
                            </div>
                        ))}
                    </div>

                    <div className="mt-10">
                        <Link href="/store" passHref>
                            <Button variant="outline">Continue Shopping</Button>
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}

// Main page component wrapped with Suspense
export default function SuccessPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Suspense fallback={
                <div className="bg-white p-10 rounded-2xl shadow-lg max-w-2xl w-full text-center flex flex-col items-center">
                    <Loader2 className="w-16 h-16 text-blue-500 animate-spin mb-4" />
                    <h1 className="text-2xl font-bold text-gray-800">Loading payment details...</h1>
                </div>
            }>
                <SuccessContent />
            </Suspense>
        </div>
    );
}
