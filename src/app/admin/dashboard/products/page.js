// app/admin/dashboard/products/page.js
'use client';

import React, { useState } from 'react';
import { useStore } from '../../../../context/StoreContext';
import { Plus, Edit, Trash2 } from 'lucide-react';
import ProductForm from '../../../../components/admin/ProductForm';
import Button from '../../../../components/ui/Button';
import Badge from '../../../../components/ui/Badge';
import { deleteProduct } from '../../../../lib/data';
import Modal from '../../../../components/ui/Modal'; // Import the new Modal

export default function AdminProductsPage() {
    const { products, showNotification, refetchProducts } = useStore();
    const [editingProduct, setEditingProduct] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleEdit = (product) => {
        setEditingProduct(product);
        setIsFormOpen(true);
    };

    const handleCreate = () => {
        setEditingProduct(null);
        setIsFormOpen(true);
    };

    const handleDelete = async (productId, title) => {
        if (!window.confirm(`Are you sure you want to delete product: ${title}? This cannot be undone.`)) {
            return;
        }

        setIsDeleting(true);
        const result = await deleteProduct(productId);
        setIsDeleting(false);

        showNotification(result.message, result.success ? 'success' : 'error');
        if (result.success) {
            await refetchProducts();
        }
    };

    const handleFormSave = () => {
        setIsFormOpen(false);
        setEditingProduct(null); // Clear editing product on save
    };

    const handleFormCancel = () => {
        setIsFormOpen(false);
        setEditingProduct(null); // Clear editing product on cancel
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

            <div className="flex justify-end">
                <Button onClick={handleCreate} icon={Plus}>
                    Add New Product
                </Button>
            </div>
            
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {products.map((product) => (
                            <tr key={product.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.title}</td>
                                <td className="px-6 py-4 whitespace-nowrap"><Badge type={product.type}>{product.type}</Badge></td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${product.price?.toFixed(2)}</td>
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
                                        onClick={() => handleDelete(product.id, product.title)} 
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
        </div>
    );
}
