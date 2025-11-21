// app/layout.js
'use client';

import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import { StoreProvider } from '../context/StoreContext';
import CartModal from '../components/modals/CartModal';
import ProductModal from '../components/modals/ProductModal';
import Notification from '../components/Notification';
import { useStore } from '../context/StoreContext';
import { usePathname } from 'next/navigation';
import { ShoppingCart } from 'lucide-react';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';
import { useState } from 'react';

// Simple Navbar component for the main layout
const NavbarComponent = () => {
    const pathname = usePathname();
    const { setIsCartOpen, cart } = useStore();
    const { user, isUserAdmin, logoutCustomer } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const NavButton = ({ href, children }) => {
        const isActive = pathname === href;
        return (
            <Link href={href} onClick={() => setMobileMenuOpen(false)} aria-label={children}>
                <span
                    className={`text-sm font-medium hover:text-yellow-500 cursor-pointer ${isActive ? 'text-yellow-500' : 'text-gray-600'}`}
                    aria-current={isActive ? 'page' : undefined}
                >
                    {children}
                </span>
            </Link>
        );
    };

    return (
        <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100" role="navigation" aria-label="Main navigation">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link href="/" aria-label="Go to home page" className="focus:outline-none focus:ring-2 focus:ring-blue-500 rounded">
                        <div className="flex items-center cursor-pointer" tabIndex={-1}>
                            <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center mr-2">
                                <span className="font-black text-lg">G</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-gray-900 leading-none">GEORGE K.</span>
                                <span className="text-xs font-medium text-gray-500">THE $100 GUY</span>
                            </div>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        <NavButton href="/">Home</NavButton>
                        <NavButton href="/store">Store</NavButton>
                        <NavButton href="/blog">Blog</NavButton>
                        <NavButton href="/about">About</NavButton>

                    </div>

                    {/* Mobile menu button */}
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => setIsCartOpen(true)}
                            className="relative p-2 text-gray-600 hover:text-yellow-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                            aria-label={`Shopping cart (${cart.length} items)`}
                        >
                            <ShoppingCart size={20} aria-hidden="true"/>
                            {cart.length > 0 && (
                                <span
                                    className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full"
                                    aria-label={`${cart.length} items in cart`}
                                >
                                    {cart.length}
                                </span>
                            )}
                        </button>

                        {/* Mobile menu button */}
                        <button
                            className="md:hidden p-2 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            aria-expanded={mobileMenuOpen}
                            aria-controls="mobile-menu"
                            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                        >
                            {mobileMenuOpen ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {mobileMenuOpen && (
                    <div id="mobile-menu" className="md:hidden py-4 border-t border-gray-100" role="menu" aria-orientation="vertical">
                        <div className="flex flex-col space-y-3" role="menubar">
                            <NavButton href="/">Home</NavButton>
                            <NavButton href="/store">Store</NavButton>
                            <NavButton href="/blog">Blog</NavButton>
                            <NavButton href="/about">About</NavButton>
                            

                            {user && !isUserAdmin ? (
                                // Customer is logged in
                                <div className="flex flex-col space-y-2 pt-2 border-t border-gray-100" role="group" aria-label="User menu">
                                    <Link href="/profile" className="text-sm font-medium text-gray-600 hover:text-yellow-500 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-1" aria-label="Go to profile">
                                        My Account
                                    </Link>
                                    <button
                                        onClick={() => {
                                            logoutCustomer();
                                            setMobileMenuOpen(false);
                                        }}
                                        className="text-left text-sm font-medium text-gray-400 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-1"
                                        aria-label="Logout"
                                    >
                                        Logout
                                    </button>
                                </div>
                            ) : !isUserAdmin && (
                                // Customer is not logged in
                                <div className="flex flex-col space-y-2 pt-2 border-t border-gray-100" role="group" aria-label="Authentication menu">
                                    <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-yellow-500 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-1" aria-label="Login">
                                        Login
                                    </Link>
                                    <Link href="/register" className="text-sm font-medium text-yellow-600 hover:text-yellow-500 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-1" aria-label="Create account">
                                        Sign up
                                    </Link>
                                </div>
                            )}

                            {isUserAdmin && (
                                <div className="pt-2 border-t border-gray-100" role="group" aria-label="Admin menu">
                                    <Link href="/admin/dashboard" className="text-xs font-bold text-gray-400 hover:text-gray-900 uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-1" aria-label="Go to admin dashboard">
                                        Admin
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};



export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
                <link rel="icon" href="/favicon.ico" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta name="theme-color" content="#FFD700" />
                <meta name="description" content="Learn how to build a $100k business with nothing but a laptop and an internet connection. Get practical blueprints, templates, and strategies to accelerate your growth." />
                <meta name="keywords" content="digital products, business, entrepreneurship, templates, courses, books, online business, marketing, sales" />
                <meta name="author" content="George K." />
                <link rel="canonical" href="https://www.georgek.com/" />

                {/* Open Graph / Facebook */}
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://www.georgek.com/" />
                <meta property="og:title" content="George K. - The $100 Guy Blueprint" />
                <meta property="og:description" content="Learn how to build a $100k business with nothing but a laptop and an internet connection. Get practical blueprints, templates, and strategies to accelerate your growth." />
                <meta property="og:image" content="/og-image.jpg" />

                {/* Twitter */}
                <meta property="twitter:card" content="summary_large_image" />
                <meta property="twitter:url" content="https://www.georgek.com/" />
                <meta property="twitter:title" content="George K. - The $100 Guy Blueprint" />
                <meta property="twitter:description" content="Learn how to build a $100k business with nothing but a laptop and an internet connection. Get practical blueprints, templates, and strategies to accelerate your growth." />
                <meta property="twitter:image" content="/twitter-image.jpg" />

                <title>George K. - The $100 Guy Blueprint</title>

                {/* Structured Data for Organization */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "Organization",
                            "name": "George K. - The $100 Guy",
                            "alternateName": "The $100 Guy",
                            "url": "https://www.georgek.com/",
                            "logo": "/logo.png",
                            "foundingDate": "2018",
                            "founder": {
                                "@type": "Person",
                                "name": "George K."
                            },
                            "description": "Learn how to build a $100k business with nothing but a laptop and an internet connection. Get practical blueprints, templates, and strategies to accelerate your growth.",
                            "sameAs": [
                                "https://www.facebook.com/georgek",
                                "https://www.twitter.com/georgek",
                                "https://www.instagram.com/georgek",
                                "https://www.youtube.com/georgek"
                            ],
                            "contactPoint": {
                                "@type": "ContactPoint",
                                "telephone": "+1-555-123-4567",
                                "contactType": "customer service",
                                "areaServed": "US",
                                "availableLanguage": "en"
                            }
                        })
                    }}
                />
            </head>
            <body>
                <AuthProvider>
                    <StoreProvider>
                        <LayoutContent>
                            {children}
                        </LayoutContent>
                    </StoreProvider>
                </AuthProvider>
            </body>
        </html>
    );
}

