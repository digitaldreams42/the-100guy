// components/modals/ConfirmationModal.jsx
'use client';

import React from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    isLoading = false
}) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="flex flex-col items-center text-center">
                <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
                <p className="text-lg text-gray-600 mb-8">{message}</p>
                
                <div className="w-full flex justify-center space-x-4">
                    <Button 
                        variant="outline" 
                        onClick={onClose} 
                        disabled={isLoading}
                    >
                        {cancelText}
                    </Button>
                    <Button 
                        variant="danger" // A new variant I'll assume for styling, or it can be a className
                        onClick={onConfirm}
                        loading={isLoading}
                        disabled={isLoading}
                        className="bg-red-600 hover:bg-red-700 text-white"
                    >
                        {confirmText}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
