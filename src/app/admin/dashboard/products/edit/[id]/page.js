// app/admin/dashboard/products/edit/[id]/page.js
'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, Save, Image, File, Loader2, X, Plus } from 'lucide-react';
import Button from '../../../../../../components/ui/Button';

export default function EditProduct({ params }) {
    const { id } = params;
    const [productData, setProductData] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        type: 'Book',
        stock: 0,
        lowStockThreshold: 5,
        status: 'published',
        features: [],
        coverImage: ''
    });
    const [coverImageFile, setCoverImageFile] = useState(null);
    const [notification, setNotification] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch existing product
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await fetch(`/api/products`);
                if (response.ok) {
                    const products = await response.json();
                    const product = products.find(p => p.id === id);
                    if (product) {
                        setProductData({
                            ...product,
                            features: Array.isArray(product.features) ? product.features : [],
                            price: product.price ? product.price.toString() : ''
                        });
                    }
                } else {
                    throw new Error('Failed to fetch product');
                }
            } catch (error) {
                showNotification('Error loading product: ' + error.message, 'error');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchProduct();
        }
    }, [id]);

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProductData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCoverImageFile(file);
        }
    };

    const handleFeatureChange = (index, value) => {
        const newFeatures = [...productData.features];
        newFeatures[index] = value;
        setProductData(prev => ({
            ...prev,
            features: newFeatures
        }));
    };

    const addFeature = () => {
        setProductData(prev => ({
            ...prev,
            features: [...prev.features, '']
        }));
    };

    const removeFeature = (index) => {
        const newFeatures = productData.features.filter((_, i) => i !== index);
        setProductData(prev => ({
            ...prev,
            features: newFeatures
        }));
    };

    const handleUpdateProduct = async (e) => {
        e.preventDefault();

        try {
            // Create FormData to send to API
            const formData = new FormData();
            formData.append('name', productData.name);
            formData.append('description', productData.description);
            formData.append('price', productData.price);
            formData.append('category', productData.category);
            formData.append('type', productData.type);
            formData.append('stock', productData.stock);
            formData.append('lowStockThreshold', productData.lowStockThreshold);
            formData.append('status', productData.status);
            formData.append('features', JSON.stringify(productData.features.filter(feature => feature.trim() !== '')));

            // Only upload new file if selected
            if (coverImageFile) {
                formData.append('coverImageFile', coverImageFile);
            }

            const response = await fetch(`/api/products`, {
                method: 'PUT',
                body: formData
            });

            const result = await response.json();

            if (response.ok) {
                showNotification('Product updated successfully!');
            } else {
                throw new Error(result.message || 'Failed to update product');
            }
        } catch (error) {
            showNotification('Error updating product: ' + error.message, 'error');
        }
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-center items-center h-48">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <p className="ml-2 text-gray-600">Loading product...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Notification */}
            {notification && (
                <div className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg ${
                    notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                    <div className="flex items-center">
                        <AlertCircle className="w-5 h-5 mr-2" />
                        {notification.message}
                    </div>
                </div>
            )}

            <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Product</h1>

            <form onSubmit={handleUpdateProduct} className="space-y-8">
                {/* Basic Information */}
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Basic Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                Product Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={productData.name}
                                onChange={handleInputChange}
                                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                                value={productData.category}
                                onChange={handleInputChange}
                                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                                Price ($)
                            </label>
                            <input
                                type="number"
                                id="price"
                                name="price"
                                value={productData.price}
                                onChange={handleInputChange}
                                min="0"
                                step="0.01"
                                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                                Product Type
                            </label>
                            <select
                                id="type"
                                name="type"
                                value={productData.type}
                                onChange={handleInputChange}
                                className="block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            >
                                <option value="Book">Book</option>
                                <option value="Course">Course</option>
                                <option value="Template">Template</option>
                                <option value="Software">Software</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                            Product Description
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={productData.description}
                            onChange={handleInputChange}
                            rows={4}
                            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            required
                        />
                    </div>
                </div>

                {/* Features */}
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Features</h2>
                    <div className="space-y-3">
                        {productData.features.map((feature, index) => (
                            <div key={index} className="flex items-center">
                                <input
                                    type="text"
                                    value={feature}
                                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                                    placeholder={`Feature ${index + 1}`}
                                    className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                                {productData.features.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeFeature(index)}
                                        className="ml-2 p-2 text-red-500 hover:text-red-700"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={addFeature}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                        >
                            <Plus className="w-4 h-4 mr-1" />
                            Add Feature
                        </button>
                    </div>
                </div>

                {/* Inventory */}
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Inventory</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">
                                Stock Quantity
                            </label>
                            <input
                                type="number"
                                id="stock"
                                name="stock"
                                value={productData.stock}
                                onChange={handleInputChange}
                                min="0"
                                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor="lowStockThreshold" className="block text-sm font-medium text-gray-700 mb-1">
                                Low Stock Alert Threshold
                            </label>
                            <input
                                type="number"
                                id="lowStockThreshold"
                                name="lowStockThreshold"
                                value={productData.lowStockThreshold}
                                onChange={handleInputChange}
                                min="0"
                                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* Cover Image */}
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Cover Image</h2>
                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <label htmlFor="coverImageFile" className="block text-sm font-medium text-gray-700 mb-1">
                                Upload New Cover Image
                            </label>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                <div className="space-y-1 text-center">
                                    <Image className="mx-auto h-12 w-12 text-gray-400" />
                                    <div className="flex text-sm text-gray-600">
                                        <label
                                            htmlFor="coverImageFile"
                                            className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500"
                                        >
                                            <span>Upload a file</span>
                                            <input
                                                id="coverImageFile"
                                                name="coverImageFile"
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="sr-only"
                                            />
                                        </label>
                                        <p className="pl-1">or drag and drop</p>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        PNG, JPG, GIF up to 10MB
                                    </p>
                                    {coverImageFile && (
                                        <p className="text-sm text-gray-600 truncate">{coverImageFile.name}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                        {productData.coverImage && !coverImageFile && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Current Cover Image
                                </label>
                                <div className="mt-2">
                                    <img 
                                        src={productData.coverImage} 
                                        alt="Current cover" 
                                        className="h-32 object-contain rounded-md"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Status */}
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Status</h2>
                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                            Product Status
                        </label>
                        <select
                            id="status"
                            name="status"
                            value={productData.status}
                            onChange={handleInputChange}
                            className="block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        >
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                            <option value="archived">Archived</option>
                        </select>
                    </div>
                </div>

                <div className="flex justify-end space-x-4">
                    <Button
                        variant="outline"
                        className="border-gray-300"
                        onClick={() => window.history.back()}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        className="flex items-center"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        Update Product
                    </Button>
                </div>
            </form>
        </div>
    );
}