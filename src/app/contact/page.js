// app/contact/page.js
'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';
import Button from '../../components/ui/Button';

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submitError, setSubmitError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        
        // Clear error when user starts typing
        if (submitError) setSubmitError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitError('');

        // Basic validation
        if (!formData.name || !formData.email || !formData.message) {
            setSubmitError('Please fill in all required fields.');
            setIsSubmitting(false);
            return;
        }

        if (!/\S+@\S+\.\S+/.test(formData.email)) {
            setSubmitError('Please enter a valid email address.');
            setIsSubmitting(false);
            return;
        }

        try {
            // In a real application, this would send the data to your API
            // For now, simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            console.log('Contact form submitted:', formData);
            setSubmitSuccess(true);
            setFormData({ name: '', email: '', subject: '', message: '' });
            
            // Reset success message after 5 seconds
            setTimeout(() => setSubmitSuccess(false), 5000);
        } catch (error) {
            setSubmitError('Failed to send message. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-black text-gray-900 mb-4">Get In Touch</h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Have questions about our products or need assistance? Our team is here to help you succeed.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Contact Information */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100 h-fit">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>
                            
                            <div className="space-y-6">
                                <div className="flex items-start">
                                    <div className="p-3 bg-yellow-100 rounded-lg mr-4">
                                        <Mail className="w-5 h-5 text-yellow-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">Email</h3>
                                        <p className="text-gray-600">support@georgek.com</p>
                                        <p className="text-sm text-gray-500">We typically respond within 24 hours</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-start">
                                    <div className="p-3 bg-blue-100 rounded-lg mr-4">
                                        <Phone className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">Phone</h3>
                                        <p className="text-gray-600">+1 (555) 123-4567</p>
                                        <p className="text-sm text-gray-500">Mon-Fri, 9am-5pm EST</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-start">
                                    <div className="p-3 bg-green-100 rounded-lg mr-4">
                                        <MapPin className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">Office</h3>
                                        <p className="text-gray-600">123 Business Ave</p>
                                        <p className="text-gray-600">New York, NY 10001</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-8 pt-8 border-t border-gray-200">
                                <h3 className="font-bold text-gray-900 mb-4">Frequently Asked Questions</h3>
                                <ul className="space-y-2 text-sm text-gray-600">
                                    <li className="flex items-center">
                                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></span>
                                        <a href="#faq1" className="hover:text-yellow-500">How do I access my downloads?</a>
                                    </li>
                                    <li className="flex items-center">
                                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></span>
                                        <a href="#faq2" className="hover:text-yellow-500">What's your refund policy?</a>
                                    </li>
                                    <li className="flex items-center">
                                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></span>
                                        <a href="#faq3" className="hover:text-yellow-500">Do you offer bulk discounts?</a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a message</h2>
                            
                            {submitSuccess ? (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle className="w-8 h-8 text-green-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Message Sent!</h3>
                                    <p className="text-gray-600 mb-6">Thank you for reaching out. We'll get back to you soon.</p>
                                    <Button 
                                        variant="primary" 
                                        onClick={() => setSubmitSuccess(false)}
                                    >
                                        Send Another Message
                                    </Button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                                Full Name *
                                            </label>
                                            <input
                                                type="text"
                                                id="name"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                                                placeholder="John Doe"
                                            />
                                        </div>
                                        
                                        <div>
                                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                                Email Address *
                                            </label>
                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                                                placeholder="john@example.com"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                                            Subject
                                        </label>
                                        <input
                                            type="text"
                                            id="subject"
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                                            placeholder="How can we help you?"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                                            Message *
                                        </label>
                                        <textarea
                                            id="message"
                                            name="message"
                                            rows={6}
                                            value={formData.message}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                                            placeholder="Your message here..."
                                        ></textarea>
                                    </div>
                                    
                                    {submitError && (
                                        <div className="text-red-600 bg-red-50 p-3 rounded-lg border border-red-200 text-sm">
                                            {submitError}
                                        </div>
                                    )}
                                    
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        className="w-full"
                                        loading={isSubmitting}
                                        icon={!isSubmitting ? Send : null}
                                    >
                                        {isSubmitting ? 'Sending...' : 'Send Message'}
                                    </Button>
                                    
                                    <p className="text-xs text-gray-500 text-center">
                                        We'll respond within 24 hours during business days.
                                    </p>
                                </form>
                            )}
                        </div>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="mt-16" id="faq-section">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-black text-gray-900 mb-4">Frequently Asked Questions</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Find answers to common questions about our products, services, and processes.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100" id="faq1">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">How do I access my downloads?</h3>
                            <p className="text-gray-600">
                                After purchase, you'll receive an email with download links. You can also access your downloads from your account dashboard under "My Orders". The links will remain active for 30 days but you can request new links anytime.
                            </p>
                        </div>
                        
                        <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100" id="faq2">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">What's your refund policy?</h3>
                            <p className="text-gray-600">
                                We offer a 30-day money-back guarantee on all digital products. If you're not satisfied with your purchase, simply reach out to us within 30 days for a full refund. No questions asked.
                            </p>
                        </div>
                        
                        <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100" id="faq3">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Do you offer bulk discounts?</h3>
                            <p className="text-gray-600">
                                Yes! We offer volume discounts for purchases of 5+ items. For orders of 10+ items, contact us for special pricing. Educational institutions receive an additional 20% discount.
                            </p>
                        </div>
                        
                        <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">How often do you release new products?</h3>
                            <p className="text-gray-600">
                                We typically release 2-3 new products per quarter, with updates to existing products monthly. Subscribe to our newsletter to be the first to know about new releases and exclusive member-only content.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}