// components/admin/ProductForm.jsx
'use client';

import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import { Check, X, Loader2 } from 'lucide-react';
import { createProduct, updateProduct } from '../../lib/data';
import { PRODUCT_TYPES } from '../../lib/constants';
import { useStore } from '../../context/StoreContext';

const initialFormState = {
    title: '',
    subtitle: '',
    price: '',
    type: PRODUCT_TYPES.BOOK,
    status: 'draft',
    category: '',
    description: '',
    features: [''],
    coverColor: 'from-gray-400 to-gray-500' // Default color
};

export default function ProductForm({ product, onSave, onCancel }) {
    const [formData, setFormData] = useState(initialFormState);
    const [loading, setLoading] = useState(false);
    const { showNotification, refetchProducts } = useStore();

    useEffect(() => {
        if (product) {
            setFormData({
                ...initialFormState,
                ...product,
                price: product.price.toString(), // Ensure price is string for input value
                features: product.features || ['']
            });
        } else {
            setFormData(initialFormState);
        }
    }, [product]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
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

        const dataToSave = {
            ...formData,
            price: parseFloat(formData.price),
            features: formData.features.filter(f => f.trim() !== ''),
        };
        // Do not send id or other read-only fields back to the API for update/create
        delete dataToSave.id;
        delete dataToSave.createdAt;
        delete dataToSave.downloads;
        
        const result = product?.id 
            ? await updateProduct(product.id, dataToSave)
            : await createProduct(dataToSave);
        
        setLoading(false);
        showNotification(result.message, result.success ? 'success' : 'error');
        
        if (result.success) {
            await refetchProducts(); // Re-fetch products to update the list
            onSave();
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">{product ? 'Edit Product' : 'Create New Product'}</h2>
            
            {/* Title & Subtitle */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Title</label>
                    <input type="text" name="title" value={formData.title} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Subtitle</label>
                    <input type="text" name="subtitle" value={formData.subtitle} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                </div>
            </div>

            {/* Price & Category */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Price ($)</label>
                    <input type="number" name="price" value={formData.price} onChange={handleChange} required step="0.01" min="0" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Product Type</label>
                    <select name="type" value={formData.type} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                        {Object.values(PRODUCT_TYPES).filter(t => t !== PRODUCT_TYPES.ALL).map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select name="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                        <option value="coming-soon">Coming Soon</option>
                    </select>
                </div>
            </div>

            {/* Description */}
            <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows="3" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"></textarea>
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