// app/admin/login/page.js
'use client';

import { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import { User, Loader2 } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';


export default function AdminLoginPage() {
    const { loginAdmin, isUserAdmin, isLoading } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [localLoading, setLocalLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

    useEffect(() => {
        if (isUserAdmin) {
            router.replace('/admin/dashboard');
        }
    }, [isUserAdmin, router]);

    const handleLogin = (e) => {
        e.preventDefault();
        setError('');
        setLocalLoading(true);

        // The logic is now handled in AuthContext, making this a synchronous call
        const result = loginAdmin(email, password);
        
        setLocalLoading(false);

        if (!result.success) {
            setError(result.message || 'Login failed. Please check your credentials.');
        } else {
            router.replace('/admin/dashboard');
        }
    };

    if (isLoading || isUserAdmin) {
        return <div className="h-screen flex items-center justify-center text-lg text-gray-500">Redirecting...</div>;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl border border-gray-100">
                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-yellow-400 text-black mx-auto rounded-lg flex items-center justify-center mb-4">
                        <User size={24} />
                    </div>
                    <h1 className="text-2xl font-black text-gray-900">Admin Panel Access</h1>
                    <p className="text-sm text-gray-500">Sign in to manage the store and view analytics.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-yellow-500 focus:border-yellow-500"
                            placeholder="admin@example.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-yellow-500 focus:border-yellow-500"
                            placeholder="password"
                            required
                        />
                    </div>

                    {error && (
                        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                            {error}
                        </div>
                    )}

                    <Button
                        type="submit"
                        className="w-full"
                        loading={localLoading}
                        icon={!localLoading && User}
                    >
                        {localLoading ? 'Signing In...' : 'Sign In'}
                    </Button>
                </form>

                <p className="mt-6 text-xs text-center text-gray-400">
                    NOTE: For this demo, use the admin credentials from the .env file.
                </p>
            </div>
        </div>
    );
}
