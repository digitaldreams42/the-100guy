// components/Notification.jsx
'use client';

import React from 'react';
import { useStore } from '../context/StoreContext';
import { Check, X, AlertTriangle } from 'lucide-react';

export default function Notification() {
    const { notification, showNotification } = useStore();

    if (!notification) return null;

    const { message, type } = notification;

    const baseStyle = "fixed bottom-4 right-4 z-50 p-4 rounded-xl shadow-2xl transition-all duration-300 transform";
    
    const styles = {
        success: "bg-green-500 text-white",
        error: "bg-red-500 text-white",
    };
    
    const Icon = type === 'success' ? Check : AlertTriangle;

    return (
        <div className={`${baseStyle} ${styles[type]}`}>
            <div className="flex items-start">
                <Icon size={20} className="mr-3 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                    <p className="font-semibold">{type === 'success' ? 'Success' : 'Error'}</p>
                    <p className="text-sm">{message}</p>
                </div>
                <button onClick={() => showNotification(null)} className="ml-4 text-white/80 hover:text-white">
                    <X size={16} />
                </button>
            </div>
        </div>
    );
}