// app/layout.js
'use client';

import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import { StoreProvider } from '../context/StoreContext';
import CartModal from '../components/modals/CartModal';
import ProductModal from '../components/modals/ProductModal';
import Notification from '../components/Notification';
import Head from 'next/head';
import { useStore } from '../context/StoreContext';
import { usePathname } from 'next/navigation';
import { ShoppingCart } from 'lucide-react';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';

// Simple Navbar component for the main layout
const NavbarComponent = () => {
    const pathname = usePathname();
    const { setIsCartOpen, cart } = useStore();
    const { isUserAdmin } = useAuth();

    const NavButton = ({ href, children }) => {
        const isActive = pathname === href;
        return (
            <Link href={href}>
                <span className={`text-sm font-medium hover:text-yellow-500 cursor-pointer ${isActive ? 'text-yellow-500' : 'text-gray-600'}`}>{children}</span>
            </Link>
        );
    };

    return (
        <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link href="/">
                        <div className="flex items-center cursor-pointer">
                            <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center mr-2">
                                <span className="font-black text-lg">G</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-gray-900 leading-none">GEORGE K.</span>
                                <span className="text-xs font-medium text-gray-500">THE $100 GUY</span>
                            </div>
                        </div>
                    </Link>

                    <div className="hidden md:flex items-center space-x-8">
                        <NavButton href="/">Home</NavButton>
                        <NavButton href="/store">Store</NavButton>
                        <NavButton href="/about">About</NavButton>
                    </div>

                    <div className="flex items-center space-x-4">
                        <button 
                            onClick={() => setIsCartOpen(true)}
                            className="relative p-2 text-gray-600 hover:text-yellow-500 transition-colors"
                        >
                            <ShoppingCart size={20} />
                            {cart.length > 0 && (
                                <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                                    {cart.length}
                                </span>
                            )}
                        </button>
                        {isUserAdmin && (
                            <Link href="/admin/dashboard">
                                <span className="text-xs font-bold text-gray-400 hover:text-gray-900 uppercase tracking-wider cursor-pointer">
                                    Admin
                                </span>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};



export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <Head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>George K. - The $100 Guy Blueprint</title>
                <script src="https://cdn.tailwindcss.com"></script>
                <style>{`
                    body { font-family: 'Inter', sans-serif; }
                    .text-stroke { -webkit-text-stroke: 1px black; text-stroke: 1px black; color: transparent; }
                `}</style>
            </Head>
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
            {children}
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
        <footer className="bg-gray-900 text-white py-12 border-t border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
              <div className="mb-8 md:mb-0">
                <span className="font-black text-xl block mb-2">GEORGE K.</span>
                <p className="text-gray-500 text-sm">© 2025 The $100 Guy. All rights reserved.</p>
              </div>
              <div className="flex space-x-6">
                <a href="#" className="text-gray-400 hover:text-yellow-400">Twitter</a>
                <a href="#" className="text-gray-400 hover:text-yellow-400">YouTube</a>
                <a href="#" className="text-gray-400 hover:text-yellow-400">Instagram</a>
              </div>
            </div>
          </footer>
    );
}