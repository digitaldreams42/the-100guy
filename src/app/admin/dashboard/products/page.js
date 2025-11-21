// app/admin/dashboard/products/page.js
'use client';

import React, { useState } from 'react';
import { useStore } from '../../../../context/StoreContext';
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react'; // Import Loader2
import ProductForm from '../../../../components/admin/ProductForm';
import Button from '../../../../components/ui/Button';
import Badge from '../../../../components/ui/Badge';
import { deleteProduct } from '../../../../lib/data';
import Modal from '../../../../components/ui/Modal';
import Image from 'next/image';
import ConfirmationModal from '../../../../components/modals/ConfirmationModal'; // Import ConfirmationModal

export default function AdminProductsPage() {
    const { products, showNotification, refetchProducts, isLoadingData } = useStore(); // Access isLoadingData
    const [editingProduct, setEditingProduct] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const handleEdit = (product) => {
        setEditingProduct(product);
        setIsFormOpen(true);
    };

    const handleCreate = () => {
        setEditingProduct(null);
        setIsFormOpen(true);
    };

    const openConfirmation = (product) => {
        setItemToDelete(product);
        setIsConfirmOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;

        setIsDeleting(true);
        const result = await deleteProduct(itemToDelete.id);
        setIsDeleting(false);
        setIsConfirmOpen(false);
        setItemToDelete(null);

        showNotification(result.message, result.success ? 'success' : 'error');
        if (result.success) {
            await refetchProducts();
        }
    };

    const handleFormSave = () => {
        setIsFormOpen(false);
        setEditingProduct(null);
    };

    const handleFormCancel = () => {
        setIsFormOpen(false);
        setEditingProduct(null);
    };

    return (
        <div className="space-y-6">
            <Modal 
                isOpen={isFormOpen} 
                onClose={handleFormCancel} 
                title={editingProduct ? 'Edit Product' : 'Create New Product'}
            >
                <ProductForm 
                    product={editingProduct} 
                    onSave={handleFormSave} 
                    onCancel={handleFormCancel}
                />
            </Modal>

            <ConfirmationModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Confirm Deletion"
                message={`Are you sure you want to delete the product "${itemToDelete?.name}"? This action cannot be undone.`}
                isLoading={isDeleting}
            />

            <div className="flex justify-end">
                <Button onClick={handleCreate} icon={Plus}>
                    Add New Product
                </Button>
            </div>
            
            {isLoadingData ? ( // Conditional render for loading state
                <div className="flex justify-center items-center h-48">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    <p className="ml-2 text-gray-600">Loading products...</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {products.map((product) => (
                                <tr key={product.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {product.coverImage && (
                                            <Image 
                                                src={product.coverImage} 
                                                alt={product.name} 
                                                width={48} 
                                                height={48} 
                                                className="rounded-md object-cover" 
                                            />
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${product.price?.toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.stock === 0 ? 'Unlimited' : product.stock}</td>
                                    <td className="px-6 py-4 whitespace-nowrap"><Badge type={product.status}>{product.status}</Badge></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        <button 
                                            onClick={() => handleEdit(product)} 
                                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                                            disabled={isDeleting}
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button 
                                            onClick={() => openConfirmation(product)} 
                                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                                            disabled={isDeleting}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {products.length === 0 && (
                        <div className="p-6 text-center text-gray-500">No products found. Add one to get started.</div>
                    )}
                </div>
            )}
        </div>
    );
}
