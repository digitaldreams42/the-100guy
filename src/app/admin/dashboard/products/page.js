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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newProduct, setNewProduct] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        type: '',
        status: 'published',
        coverImage: null,
        coverFile: null,
        productFile: null,
        features: []
    });

    const [imagePreview, setImagePreview] = useState(null);
    const [filePreview, setFilePreview] = useState(null);

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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewProduct({
            ...newProduct,
            [name]: value
        });
    };

        const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewProduct({
                ...newProduct,
                coverFile: file  // Using coverFile as in state
            });
            // Create preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewProduct({
                ...newProduct,
                productFile: file
            });
            // Create preview URL for product file if it's an image
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setFilePreview(reader.result);
                };
                reader.readAsDataURL(file);
            }
        }
    };

    const handleCreateProduct = async (e) => {
        e.preventDefault();

        // Validate required fields
        if (!newProduct.name || !newProduct.description || !newProduct.price || !newProduct.category || !newProduct.type) {
            alert('Please fill in all required fields');
            return;
        }

        // Create FormData to send to API
        const formData = new FormData();
        formData.append('name', newProduct.name);
        formData.append('description', newProduct.description);
        formData.append('price', newProduct.price);
        formData.append('category', newProduct.category);
        formData.append('type', newProduct.type);
        formData.append('status', newProduct.status);
        if (newProduct.coverFile) {
            formData.append('coverImageFile', newProduct.coverFile); // Updated to match API expectation
        }
        if (newProduct.productFile) {
            formData.append('productFileFile', newProduct.productFile); // Updated to match API expectation
        }
        formData.append('features', JSON.stringify(newProduct.features || []));
        formData.append('stock', '0'); // Default stock
        formData.append('lowStockThreshold', '5'); // Default low stock threshold

        try {
            const response = await fetch('/api/products', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Product created successfully:', result);
                setIsModalOpen(false);
                setNewProduct({
                    name: '',
                    description: '',
                    price: '',
                    category: '',
                    type: '',
                    status: 'published',
                    coverFile: null,
                    productFile: null,
                    features: []
                });
                setImagePreview(null);
                setFilePreview(null);
                refetchProducts(); // Refresh the product list
            } else {
                const error = await response.json();
                alert(`Error creating product: ${error.message}`);
            }
        } catch (error) {
            console.error('Error creating product:', error);
            alert('An error occurred while creating the product');
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
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Product
                    </button>
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

            {/* Add Product Modal */}
            {isModalOpen && (
                <div className="fixed z-50 inset-0 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>

                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                                            Add New Product
                                        </h3>
                                        <form onSubmit={handleCreateProduct}>
                                            <div className="space-y-6">
                                                <div>
                                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                                        Product Name
                                                    </label>
                                                    <input
                                                        type="text"
                                                        id="name"
                                                        name="name"
                                                        value={newProduct.name}
                                                        onChange={handleInputChange}
                                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                        required
                                                    />
                                                </div>

                                                <div>
                                                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                                        Description
                                                    </label>
                                                    <textarea
                                                        id="description"
                                                        name="description"
                                                        rows={3}
                                                        value={newProduct.description}
                                                        onChange={handleInputChange}
                                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                        required
                                                    />
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div>
                                                        <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                                                            Price ($)
                                                        </label>
                                                        <input
                                                            type="number"
                                                            id="price"
                                                            name="price"
                                                            value={newProduct.price}
                                                            onChange={handleInputChange}
                                                            step="0.01"
                                                            min="0"
                                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                                                            Category
                                                        </label>
                                                        <input
                                                            type="text"
                                                            id="category"
                                                            name="category"
                                                            value={newProduct.category}
                                                            onChange={handleInputChange}
                                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div>
                                                        <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                                                            Type
                                                        </label>
                                                        <select
                                                            id="type"
                                                            name="type"
                                                            value={newProduct.type}
                                                            onChange={handleInputChange}
                                                            className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                            required
                                                        >
                                                            <option value="">Select a type</option>
                                                            <option value="Book">Book</option>
                                                            <option value="Course">Course</option>
                                                            <option value="Template">Template</option>
                                                            <option value="Other">Other</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                                                            Status
                                                        </label>
                                                        <select
                                                            id="status"
                                                            name="status"
                                                            value={newProduct.status}
                                                            onChange={handleInputChange}
                                                            className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                        >
                                                            <option value="draft">Draft</option>
                                                            <option value="published">Published</option>
                                                            <option value="archived">Archived</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                <div>
                                                    <label htmlFor="coverImage" className="block text-sm font-medium text-gray-700 mb-1">
                                                        Cover Image
                                                    </label>
                                                    <div className="mt-1 flex items-center">
                                                        {imagePreview ? (
                                                            <div className="mr-4">
                                                                <img src={imagePreview} alt="Cover preview" className="h-16 w-16 rounded-md object-cover" />
                                                                <p className="text-xs text-gray-500 mt-1">Preview</p>
                                                            </div>
                                                        ) : (
                                                            <div className="mr-4">
                                                                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 flex items-center justify-center">
                                                                    <span className="text-gray-500 text-xs">No image</span>
                                                                </div>
                                                                <p className="text-xs text-gray-500 mt-1">Current</p>
                                                            </div>
                                                        )}
                                                        <label className="cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                                                            <span className="px-3 py-2 border border-gray-300 rounded-md shadow-sm">Choose File</span>
                                                            <input
                                                                type="file"
                                                                id="coverImage"
                                                                name="coverImage"
                                                                accept="image/*"
                                                                onChange={handleImageChange}
                                                                className="sr-only"
                                                            />
                                                        </label>
                                                    </div>
                                                </div>

                                                <div>
                                                    <label htmlFor="productFile" className="block text-sm font-medium text-gray-700 mb-1">
                                                        Product File
                                                    </label>
                                                    <div className="mt-1 flex items-center">
                                                        {filePreview ? (
                                                            <div className="mr-4">
                                                                {newProduct.productFile?.type?.startsWith('image/') ? (
                                                                    <img src={filePreview} alt="File preview" className="h-16 w-16 rounded-md object-contain" />
                                                                ) : (
                                                                    <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 flex items-center justify-center">
                                                                        <span className="text-gray-500 text-xs">PDF</span>
                                                                    </div>
                                                                )}
                                                                <p className="text-xs text-gray-500 mt-1">Preview</p>
                                                            </div>
                                                        ) : (
                                                            <div className="mr-4">
                                                                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 flex items-center justify-center">
                                                                    <span className="text-gray-500 text-xs">None</span>
                                                                </div>
                                                                <p className="text-xs text-gray-500 mt-1">Current</p>
                                                            </div>
                                                        )}
                                                        <label className="cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                                                            <span className="px-3 py-2 border border-gray-300 rounded-md shadow-sm">Choose File</span>
                                                            <input
                                                                type="file"
                                                                id="productFile"
                                                                name="productFile"
                                                                onChange={handleFileChange}
                                                                className="sr-only"
                                                            />
                                                        </label>
                                                    </div>
                                                    <p className="mt-1 text-xs text-gray-500">Upload the product file (e.g., PDF, ZIP, etc.)</p>
                                                </div>
                                            </div>

                                            <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                                                <button
                                                    type="submit"
                                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:col-start-2 sm:text-sm"
                                                >
                                                    Add Product
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setIsModalOpen(false);
                                                        setNewProduct({
                                                            name: '',
                                                            description: '',
                                                            price: '',
                                                            category: '',
                                                            type: '',
                                                            status: 'published',
                                                            coverImage: null,
                                                            productFile: null,
                                                            features: []
                                                        });
                                                        setImagePreview(null);
                                                        setFilePreview(null);
                                                    }}
                                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}