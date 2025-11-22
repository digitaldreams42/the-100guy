// app/admin/dashboard/blog/page.js
'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Calendar, User, Eye, AlertCircle } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Link from 'next/link';

export default function BlogManagement() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPosts, setSelectedPosts] = useState([]);


    // Fetch blog posts from API
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await fetch('/api/blog');
                if (response.ok) {
                    const data = await response.json();
                    setPosts(data);
                } else {
                    throw new Error('Failed to fetch blog posts');
                }
            } catch (error) {
                console.error('Error loading blog posts: ' + error.message, 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);



    const handleDeletePost = async (postId) => {
        if (window.confirm('Are you sure you want to delete this blog post?')) {
            try {
                const response = await fetch(`/api/blog/${postId}`, {
                    method: 'DELETE'
                });

                const result = await response.json();

                if (response.ok) {
                    setPosts(posts.filter(post => post.id !== postId));
                    setSelectedPosts(selectedPosts.filter(id => id !== postId));
                } else {
                    throw new Error(result.message || 'Failed to delete blog post');
                }
            } catch (error) {
                console.error('Error deleting blog post: ' + error.message, 'error');
            }
        }
    };

    const handleBulkDelete = () => {
        if (selectedPosts.length > 0 && window.confirm('Are you sure you want to delete selected blog posts?')) {
            selectedPosts.forEach(async (postId) => {
                await fetch(`/api/blog/${postId}`, {
                    method: 'DELETE'
                });
            });

            setPosts(posts.filter(post => !selectedPosts.includes(post.id)));
            setSelectedPosts([]);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Blog Management</h1>
                <div className="flex space-x-4">
                    <Link href="/admin/dashboard/blog/new" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" />
                        New Post
                    </Link>
                    {selectedPosts.length > 0 && (
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
                        placeholder="Search posts..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
            </div>

            {/* Loading state */}
            {loading ? (
                <div className="flex justify-center items-center h-48">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <p className="ml-2 text-gray-600">Loading blog posts...</p>
                </div>
            ) : (
                <>
                    {/* Posts table */}
                    <div className="bg-white shadow overflow-hidden sm:rounded-md">
                        <ul className="divide-y divide-gray-200">
                            {posts.filter(post =>
                                post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                post.author.toLowerCase().includes(searchTerm.toLowerCase())
                            ).map((post) => (
                                <li key={post.id} className="hover:bg-gray-50">
                                    <div className="px-6 py-4 flex items-center justify-between">
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={selectedPosts.includes(post.id)}
                                                onChange={() => {
                                                    if (selectedPosts.includes(post.id)) {
                                                        setSelectedPosts(selectedPosts.filter(id => id !== post.id));
                                                    } else {
                                                        setSelectedPosts([...selectedPosts, post.id]);
                                                    }
                                                }}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{post.title}</div>
                                                <div className="text-sm text-gray-500">{post.excerpt}</div>
                                                <div className="flex items-center text-xs text-gray-500 mt-1">
                                                    <User className="w-3 h-3 mr-1" />
                                                    {post.author} •
                                                    <Calendar className="w-3 h-3 ml-2 mr-1" />
                                                    {post.createdAt ? new Date(post.createdAt.toDate()).toLocaleDateString() : post.date ? new Date(post.date).toLocaleDateString() : 'N/A'} •
                                                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                                                        post.status === 'published'
                                                            ? 'bg-green-100 text-green-800'
                                                            : post.status === 'draft'
                                                                ? 'bg-yellow-100 text-yellow-800'
                                                                : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {post.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Link href={`/blog/${post.id}`}>
                                                <button className="p-1 text-gray-400 hover:text-gray-500">
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                            </Link>
                                            <Link href={`/admin/dashboard/blog/edit/${post.id}`}>
                                                <button className="p-1 text-gray-400 hover:text-blue-500">
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                            </Link>
                                            <button
                                                onClick={() => handleDeletePost(post.id)}
                                                className="p-1 text-gray-400 hover:text-red-500"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>

                        {posts.filter(post =>
                                post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                post.author.toLowerCase().includes(searchTerm.toLowerCase())
                            ).length === 0 && !loading && (
                            <div className="text-center py-12">
                                <p className="text-gray-500">No blog posts found</p>
                            </div>
                        )}
                    </div>
                </>
            )}


        </div>
    );
}
