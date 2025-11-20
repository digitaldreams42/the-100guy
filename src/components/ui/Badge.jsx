// components/ui/Badge.jsx
import React from 'react';

export default function Badge({ children, type, className = '' }) {
    const colors = {
        Book: "bg-blue-100 text-blue-800",
        Course: "bg-purple-100 text-purple-800",
        Template: "bg-green-100 text-green-800",
        published: "bg-green-100 text-green-800",
        "coming-soon": "bg-yellow-100 text-yellow-800",
        draft: "bg-gray-100 text-gray-800"
    };
    
    return (
        <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wide ${colors[type] || 'bg-gray-100'} ${className}`}>
            {children}
        </span>
    );
}