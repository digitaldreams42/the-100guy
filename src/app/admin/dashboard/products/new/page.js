// app/admin/dashboard/products/new/page.js
'use client';

import { useState } from 'react';
import { Upload, AlertCircle, Save, Image, File, Plus, X, Loader2 } from 'lucide-react';
import Button from '../../../../../components/ui/Button';

export default function NewProduct() {
    const [productData, setProductData] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        type: 'Book', // Default to Book
        stock: 0,
        lowStockThreshold: 5,
        status: 'published',
        features: [''],
    });
    const [coverImageFile, setCoverImageFile] = useState(null);
    const [productFileFile, setProductFileFile] = useState(null);
    const [notification, setNotification] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        if (type === 'coverImage') {
            setCoverImageFile(file);
        } else if (type === 'productFile') {
            setProductFileFile(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const formData = new FormData();
            
            // Add all product data fields
            Object.entries(productData).forEach(([key, value]) => {
                if (key === 'features') {
                    formData.append(key, JSON.stringify(value.filter(feature => feature.trim() !== '')));
                } else {
                    formData.append(key, value);
                }
            });

            // Add files if they exist
            if (coverImageFile) {
                formData.append('coverImageFile', coverImageFile);
            }
            if (productFileFile) {
                formData.append('productFileFile', productFileFile);
            }

            const response = await fetch('/api/products', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (response.ok) {
                showNotification('Product created successfully!');
                // Reset form
                setProductData({
                    name: '',
                    description: '',
                    price: '',
                    category: '',
                    type: 'Book',
                    stock: 0,
                    lowStockThreshold: 5,
                    status: 'published',
                    features: [''],
                });
                setCoverImageFile(null);
                setProductFileFile(null);
            } else {
                throw new Error(result.message || 'Failed to create product');
            }
        } catch (error) {
            showNotification('Error creating product: ' + error.message, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

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

            <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Product</h1>

            <form onSubmit={handleSubmit} className="space-y-8">
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

                {/* Files */}
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Files</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="coverImageFile" className="block text-sm font-medium text-gray-700 mb-1">
                                Cover Image
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
                                                onChange={(e) => handleFileChange(e, 'coverImage')}
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
                        <div>
                            <label htmlFor="productFileFile" className="block text-sm font-medium text-gray-700 mb-1">
                                Product File
                            </label>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                <div className="space-y-1 text-center">
                                    <File className="mx-auto h-12 w-12 text-gray-400" />
                                    <div className="flex text-sm text-gray-600">
                                        <label
                                            htmlFor="productFileFile"
                                            className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500"
                                        >
                                            <span>Upload a file</span>
                                            <input
                                                id="productFileFile"
                                                name="productFileFile"
                                                type="file"
                                                onChange={(e) => handleFileChange(e, 'productFile')}
                                                className="sr-only"
                                            />
                                        </label>
                                        <p className="pl-1">or drag and drop</p>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        Any file type up to 100MB
                                    </p>
                                    {productFileFile && (
                                        <p className="text-sm text-gray-600 truncate">{productFileFile.name}</p>
                                    )}
                                </div>
                            </div>
                        </div>
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

                <div className="flex justify-end">
                    <Button
                        type="submit"
                        variant="primary"
                        className="flex items-center"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                Create Product
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}