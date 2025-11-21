// app/admin/settings/page.js
'use client';

import { useState, useEffect } from 'react';
import { Save, AlertCircle, Shield, Palette, Mail, Link, Globe, Calendar, Clock } from 'lucide-react';
import Button from '../../../components/ui/Button';

export default function SiteSettings() {
    const [settings, setSettings] = useState({
        siteName: 'GStore',
        siteDescription: 'Your go-to store for digital products',
        siteLogo: '',
        siteFavicon: '',
        contactEmail: 'admin@example.com',
        socialLinks: {
            twitter: '',
            facebook: '',
            instagram: '',
            linkedin: ''
        },
        footerText: '© 2023 GStore. All rights reserved.',
        enableNewsletter: true,
        enableBlog: true,
        enableWishlist: true,
        analyticsId: '',
        theme: 'default',
        customCss: '',
        customJs: '',
        currency: 'USD',
        timezone: 'UTC',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: 'HH:mm'
    });
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState(null);

    // Fetch current settings
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await fetch('/api/settings');
                if (response.ok) {
                    const data = await response.json();
                    setSettings(data);
                } else {
                    throw new Error('Failed to fetch settings');
                }
            } catch (error) {
                showNotification('Error loading settings: ' + error.message, 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        if (name.startsWith('socialLinks.')) {
            const socialField = name.split('.')[1];
            setSettings(prev => ({
                ...prev,
                socialLinks: {
                    ...prev.socialLinks,
                    [socialField]: value
                }
            }));
        } else {
            setSettings(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    const handleSaveSettings = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('/api/settings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(settings)
            });

            const result = await response.json();

            if (response.ok) {
                showNotification('Site settings updated successfully!');
            } else {
                throw new Error(result.message || 'Failed to update settings');
            }
        } catch (error) {
            showNotification('Error updating settings: ' + error.message, 'error');
        }
    };

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-center items-center h-48">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <p className="ml-2 text-gray-600">Loading settings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Notification */}
            {notification && (
                <div className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg ${
                    notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                    <div className="flex items-center">
                        <AlertCircle className="w-5 h-5 mr-2" />
                        {notification.message}
                    </div>
                </div>
            )}

            <h1 className="text-3xl font-bold text-gray-900 mb-8">Site Settings</h1>

            <form onSubmit={handleSaveSettings} className="space-y-8">
                {/* General Settings */}
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <div className="flex items-center mb-4">
                        <Shield className="w-5 h-5 mr-2 text-gray-700" />
                        <h2 className="text-xl font-bold text-gray-900">General Settings</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="siteName" className="block text-sm font-medium text-gray-700 mb-1">
                                Site Name
                            </label>
                            <input
                                type="text"
                                id="siteName"
                                name="siteName"
                                value={settings.siteName}
                                onChange={handleInputChange}
                                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="siteDescription" className="block text-sm font-medium text-gray-700 mb-1">
                                Site Description
                            </label>
                            <input
                                type="text"
                                id="siteDescription"
                                name="siteDescription"
                                value={settings.siteDescription}
                                onChange={handleInputChange}
                                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="siteLogo" className="block text-sm font-medium text-gray-700 mb-1">
                                Site Logo URL
                            </label>
                            <input
                                type="text"
                                id="siteLogo"
                                name="siteLogo"
                                value={settings.siteLogo}
                                onChange={handleInputChange}
                                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">
                                Contact Email
                            </label>
                            <input
                                type="email"
                                id="contactEmail"
                                name="contactEmail"
                                value={settings.contactEmail}
                                onChange={handleInputChange}
                                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                required
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="footerText" className="block text-sm font-medium text-gray-700 mb-1">
                                Footer Text
                            </label>
                            <input
                                type="text"
                                id="footerText"
                                name="footerText"
                                value={settings.footerText}
                                onChange={handleInputChange}
                                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Social Media Settings */}
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <div className="flex items-center mb-4">
                        <Link className="w-5 h-5 mr-2 text-gray-700" />
                        <h2 className="text-xl font-bold text-gray-900">Social Media</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="socialLinks.twitter" className="block text-sm font-medium text-gray-700 mb-1">
                                Twitter URL
                            </label>
                            <input
                                type="url"
                                id="socialLinks.twitter"
                                name="socialLinks.twitter"
                                value={settings.socialLinks.twitter}
                                onChange={handleInputChange}
                                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor="socialLinks.facebook" className="block text-sm font-medium text-gray-700 mb-1">
                                Facebook URL
                            </label>
                            <input
                                type="url"
                                id="socialLinks.facebook"
                                name="socialLinks.facebook"
                                value={settings.socialLinks.facebook}
                                onChange={handleInputChange}
                                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor="socialLinks.instagram" className="block text-sm font-medium text-gray-700 mb-1">
                                Instagram URL
                            </label>
                            <input
                                type="url"
                                id="socialLinks.instagram"
                                name="socialLinks.instagram"
                                value={settings.socialLinks.instagram}
                                onChange={handleInputChange}
                                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor="socialLinks.linkedin" className="block text-sm font-medium text-gray-700 mb-1">
                                LinkedIn URL
                            </label>
                            <input
                                type="url"
                                id="socialLinks.linkedin"
                                name="socialLinks.linkedin"
                                value={settings.socialLinks.linkedin}
                                onChange={handleInputChange}
                                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* Feature Settings */}
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <div className="flex items-center mb-4">
                        <Palette className="w-5 h-5 mr-2 text-gray-700" />
                        <h2 className="text-xl font-bold text-gray-900">Features</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center">
                            <input
                                id="enableNewsletter"
                                name="enableNewsletter"
                                type="checkbox"
                                checked={settings.enableNewsletter}
                                onChange={handleInputChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="enableNewsletter" className="ml-2 block text-sm text-gray-700">
                                Enable Newsletter
                            </label>
                        </div>
                        <div className="flex items-center">
                            <input
                                id="enableBlog"
                                name="enableBlog"
                                type="checkbox"
                                checked={settings.enableBlog}
                                onChange={handleInputChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="enableBlog" className="ml-2 block text-sm text-gray-700">
                                Enable Blog
                            </label>
                        </div>
                        <div className="flex items-center">
                            <input
                                id="enableWishlist"
                                name="enableWishlist"
                                type="checkbox"
                                checked={settings.enableWishlist}
                                onChange={handleInputChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="enableWishlist" className="ml-2 block text-sm text-gray-700">
                                Enable Wishlist
                            </label>
                        </div>
                    </div>
                </div>

                {/* Display Settings */}
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <div className="flex items-center mb-4">
                        <Globe className="w-5 h-5 mr-2 text-gray-700" />
                        <h2 className="text-xl font-bold text-gray-900">Display Settings</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="theme" className="block text-sm font-medium text-gray-700 mb-1">
                                Theme
                            </label>
                            <select
                                id="theme"
                                name="theme"
                                value={settings.theme}
                                onChange={handleInputChange}
                                className="block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            >
                                <option value="default">Default</option>
                                <option value="dark">Dark</option>
                                <option value="light">Light</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
                                Currency
                            </label>
                            <select
                                id="currency"
                                name="currency"
                                value={settings.currency}
                                onChange={handleInputChange}
                                className="block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            >
                                <option value="USD">USD ($)</option>
                                <option value="EUR">EUR (€)</option>
                                <option value="GBP">GBP (£)</option>
                                <option value="JPY">JPY (¥)</option>
                                <option value="CAD">CAD</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="dateFormat" className="block text-sm font-medium text-gray-700 mb-1">
                                Date Format
                            </label>
                            <input
                                type="text"
                                id="dateFormat"
                                name="dateFormat"
                                value={settings.dateFormat}
                                onChange={handleInputChange}
                                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor="timeFormat" className="block text-sm font-medium text-gray-700 mb-1">
                                Time Format
                            </label>
                            <input
                                type="text"
                                id="timeFormat"
                                name="timeFormat"
                                value={settings.timeFormat}
                                onChange={handleInputChange}
                                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* Advanced Settings */}
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <div className="flex items-center mb-4">
                        <Shield className="w-5 h-5 mr-2 text-gray-700" />
                        <h2 className="text-xl font-bold text-gray-900">Advanced Settings</h2>
                    </div>
                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <label htmlFor="analyticsId" className="block text-sm font-medium text-gray-700 mb-1">
                                Analytics ID (Google Analytics)
                            </label>
                            <input
                                type="text"
                                id="analyticsId"
                                name="analyticsId"
                                value={settings.analyticsId}
                                onChange={handleInputChange}
                                placeholder="G-XXXXXXXXXX"
                                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor="customCss" className="block text-sm font-medium text-gray-700 mb-1">
                                Custom CSS
                            </label>
                            <textarea
                                id="customCss"
                                name="customCss"
                                rows={4}
                                value={settings.customCss}
                                onChange={handleInputChange}
                                placeholder="Add custom CSS here..."
                                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor="customJs" className="block text-sm font-medium text-gray-700 mb-1">
                                Custom JavaScript
                            </label>
                            <textarea
                                id="customJs"
                                name="customJs"
                                rows={4}
                                value={settings.customJs}
                                onChange={handleInputChange}
                                placeholder="Add custom JavaScript here..."
                                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        Save Settings
                    </button>
                </div>
            </form>
        </div>
    );
}