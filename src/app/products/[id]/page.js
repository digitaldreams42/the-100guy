// app/products/[id]/page.js
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useStore } from '../../../context/StoreContext';
import { X, Check, Star, Tag, Heart, Share2, ShoppingCart, ExternalLink, Facebook, Twitter, Mail, Copy, Link } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Image from 'next/image';

export default function ProductDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { products, addToCart, addToWishlist, wishlist, showNotification } = useStore();
    const [product, setProduct] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);

    useEffect(() => {
        if (products.length > 0) {
            const foundProduct = products.find(p => p.id === id);
            if (foundProduct) {
                setProduct(foundProduct);
            } else {
                showNotification('Product not found', 'error');
                router.push('/store');
            }
            setIsLoading(false);
        }
    }, [id, products, router, showNotification]);

    useEffect(() => {
        if (products.length === 0) {
            // If products haven't loaded yet, wait for them
            const timer = setTimeout(() => {
                if (products.length === 0) {
                    setIsLoading(false);
                }
            }, 3000); // 3 second timeout
            return () => clearTimeout(timer);
        }
    }, [products]);

    const isInWishlist = (productId) => {
        return wishlist.some(item => item.id === productId);
    };

    const shareProduct = (platform) => {
        const url = window.location.href;
        const title = product.name;
        const description = product.description;

        switch(platform) {
            case 'twitter':
                window.open(
                    `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
                    '_blank'
                );
                break;
            case 'facebook':
                window.open(
                    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
                    '_blank'
                );
                break;
            case 'email':
                window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(description + ' ' + url)}`;
                break;
            case 'copy':
                navigator.clipboard.writeText(url);
                showNotification('Link copied to clipboard!', 'success');
                setIsShareMenuOpen(false);
                break;
            default:
                if (navigator.share) {
                    navigator.share({
                        title: title,
                        text: description,
                        url: url
                    });
                } else {
                    // Fallback: copy URL to clipboard
                    navigator.clipboard.writeText(url);
                    showNotification('Link copied to clipboard!', 'success');
                }
                setIsShareMenuOpen(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-gray-50 py-12">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Product Not Found</h1>
                    <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
                    <Button variant="primary" onClick={() => router.push('/store')}>
                        Browse Store
                    </Button>
                </div>
            </div>
        );
    }

    // Create structured data for the product
    const structuredData = {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": product.name,
        "image": product.coverImage,
        "description": product.description,
        "sku": product.id,
        "offers": {
            "@type": "Offer",
            "price": product.price,
            "priceCurrency": "USD",
            "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            "seller": {
                "@type": "Organization",
                "name": "George K. - The $100 Guy"
            }
        },
        "category": product.category,
        "productID": product.id
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(structuredData)
                }}
            />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Button
                    variant="ghost"
                    className="mb-6 flex items-center text-gray-600 hover:text-gray-900"
                    onClick={() => router.push('/store')}
                >
                    <X className="w-4 h-4 mr-2" />
                    Back to Store
                </Button>

                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 p-8">
                        {/* Product Images */}
                        <div>
                            <div className="bg-gray-100 rounded-xl overflow-hidden mb-4 aspect-square flex items-center justify-center">
                                {product.coverImage ? (
                                    <Image
                                        src={product.coverImage}
                                        alt={product.name}
                                        width={600}
                                        height={600}
                                        className="object-cover w-full h-full"
                                    />
                                ) : (
                                    <div className={`w-full h-full bg-gradient-to-br ${product.coverColor || 'from-gray-400 to-gray-600'} flex items-center justify-center`}>
                                        <div className="text-white text-6xl font-bold opacity-50">
                                            {product.name?.charAt(0) || 'P'}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Additional images could go here if available */}
                        </div>

                        {/* Product Details */}
                        <div>
                            <div className="flex justify-between items-start">
                                <div>
                                    <Badge type={product.type} className="mb-3">{product.type}</Badge>
                                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                                    <p className="text-gray-600 mb-6">{product.subtitle}</p>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => addToWishlist(product)}
                                        className={`p-2 rounded-full ${
                                            isInWishlist(product.id)
                                                ? 'text-red-500 bg-red-50'
                                                : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                                        }`}
                                        title={isInWishlist(product.id) ? "Remove from wishlist" : "Add to wishlist"}
                                    >
                                        <Heart
                                            size={20}
                                            className={isInWishlist(product.id) ? 'fill-current' : ''}
                                        />
                                    </button>

                                    {/* Share menu */}
                                    <div className="relative">
                                        <button
                                            onClick={() => setIsShareMenuOpen(!isShareMenuOpen)}
                                            className="p-2 rounded-full text-gray-400 hover:text-yellow-500 hover:bg-yellow-50"
                                            title="Share this product"
                                        >
                                            <Share2 size={20} />
                                        </button>

                                        {isShareMenuOpen && (
                                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-10 border border-gray-200">
                                                <button
                                                    onClick={() => shareProduct('web')}
                                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                >
                                                    <Share2 className="mr-2 h-4 w-4" />
                                                    Share...
                                                </button>
                                                <button
                                                    onClick={() => shareProduct('twitter')}
                                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                >
                                                    <Twitter className="mr-2 h-4 w-4" />
                                                    Share on Twitter
                                                </button>
                                                <button
                                                    onClick={() => shareProduct('facebook')}
                                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                >
                                                    <Facebook className="mr-2 h-4 w-4" />
                                                    Share on Facebook
                                                </button>
                                                <button
                                                    onClick={() => shareProduct('email')}
                                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                >
                                                    <Mail className="mr-2 h-4 w-4" />
                                                    Share via Email
                                                </button>
                                                <button
                                                    onClick={() => shareProduct('copy')}
                                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                >
                                                    <Copy className="mr-2 h-4 w-4" />
                                                    Copy Link
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 mb-6 text-gray-600 text-sm">
                                <Tag size={16} />
                                <span>{product.category}</span>
                            </div>

                            <div className="mb-8">
                                <h3 className="font-bold text-gray-900 mb-3">Description</h3>
                                <p className="text-gray-700">{product.description}</p>
                            </div>

                            <div className="mb-8">
                                <h3 className="font-bold text-gray-900 mb-3">What's Included:</h3>
                                <ul className="space-y-2">
                                    {product.features?.map((feature, i) => (
                                        <li key={i} className="flex items-start text-gray-700">
                                            <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mr-3 mt-0.5 text-green-600 flex-shrink-0">
                                                <Check size={12} />
                                            </div>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="border-t border-gray-200 pt-6 mt-auto">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-gray-500">Total Price</span>
                                    <span className="text-3xl font-black text-gray-900">${product.price?.toFixed(2)}</span>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3">
                                    <Button
                                        variant="primary"
                                        className="flex-1 flex items-center justify-center"
                                        onClick={() => addToCart(product)}
                                    >
                                        <ShoppingCart className="w-4 h-4 mr-2" />
                                        Add to Cart
                                    </Button>
                                </div>

                                <div className="mt-4 text-center text-sm text-gray-500">
                                    Secure checkout • 30-day money-back guarantee
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Additional information section */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
                        <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Check className="w-6 h-6 text-yellow-600" />
                        </div>
                        <h4 className="font-bold text-gray-900 mb-1">Instant Access</h4>
                        <p className="text-sm text-gray-500">Get immediate access after purchase</p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Star className="w-6 h-6 text-blue-600" />
                        </div>
                        <h4 className="font-bold text-gray-900 mb-1">30-Day Guarantee</h4>
                        <p className="text-sm text-gray-500">Not satisfied? Get your money back</p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ExternalLink className="w-6 h-6 text-green-600" />
                        </div>
                        <h4 className="font-bold text-gray-900 mb-1">Updates Included</h4>
                        <p className="text-sm text-gray-500">Free updates for life</p>
                    </div>
                </div>
            </div>
        </div>
    );
}