// lib/constants.js

export const SECTIONS = {
    HOME: 'home',
    STORE: 'store',
    ABOUT: 'about',
    ADMIN_LOGIN: 'admin_login',
    ADMIN_DASHBOARD: 'admin_dashboard',
    ADMIN_PRODUCTS: 'admin_products',
    ADMIN_SALES: 'admin_sales',
    ADMIN_SUBSCRIBERS: 'admin_subscribers',
    ADMIN_ANALYTICS: 'admin_analytics'
};

export const PRODUCT_TYPES = {
    ALL: 'All Products',
    BOOK: 'Book',
    COURSE: 'Course',
    TEMPLATE: 'Template'
};

export const MOCK_PRODUCTS = [
    {
        id: '1',
        title: 'The $100 Startup Guide',
        subtitle: 'Launch your business today',
        price: 29.99,
        type: 'Book',
        status: 'published',
        category: 'Business',
        description: 'A comprehensive guide to starting a business with minimal capital.',
        features: ['PDF Format', 'Worksheets Included', 'Lifetime Updates', 'Mobile Friendly'],
        coverColor: 'from-yellow-400 to-orange-500',
        downloads: 120
    },
    {
        id: '2',
        title: 'React Mastery Course',
        subtitle: 'Zero to Hero in 30 Days',
        price: 149.00,
        type: 'Course',
        status: 'published',
        category: 'Development',
        description: 'Master modern React with hooks, context, and redux.',
        features: ['10 Hours Video', 'Source Code', 'Certificate', 'Discord Access'],
        coverColor: 'from-blue-400 to-purple-500',
        downloads: 45
    },
    {
        id: '3',
        title: 'Agency Notion Template',
        subtitle: 'Organize your entire agency',
        price: 49.00,
        type: 'Template',
        status: 'published',
        category: 'Productivity',
        description: 'The exact system I use to manage 20+ clients.',
        features: ['Notion Link', 'Video Setup Guide', 'CRM Dashboard', 'Finance Tracker'],
        coverColor: 'from-gray-700 to-black',
        downloads: 89
    }
];
