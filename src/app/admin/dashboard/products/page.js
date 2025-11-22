// app/admin/dashboard/products/page.js
'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Edit, Trash2, Upload, Eye, Search } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import { useStore } from '../../../../context/StoreContext';
import Link from 'next/link';

export default function ProductsManagement() {
    const {
        products,
        refetchProducts,
        setActiveFilter,
        setSearchQuery,
    } = useStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProducts, setSelectedProducts] = useState([]);


    // Filter products based on search term
    const searchedProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelectProduct = (productId) => {
        if (selectedProducts.includes(productId)) {
            setSelectedProducts(selectedProducts.filter(id => id !== productId));
        } else {
            setSelectedProducts([...selectedProducts, productId]);
        }
    };



    const handleBulkDelete = async () => {
        if (selectedProducts.length === 0) return;

        if (confirm(`Are you sure you want to delete ${selectedProducts.length} products?`)) {
            try {
                // In a real implementation, this would call the API to delete selected products
                for (const productId of selectedProducts) {
                    await fetch(`/api/products/${productId}`, {
                        method: 'DELETE'
                    });
                }
                setSelectedProducts([]);
                refetchProducts(); // Refresh the product list
            } catch (error) {
                console.error('Error deleting products:', error);
                alert('An error occurred while deleting products');
            }
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
                <div className="flex space-x-4">
                    <Link href="/admin/dashboard/products/new" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Product
                        </Button>
                    </Link>
                    {selectedProducts.length > 0 && (
                        <button
                            onClick={handleBulkDelete}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Selected
                        </button>
                    )}
                </div>
            </div>

            {/* Search bar */}
            <div className="mb-6">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
            </div>

            {/* Products table */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                    {searchedProducts.map((product) => (
                        <li key={product.id} className="hover:bg-gray-50">
                            <div className="px-6 py-4 flex items-center justify-between">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={selectedProducts.includes(product.id)}
                                        onChange={() => handleSelectProduct(product.id)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <div className="ml-4 flex-shrink-0">
                                        {product.coverImage ? (
                                            <img
                                                className="h-16 w-16 rounded-md object-cover"
                                                src={product.coverImage}
                                                alt={product.name}
                                            />
                                        ) : (
                                            <div className={`h-16 w-16 rounded-md ${product.coverColor || 'bg-gray-200'} flex items-center justify-center`}>
                                                <span className="text-gray-500 text-xs">{product.name.charAt(0)}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="ml-4">
                                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                        <div className="text-sm text-gray-500">{product.category} • {product.type}</div>
                                        <div className="text-sm text-gray-500">${product.price} • {product.status}</div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                        ${product.price?.toFixed(2)}
                                    </span>
                                    <Link href={`/products/${product.id}`}>
                                        <button className="p-1 text-gray-400 hover:text-gray-500" title="View product">
                                            <Eye className="h-4 w-4" />
                                        </button>
                                    </Link>
                                    <Link href={`/admin/dashboard/products/edit/${product.id}`}>
                                        <button className="p-1 text-gray-400 hover:text-blue-500" title="Edit product">
                                            <Edit className="h-4 w-4" />
                                        </button>
                                    </Link>
                                    <button
                                        className="p-1 text-gray-400 hover:text-red-500"
                                        title="Delete product"
                                        onClick={async () => {
                                            if (confirm(`Are you sure you want to delete ${product.name}?`)) {
                                                try {
                                                    const response = await fetch(`/api/products/${product.id}`, {
                                                        method: 'DELETE'
                                                    });
                                                    if (response.ok) {
                                                        refetchProducts(); // Refresh the product list
                                                    } else {
                                                        const error = await response.json();
                                                        alert(`Error deleting product: ${error.message}`);
                                                    }
                                                } catch (error) {
                                                    console.error('Error deleting product:', error);
                                                    alert('An error occurred while deleting the product');
                                                }
                                            }
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>

                {searchedProducts.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No products found</p>
                    </div>
                )}
            </div>


        </div>
    );
}