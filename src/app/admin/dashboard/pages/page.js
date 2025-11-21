// app/admin/dashboard/pages/page.js
'use client';

import { useState } from 'react';
import { Plus, Edit, Trash2, Search, Eye, FileText } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Link from 'next/link';

export default function PagesManagement() {
    const [pages, setPages] = useState([
        { id: 1, title: 'Home', slug: 'home', contentType: 'landing', status: 'published', lastModified: '2023-06-15' },
        { id: 2, title: 'About', slug: 'about', contentType: 'info', status: 'published', lastModified: '2023-06-20' },
        { id: 3, title: 'Store', slug: 'store', contentType: 'product-listing', status: 'published', lastModified: '2023-06-25' },
        { id: 4, title: 'Contact', slug: 'contact', contentType: 'form', status: 'published', lastModified: '2023-06-30' },
        { id: 5, title: 'Terms of Service', slug: 'terms', contentType: 'legal', status: 'published', lastModified: '2023-07-01' },
        { id: 6, title: 'Privacy Policy', slug: 'privacy', contentType: 'legal', status: 'published', lastModified: '2023-07-01' },
    ]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPages, setSelectedPages] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newPage, setNewPage] = useState({
        title: '',
        slug: '',
        contentType: 'info',
        status: 'draft'
    });

    const filteredPages = pages.filter(page =>
        page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        page.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
        page.contentType.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelectPage = (pageId) => {
        if (selectedPages.includes(pageId)) {
            setSelectedPages(selectedPages.filter(id => id !== pageId));
        } else {
            setSelectedPages([...selectedPages, pageId]);
        }
    };

    const handleCreatePage = (e) => {
        e.preventDefault();
        
        // Create a new page with a unique ID
        const newPageWithId = {
            ...newPage,
            id: pages.length + 1,
            lastModified: new Date().toISOString().split('T')[0]
        };
        
        setPages([newPageWithId, ...pages]);
        setIsModalOpen(false);
        setNewPage({
            title: '',
            slug: '',
            contentType: 'info',
            status: 'draft'
        });
    };

    const handleBulkDelete = () => {
        if (selectedPages.length > 0) {
            setPages(pages.filter(page => !selectedPages.includes(page.id)));
            setSelectedPages([]);
        }
    };

    const createSlug = (title) => {
        // Create slug from title (spaces to hyphens, lowercase, remove special chars)
        return title
            .toLowerCase()
            .replace(/[^\w\s-]/g, '') // Remove special characters
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .replace(/--+/g, '-'); // Replace multiple hyphens with single hyphen
    };

    const handleTitleChange = (e) => {
        const title = e.target.value;
        setNewPage({
            ...newPage,
            title: title,
            slug: createSlug(title)
        });
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Page Management</h1>
                <div className="flex space-x-4">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        New Page
                    </button>
                    {selectedPages.length > 0 && (
                        <button
                            onClick={handleBulkDelete}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Selected
                        </button>
                    )}
                </div>
            </div>

            {/* Search bar */}
            <div className="mb-6">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search pages..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
            </div>

            {/* Pages table */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                    {filteredPages.map((page) => (
                        <li key={page.id} className="hover:bg-gray-50">
                            <div className="px-6 py-4 flex items-center justify-between">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={selectedPages.includes(page.id)}
                                        onChange={() => handleSelectPage(page.id)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <div className="ml-4 flex items-center">
                                        <FileText className="h-5 w-5 text-gray-400 mr-3" />
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">{page.title}</div>
                                            <div className="text-sm text-gray-500">/{page.slug} • {page.contentType}</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                        page.status === 'published' 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {page.status}
                                    </span>
                                    <div className="text-xs text-gray-500 mr-4">
                                        {page.lastModified}
                                    </div>
                                    <Link href={`/${page.slug}`}>
                                        <button className="p-1 text-gray-400 hover:text-gray-500">
                                            <Eye className="h-4 w-4" />
                                        </button>
                                    </Link>
                                    <Link href={`/admin/dashboard/pages/edit/${page.id}`}>
                                        <button className="p-1 text-gray-400 hover:text-blue-500">
                                            <Edit className="h-4 w-4" />
                                        </button>
                                    </Link>
                                    <button className="p-1 text-gray-400 hover:text-red-500">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
                
                {filteredPages.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No pages found</p>
                    </div>
                )}
            </div>

            {/* Add Page Modal */}
            {isModalOpen && (
                <div className="fixed z-10 inset-0 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>
                        
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                                            Create New Page
                                        </h3>
                                        <form onSubmit={handleCreatePage}>
                                            <div className="grid grid-cols-1 gap-6">
                                                <div>
                                                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                                                        Page Title
                                                    </label>
                                                    <input
                                                        type="text"
                                                        id="title"
                                                        value={newPage.title}
                                                        onChange={handleTitleChange}
                                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                        required
                                                    />
                                                </div>
                                                
                                                <div>
                                                    <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
                                                        URL Slug
                                                    </label>
                                                    <input
                                                        type="text"
                                                        id="slug"
                                                        value={newPage.slug}
                                                        onChange={(e) => setNewPage({...newPage, slug: e.target.value})}
                                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                        required
                                                    />
                                                    <p className="mt-1 text-xs text-gray-500">
                                                        This will be the URL for your page: /{newPage.slug}
                                                    </p>
                                                </div>
                                                
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label htmlFor="contentType" className="block text-sm font-medium text-gray-700">
                                                            Content Type
                                                        </label>
                                                        <select
                                                            id="contentType"
                                                            value={newPage.contentType}
                                                            onChange={(e) => setNewPage({...newPage, contentType: e.target.value})}
                                                            className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                            required
                                                        >
                                                            <option value="info">Informational</option>
                                                            <option value="product-listing">Product Listing</option>
                                                            <option value="landing">Landing Page</option>
                                                            <option value="blog">Blog Page</option>
                                                            <option value="form">Form Page</option>
                                                            <option value="legal">Legal Document</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                                                            Status
                                                        </label>
                                                        <select
                                                            id="status"
                                                            value={newPage.status}
                                                            onChange={(e) => setNewPage({...newPage, status: e.target.value})}
                                                            className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                        >
                                                            <option value="draft">Draft</option>
                                                            <option value="published">Published</option>
                                                            <option value="archived">Archived</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                                                <button
                                                    type="submit"
                                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:col-start-2 sm:text-sm"
                                                >
                                                    Create Page
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setIsModalOpen(false)}
                                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}