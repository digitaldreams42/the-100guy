// app/admin/dashboard/subscribers/page.js
'use client';

import React, { useState } from 'react';
import { useStore } from '../../../../context/StoreContext';
import { Users, Trash2, Send } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import { deleteSubscriber } from '../../../../lib/data';

// --- Components ---

const BroadcastForm = ({ showNotification }) => {
    const [subject, setSubject] = useState('');
    const [htmlContent, setHtmlContent] = useState('<p>Write your email content here!</p>');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!subject || !htmlContent) {
            showNotification('Subject and content are required.', 'error');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('/api/broadcast', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subject, htmlContent }),
            });
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to send broadcast.');
            }

            showNotification(result.message, 'success');
            setSubject('');
            setHtmlContent('<p>Write your email content here!</p>');

        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Create Broadcast</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Subject</label>
                    <input 
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        placeholder="Your amazing newsletter subject"
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Content (HTML)</label>
                        <textarea 
                            value={htmlContent}
                            onChange={(e) => setHtmlContent(e.target.value)}
                            required
                            rows="15"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 font-mono text-sm"
                            placeholder="<h1>My Title</h1><p>My paragraph.</p>"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Live Preview</label>
                        <iframe 
                            srcDoc={htmlContent}
                            title="Email Preview"
                            className="mt-1 w-full h-full border border-gray-300 rounded-md bg-white"
                            style={{minHeight: '300px'}}
                        />
                    </div>
                </div>
                <div className="text-right">
                    <Button type="submit" icon={Send} loading={isLoading}>
                        {isLoading ? 'Sending...' : 'Send Broadcast'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

const SubscribersTable = ({ subscribers, showNotification, refetchAdminData }) => {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteSubscriber = async (subscriberId, email) => {
        if (!window.confirm(`Are you sure you want to delete subscriber: ${email}? This action cannot be undone.`)) {
            return;
        }
        setIsDeleting(true);
        const result = await deleteSubscriber(subscriberId);
        setIsDeleting(false);
        showNotification(result.message, result.success ? 'success' : 'error');
        if (result.success) {
            await refetchAdminData();
        }
    };

    return (
        <div id="subscribers" className="bg-white p-6 rounded-xl shadow-md overflow-x-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Subscribers ({subscribers.length})</h2>
            
            {subscribers.length === 0 ? (
                 <p className="text-gray-500">No subscribers yet.</p>
            ) : (
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Subscribed</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {subscribers.map((sub) => (
                            <tr key={sub.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{sub.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(sub.subscribedAt).toLocaleDateString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button 
                                        onClick={() => handleDeleteSubscriber(sub.id, sub.email)}
                                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                                        disabled={isDeleting}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default function AdminSubscribersPage() {
    const { subscribers, showNotification, refetchAdminData } = useStore();

    return (
        <div className="space-y-8">
            <BroadcastForm showNotification={showNotification} />
            <SubscribersTable 
                subscribers={subscribers} 
                showNotification={showNotification}
                refetchAdminData={refetchAdminData}
            />
        </div>
    );
}