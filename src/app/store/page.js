// app/store/page.js
'use client';

import { Search, Filter, DollarSign, Star } from 'lucide-react';
import ProductGrid from '../../components/store/ProductGrid';
import { useStore } from '../../context/StoreContext';
import { PRODUCT_TYPES } from '../../lib/constants';
import { useState, useMemo } from 'react';

export default function StorePage() {
    const {
        activeFilter,
        setActiveFilter,
        searchQuery,
        setSearchQuery,
        filteredProducts
    } = useStore();

    const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
    const [sortBy, setSortBy] = useState('default');

    // Extract unique categories for category filter
    const allCategories = useMemo(() => {
        const categories = new Set();
        filteredProducts.forEach(product => {
            if (product.category) {
                categories.add(product.category);
            }
        });
        return Array.from(categories);
    }, [filteredProducts]);

    // Apply additional filters and sorting
    const filteredAndSortedProducts = useMemo(() => {
        let result = [...filteredProducts];

        // Price range filter
        result = result.filter(product =>
            product.price >= priceRange.min &&
            product.price <= priceRange.max
        );

        // Sorting
        switch(sortBy) {
            case 'price-low':
                result.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                result.sort((a, b) => b.price - a.price);
                break;
            case 'name':
                result.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'default':
            default:
                // Keep original order from filteredProducts
                break;
        }

        return result;
    }, [filteredProducts, priceRange, sortBy]);

    return (
        <div className="min-h-screen bg-gray-50 pt-8 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <h1 className="text-3xl font-black text-gray-900">Store</h1>
              <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-yellow-500 w-full md:w-64"
                />
              </div>

              <div className="flex bg-white p-1 rounded-lg border border-gray-200 overflow-x-auto">
                {Object.values(PRODUCT_TYPES).map(type => (
                  <button
                    key={type}
                    onClick={() => setActiveFilter(type)}
                    className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${activeFilter === type ? 'bg-yellow-100 text-yellow-800' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Advanced Filters Section */}
          <div className="mb-8 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Price Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <DollarSign className="w-4 h-4 mr-1" /> Price Range
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange({...priceRange, min: Number(e.target.value)})}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({...priceRange, max: Number(e.target.value)})}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  onChange={(e) => {
                    if (e.target.value === 'all') {
                      setSearchQuery('');
                    } else {
                      setSearchQuery(e.target.value);
                    }
                  }}
                >
                  <option value="all">All Categories</option>
                  {allCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="default">Default</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name">Name: A to Z</option>
                </select>
              </div>
            </div>

            {/* Reset Filters Button */}
            <div className="mt-4 text-right">
              <button
                onClick={() => {
                  setPriceRange({ min: 0, max: 1000 });
                  setSortBy('default');
                  setSearchQuery('');
                }}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Reset All Filters
              </button>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-gray-600">
              Showing <span className="font-bold">{filteredAndSortedProducts.length}</span> products
            </p>
          </div>

          <ProductGrid items={filteredAndSortedProducts} />
        </div>
      </div>
    );
}