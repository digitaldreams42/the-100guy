// components/admin/ProductForm.jsx
'use client';

import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import { Check, X, Loader2, Image as ImageIcon, File as FileIcon } from 'lucide-react';
import { createProduct, updateProduct } from '../../lib/data';
import { PRODUCT_TYPES } from '../../lib/constants';
import { useStore } from '../../context/StoreContext';

const initialFormState = {
    name: '', // Changed from title to name
    subtitle: '',
    price: '',
    type: PRODUCT_TYPES.BOOK,
    status: 'draft',
    category: '', // Added category
    stock: '',    // Added stock
    description: '',
    features: [''],
    coverColor: 'from-gray-400 to-gray-500', // Default color
    coverImage: '', // URL
    productFile: '', // URL
};

export default function ProductForm({ product, onSave, onCancel }) {
    const [formData, setFormData] = useState(initialFormState);
    const [coverImageFile, setCoverImageFile] = useState(null);
    const [productFileFile, setProductFileFile] = useState(null);
    const [coverImagePreview, setCoverImagePreview] = useState('');
    const [productFilePreview, setProductFilePreview] = useState('');
    const [loading, setLoading] = useState(false);
    const { showNotification, refetchProducts } = useStore();

    useEffect(() => {
        if (product) {
            setFormData({
                ...initialFormState,
                ...product,
                name: product.name || '', // Ensure name is set
                price: product.price.toString(), // Ensure price is string for input value
                stock: product.stock ? product.stock.toString() : '', // Ensure stock is string
                features: product.features || [''],
                coverImage: product.coverImage || '',
                productFile: product.productFile || '',
            });
            setCoverImagePreview(product.coverImage || '');
            setProductFilePreview(product.productFile || '');
        } else {
            setFormData(initialFormState);
            setCoverImagePreview('');
            setProductFilePreview('');
        }
        setCoverImageFile(null);
        setProductFileFile(null);
    }, [product]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e, fileType) => {
        const file = e.target.files[0];
        if (file) {
            if (fileType === 'coverImage') {
                setCoverImageFile(file);
                setCoverImagePreview(URL.createObjectURL(file));
            } else if (fileType === 'productFile') {
                setProductFileFile(file);
                // For product files, we might not have a visual preview,
                // but we can show the file name.
                setProductFilePreview(file.name); 
            }
        } else {
            if (fileType === 'coverImage') {
                setCoverImageFile(null);
                setCoverImagePreview(product?.coverImage || '');
            } else if (fileType === 'productFile') {
                setProductFileFile(null);
                setProductFilePreview(product?.productFile || '');
            }
        }
    };

    const handleFeatureChange = (index, value) => {
        const newFeatures = [...formData.features];
        newFeatures[index] = value;
        setFormData(prev => ({ ...prev, features: newFeatures }));
    };

    const addFeature = () => {
        setFormData(prev => ({ ...prev, features: [...prev.features, ''] }));
    };

    const removeFeature = (index) => {
        setFormData(prev => ({ ...prev, features: prev.features.filter((_, i) => i !== index) }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formPayload = new FormData();
        // Append all text fields
        for (const key in formData) {
            if (key !== 'features' && key !== 'coverImage' && key !== 'productFile') {
                formPayload.append(key, formData[key]);
            }
        }
        // Append features as a JSON string
        formPayload.append('features', JSON.stringify(formData.features.filter(f => f.trim() !== '')));

        // Append files
        if (coverImageFile) {
            formPayload.append('coverImageFile', coverImageFile);
        } else if (formData.coverImage) {
            // If no new file, but there's an existing URL, send it
            formPayload.append('coverImage', formData.coverImage);
        }

        if (productFileFile) {
            formPayload.append('productFileFile', productFileFile);
        } else if (formData.productFile) {
            // If no new file, but there's an existing URL, send it
            formPayload.append('productFile', formData.productFile);
        }
        
        // Remove product.id and other read-only fields for API calls
        if (product?.id) {
            formPayload.append('id', product.id); // For PUT, ID is needed in payload for lib/data.js
        }
        formPayload.delete('createdAt'); // Ensure these are not sent
        formPayload.delete('updatedAt');
        formPayload.delete('salesCount');

        const result = product?.id 
            ? await updateProduct(product.id, formPayload)
            : await createProduct(formPayload);
        
        setLoading(false);
        showNotification(result.message, result.success ? 'success' : 'error');
        
        if (result.success) {
            await refetchProducts();
            onSave();
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">{product ? 'Edit Product' : 'Create New Product'}</h2>
            
            {/* Name & Subtitle */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Product Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Subtitle (Optional)</label>
                    <input type="text" name="subtitle" value={formData.subtitle} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                </div>
            </div>

            {/* Price, Stock, Category & Type */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Price ($)</label>
                    <input type="number" name="price" value={formData.price} onChange={handleChange} required step="0.01" min="0" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Stock (0 for unlimited)</label>
                    <input type="number" name="stock" value={formData.stock} onChange={handleChange} required min="0" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <input type="text" name="category" value={formData.category} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Product Type</label>
                    <select name="type" value={formData.type} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                        {Object.values(PRODUCT_TYPES).filter(t => t !== PRODUCT_TYPES.ALL).map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Description */}
            <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows="3" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"></textarea>
            </div>

            {/* Cover Image Upload */}
            <div>
                <label className="block text-sm font-medium text-gray-700">Cover Image</label>
                <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'coverImage')} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100" />
                {coverImagePreview && (
                    <div className="mt-2 relative w-32 h-32 border rounded-md overflow-hidden">
                        <img src={coverImagePreview} alt="Cover Preview" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => { setCoverImageFile(null); setCoverImagePreview(''); setFormData(prev => ({ ...prev, coverImage: '' })); }} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1">
                            <X size={16} />
                        </button>
                    </div>
                )}
            </div>

            {/* Product File Upload */}
            <div>
                <label className="block text-sm font-medium text-gray-700">Product File (e.g., PDF, ZIP, MP4)</label>
                <input type="file" onChange={(e) => handleFileChange(e, 'productFile')} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                {productFilePreview && (
                    <div className="mt-2 flex items-center gap-2">
                        <FileIcon size={20} className="text-gray-500" />
                        <span>{productFilePreview.startsWith('blob:') ? productFileFile.name : productFilePreview.split('/').pop()}</span>
                        <button type="button" onClick={() => { setProductFileFile(null); setProductFilePreview(''); setFormData(prev => ({ ...prev, productFile: '' })); }} className="text-red-500 hover:text-red-700">
                            <X size={20} />
                        </button>
                    </div>
                )}
            </div>

            {/* Features */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Features / Inclusions</label>
                {formData.features.map((feature, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                        <input
                            type="text"
                            value={feature}
                            onChange={(e) => handleFeatureChange(index, e.target.value)}
                            placeholder={`Feature ${index + 1}`}
                            className="flex-1 border border-gray-300 rounded-md shadow-sm p-2"
                        />
                        <button type="button" onClick={() => removeFeature(index)} className="text-red-500 hover:text-red-700">
                            <X size={20} />
                        </button>
                    </div>
                ))}
                <Button type="button" onClick={addFeature} variant="ghost" className="text-sm px-4 py-2 border border-dashed mt-2">
                    Add Feature
                </Button>
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-4 border-t">
                <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
                    Cancel
                </Button>
                <Button type="submit" variant="primary" icon={product ? Check : Loader2} loading={loading}>
                    {product ? 'Save Changes' : 'Create Product'}
                </Button>
            </div>
        </form>
    );
}