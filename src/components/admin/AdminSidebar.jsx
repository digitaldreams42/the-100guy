// components/admin/AdminSidebar.jsx
'use client';

import React from 'react';
import Link from 'next/link';
import { LayoutDashboard, Package, BarChart3, Users, LogOut, MessageSquare, Image } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePathname } from 'next/navigation';
import Button from '../ui/Button';

const navItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Products', href: '/admin/dashboard/products', icon: Package },
    { name: 'Blog', href: '/admin/dashboard/blog', icon: MessageSquare },
    { name: 'Media', href: '/admin/dashboard/media', icon: Image },
    { name: 'Subscribers', href: '/admin/dashboard/subscribers', icon: Users },
    { name: 'Analytics', href: '/admin/dashboard/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/admin/settings', icon: LayoutDashboard },
];

export default function AdminSidebar() {
    const { logout, user } = useAuth();
    const pathname = usePathname();

    const NavItem = ({ item }) => {
        // Exact match for dashboard, startsWith for others to handle nested routes.
        const isActive = item.href === '/admin/dashboard' 
            ? pathname === item.href 
            : pathname.startsWith(item.href);
        
        return (
            <Link href={item.href} passHref>
                <div className={`flex items-center p-3 rounded-lg transition-colors cursor-pointer ${isActive ? 'bg-yellow-400 text-gray-900 font-bold' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
                    <item.icon size={20} className="mr-3" />
                    <span>{item.name}</span>
                </div>
            </Link>
        );
    };

    return (
        <div className="w-64 bg-gray-900 text-white flex flex-col h-full fixed top-0 left-0 pt-16 hidden lg:flex">
            <div className="p-4 border-b border-gray-800">
                <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">Signed in as:</p>
                <p className="font-medium text-sm text-yellow-400 truncate">{user?.email || user?.uid}</p>
            </div>
            <nav className="flex-1 p-4 space-y-2">
                {navItems.map(item => (
                    <NavItem key={item.name} item={item} />
                ))}
            </nav>
            <div className="p-4 border-t border-gray-800">
                <Button onClick={logout} variant="danger" icon={LogOut} className="w-full">
                    Sign Out
                </Button>
            </div>
        </div>
    );
}