// Client wrapper component to access contexts
function LayoutContent({ children }) {
    const pathname = usePathname();
    const isAdminPage = pathname.startsWith('/admin');

    return (
        <div className="min-h-screen">
            {!isAdminPage && <NavbarComponent />}
            <main className="focus:outline-none" tabIndex="-1">
                {children}
            </main>
            <ProductModal />
            <CartModal />
            <Notification />
            {!isAdminPage && <Footer />}
        </div>
    );
}

// Simple Footer Component
const Footer = () => {
    return (
        <footer className="bg-gray-900 text-white py-12 border-t border-gray-800" role="contentinfo" aria-label="Site footer">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
              <div className="mb-8 md:mb-0">
                <span className="font-black text-xl block mb-2">GEORGE K.</span>
                <p className="text-gray-500 text-sm">© 2025 The $100 Guy. All rights reserved.</p>
              </div>
              <div className="flex space-x-6" role="menu" aria-label="Footer links">
                <Link href="/blog" className="text-gray-400 hover:text-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 rounded p-1" aria-label="Visit blog">
                  Blog
                </Link>
                <a href="#" className="text-gray-400 hover:text-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 rounded p-1" aria-label="Follow on Twitter">
                  Twitter
                </a>
                <a href="#" className="text-gray-400 hover:text-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 rounded p-1" aria-label="Follow on YouTube">
                  YouTube
                </a>
                <a href="/contact" className="text-gray-400 hover:text-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 rounded p-1" aria-label="Contact us">
                  Contact
                </a>
              </div>
            </div>
          </footer>
    );
}