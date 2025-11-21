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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [notification, setNotification] = useState(null);
    const [newPost, setNewPost] = useState({
        title: '',
        content: '',
        excerpt: '',
        author: '',
        status: 'draft',
        coverImage: '',
        tags: ''
    });

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
                showNotification('Error loading blog posts: ' + error.message, 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const filteredPosts = posts.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.author.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelectPost = (postId) => {
        if (selectedPosts.includes(postId)) {
            setSelectedPosts(selectedPosts.filter(id => id !== postId));
        } else {
            setSelectedPosts([...selectedPosts, postId]);
        }
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();

        try {
            const postData = {
                ...newPost,
                tags: newPost.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
            };

            const response = await fetch('/api/blog', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(postData)
            });

            const result = await response.json();

            if (response.ok) {
                setPosts([result, ...posts]);
                setIsModalOpen(false);
                setNewPost({
                    title: '',
                    content: '',
                    excerpt: '',
                    author: '',
                    status: 'draft',
                    coverImage: '',
                    tags: ''
                });
                showNotification('Blog post created successfully!');
            } else {
                throw new Error(result.message || 'Failed to create blog post');
            }
        } catch (error) {
            showNotification('Error creating blog post: ' + error.message, 'error');
        }
    };

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
                    showNotification('Blog post deleted successfully!');
                } else {
                    throw new Error(result.message || 'Failed to delete blog post');
                }
            } catch (error) {
                showNotification('Error deleting blog post: ' + error.message, 'error');
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
            showNotification('Selected blog posts deleted successfully!');
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Blog Management</h1>
                <div className="flex space-x-4">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        New Post
                    </button>
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
                            {filteredPosts.map((post) => (
                                <li key={post.id} className="hover:bg-gray-50">
                                    <div className="px-6 py-4 flex items-center justify-between">
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={selectedPosts.includes(post.id)}
                                                onChange={() => handleSelectPost(post.id)}
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

                        {filteredPosts.length === 0 && !loading && (
                            <div className="text-center py-12">
                                <p className="text-gray-500">No blog posts found</p>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Add Post Modal */}
            {isModalOpen && (
                <div className="fixed z-10 inset-0 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>

                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                                            Create New Blog Post
                                        </h3>
                                        <form onSubmit={handleCreatePost}>
                                            <div className="grid grid-cols-1 gap-6">
                                                <div>
                                                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                                                        Title
                                                    </label>
                                                    <input
                                                        type="text"
                                                        id="title"
                                                        value={newPost.title}
                                                        onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                        required
                                                    />
                                                </div>

                                                <div>
                                                    <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700">
                                                        Excerpt
                                                    </label>
                                                    <textarea
                                                        id="excerpt"
                                                        rows={2}
                                                        value={newPost.excerpt}
                                                        onChange={(e) => setNewPost({...newPost, excerpt: e.target.value})}
                                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                        required
                                                    />
                                                </div>

                                                <div>
                                                    <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                                                        Content
                                                    </label>
                                                    <textarea
                                                        id="content"
                                                        rows={6}
                                                        value={newPost.content}
                                                        onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                        required
                                                    />
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label htmlFor="author" className="block text-sm font-medium text-gray-700">
                                                            Author
                                                        </label>
                                                        <input
                                                            type="text"
                                                            id="author"
                                                            value={newPost.author}
                                                            onChange={(e) => setNewPost({...newPost, author: e.target.value})}
                                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <label htmlFor="coverImage" className="block text-sm font-medium text-gray-700">
                                                            Cover Image URL
                                                        </label>
                                                        <input
                                                            type="text"
                                                            id="coverImage"
                                                            value={newPost.coverImage}
                                                            onChange={(e) => setNewPost({...newPost, coverImage: e.target.value})}
                                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                                                        Tags (comma separated)
                                                    </label>
                                                    <input
                                                        type="text"
                                                        id="tags"
                                                        value={newPost.tags}
                                                        onChange={(e) => setNewPost({...newPost, tags: e.target.value})}
                                                        placeholder="e.g., business, startup, marketing"
                                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                    />
                                                </div>

                                                <div>
                                                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                                                        Status
                                                    </label>
                                                    <select
                                                        id="status"
                                                        value={newPost.status}
                                                        onChange={(e) => setNewPost({...newPost, status: e.target.value})}
                                                        className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                    >
                                                        <option value="draft">Draft</option>
                                                        <option value="published">Published</option>
                                                        <option value="archived">Archived</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                                                <button
                                                    type="submit"
                                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:col-start-2 sm:text-sm"
                                                >
                                                    Publish Post
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