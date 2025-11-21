// app/admin/dashboard/blog/edit/[id]/page.js
'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import Button from '../../../../../../components/ui/Button';
import Link from 'next/link';

export default function EditBlogPost({ params }) {
    const { id } = params;
    const [post, setPost] = useState({
        title: '',
        content: '',
        excerpt: '',
        author: '',
        status: 'draft',
        coverImage: '',
        tags: []
    });
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState(null);

    // Fetch existing blog post
    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await fetch(`/api/blog/${id}`);
                if (response.ok) {
                    const data = await response.json();
                    setPost({
                        ...data,
                        tags: Array.isArray(data.tags) ? data.tags.join(', ') : ''
                    });
                } else {
                    throw new Error('Failed to fetch blog post');
                }
            } catch (error) {
                showNotification('Error loading blog post: ' + error.message, 'error');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchPost();
        }
    }, [id]);

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPost(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleUpdatePost = async (e) => {
        e.preventDefault();

        try {
            const postData = {
                ...post,
                tags: post.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
            };

            const response = await fetch(`/api/blog/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(postData)
            });

            const result = await response.json();

            if (response.ok) {
                showNotification('Blog post updated successfully!');
            } else {
                throw new Error(result.message || 'Failed to update blog post');
            }
        } catch (error) {
            showNotification('Error updating blog post: ' + error.message, 'error');
        }
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-center items-center h-48">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <p className="ml-2 text-gray-600">Loading blog post...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

            <div className="mb-8">
                <Link href="/admin/dashboard/blog" passHref>
                    <Button variant="outline" className="flex items-center text-gray-700">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Blog Management
                    </Button>
                </Link>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Blog Post</h1>

            <form onSubmit={handleUpdatePost} className="space-y-6">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                        Title
                    </label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={post.title}
                        onChange={handleInputChange}
                        className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-1">
                        Excerpt
                    </label>
                    <textarea
                        id="excerpt"
                        name="excerpt"
                        rows={2}
                        value={post.excerpt}
                        onChange={handleInputChange}
                        className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                        Content
                    </label>
                    <textarea
                        id="content"
                        name="content"
                        rows={10}
                        value={post.content}
                        onChange={handleInputChange}
                        className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        required
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-1">
                            Author
                        </label>
                        <input
                            type="text"
                            id="author"
                            name="author"
                            value={post.author}
                            onChange={handleInputChange}
                            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="coverImage" className="block text-sm font-medium text-gray-700 mb-1">
                            Cover Image URL
                        </label>
                        <input
                            type="text"
                            id="coverImage"
                            name="coverImage"
                            value={post.coverImage}
                            onChange={handleInputChange}
                            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                        Tags (comma separated)
                    </label>
                    <input
                        type="text"
                        id="tags"
                        name="tags"
                        value={post.tags}
                        onChange={handleInputChange}
                        placeholder="e.g., business, startup, marketing"
                        className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                </div>

                <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                    </label>
                    <select
                        id="status"
                        name="status"
                        value={post.status}
                        onChange={handleInputChange}
                        className="block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="archived">Archived</option>
                    </select>
                </div>

                <div className="flex space-x-4">
                    <button
                        type="submit"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        Update Post
                    </button>
                    
                    <Link href="/admin/dashboard/blog" passHref>
                        <Button variant="outline" className="border-gray-300">
                            Cancel
                        </Button>
                    </Link>
                </div>
            </form>
        </div>
    );
}