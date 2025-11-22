// app/store/page.js
'use client';

import { Search, Filter } from 'lucide-react';
import ProductGrid from '../../components/store/ProductGrid';
import { useStore } from '../../context/StoreContext';
import { PRODUCT_TYPES } from '../../lib/constants';

export default function StorePage() {
    const { 
        activeFilter, 
        setActiveFilter, 
        searchQuery, 
        setSearchQuery, 
        filteredProducts 
    } = useStore();

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

          <ProductGrid items={filteredProducts} />
        </div>
      </div>
    );
}