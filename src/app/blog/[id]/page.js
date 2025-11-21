// app/blog/[id]/page.js
'use client';

import { useState, useEffect } from 'react';
import { Calendar, User, Tag, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Button from '../../../components/ui/Button';

export default function BlogPost({ params }) {
    const { id } = params;
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch blog post
    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await fetch(`/api/blog/${id}`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.status !== 'published') {
                        setError('Blog post not published');
                    } else {
                        setPost(data);
                    }
                } else {
                    throw new Error('Failed to fetch blog post');
                }
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchPost();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex justify-center items-center h-48">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <p className="ml-2 text-gray-600">Loading blog post...</p>
                </div>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">Blog post not found or not published</p>
                    <Link href="/blog" passHref>
                        <Button variant="outline" className="mt-4 border-gray-300">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Blog
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <Link href="/blog" passHref>
                <Button variant="outline" className="mb-8 flex items-center text-gray-700">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Blog
                </Button>
            </Link>

            {post.coverImage && (
                <div className="mb-8 rounded-xl overflow-hidden">
                    <img 
                        src={post.coverImage} 
                        alt={post.title} 
                        className="w-full h-64 object-cover"
                    />
                </div>
            )}

            <article>
                <h1 className="text-4xl font-black text-gray-900 mb-4">{post.title}</h1>
                
                <div className="flex flex-wrap items-center text-sm text-gray-500 mb-8 gap-4">
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
                    {post.tags && post.tags.length > 0 && (
                        <div className="flex items-center">
                            <Tag className="w-4 h-4 mr-1" />
                            <div className="flex flex-wrap gap-1">
                                {post.tags.map((tag, index) => (
                                    <span key={index} className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="prose prose-lg max-w-none">
                    <p className="text-xl text-gray-600 mb-8 italic">{post.excerpt}</p>
                    <div dangerouslySetInnerHTML={{ __html: post.content || post.content.replace(/\n/g, '<br />') }} />
                </div>
            </article>
        </div>
    );
}