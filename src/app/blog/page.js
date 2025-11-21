// app/blog/page.js
'use client';

import { useState, useEffect } from 'react';
import { Calendar, User, Tag, Search } from 'lucide-react';
import Link from 'next/link';
import Button from '../../components/ui/Button';

export default function BlogIndex() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredPosts, setFilteredPosts] = useState([]);

    // Fetch published blog posts
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await fetch('/api/blog');
                if (response.ok) {
                    const data = await response.json();
                    const publishedPosts = data.filter(post => post.status === 'published');
                    setPosts(publishedPosts);
                    setFilteredPosts(publishedPosts);
                }
            } catch (error) {
                console.error('Error fetching blog posts:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredPosts(posts);
        } else {
            const term = searchTerm.toLowerCase();
            const filtered = posts.filter(post =>
                post.title.toLowerCase().includes(term) ||
                post.excerpt.toLowerCase().includes(term) ||
                post.content.toLowerCase().includes(term) ||
                (post.tags && post.tags.some(tag => tag.toLowerCase().includes(term)))
            );
            setFilteredPosts(filtered);
        }
    }, [searchTerm, posts]);

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex justify-center items-center h-48">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <p className="ml-2 text-gray-600">Loading blog posts...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="mb-12 text-center">
                <h1 className="text-4xl font-black text-gray-900 mb-4">George's Blog</h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    Insights, tutorials, and stories about building a successful online business.
                </p>
            </div>

            {/* Search bar */}
            <div className="mb-8 max-w-lg mx-auto">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search blog posts..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
            </div>

            {filteredPosts.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No blog posts found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredPosts.map((post) => (
                        <Link key={post.id} href={`/blog/${post.id}`} passHref>
                            <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
                                {post.coverImage && (
                                    <div className="h-48 overflow-hidden">
                                        <img 
                                            src={post.coverImage} 
                                            alt={post.title} 
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>
                                )}
                                <div className="p-6">
                                    <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                                        {post.title}
                                    </h2>
                                    <p className="text-gray-600 mb-4 line-clamp-3">
                                        {post.excerpt}
                                    </p>
                                    <div className="flex flex-wrap items-center text-sm text-gray-500 gap-4">
                                        <div className="flex items-center">
                                            <User className="w-4 h-4 mr-1" />
                                            <span>{post.author}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <Calendar className="w-4 h-4 mr-1" />
                                            <span>
                                                {post.createdAt ? new Date(post.createdAt.toDate()).toLocaleDateString() : new Date().toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    {post.tags && post.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-3">
                                            {post.tags.slice(0, 3).map((tag, index) => (
                                                <span key={index} className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}