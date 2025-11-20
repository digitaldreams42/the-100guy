'use client'; 

import { Loader2 } from 'lucide-react';

export default function Button({ 
    children, 
    onClick, 
    variant = 'primary', 
    className = '', 
    icon: Icon, 
    disabled, 
    loading = false,
    type = 'button' 
}) {
    const baseStyle = "flex items-center justify-center px-6 py-3 rounded-lg font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
    
    const variants = {
        primary: "bg-yellow-400 hover:bg-yellow-500 text-black shadow-lg hover:shadow-yellow-400/30",
        secondary: "bg-gray-900 hover:bg-gray-800 text-white border border-gray-700",
        outline: "border-2 border-black hover:bg-gray-50 text-black",
        danger: "bg-red-500 hover:bg-red-600 text-white",
        ghost: "hover:bg-gray-100 text-gray-700"
    };

    return (
        <button 
            type={type}
            onClick={onClick} 
            className={`${baseStyle} ${variants[variant]} ${className}`} 
            disabled={disabled || loading}
        >
            {loading ? (
                <Loader2 size={18} className="mr-2 animate-spin" />
            ) : (
                Icon && <Icon size={18} className="mr-2" />
            )}
            {children}
        </button>
    );
}