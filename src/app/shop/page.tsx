'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal, ArrowUpDown, X, Sparkles, Filter, Leaf, ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from '../../components/ProductCard';
import { getCategories, getProducts } from '../../lib/db';
import { Category, Product } from '../../lib/types';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS } from '../../lib/seedData';

function ShopContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('cat') || 'all';
  const initialQuery = searchParams.get('q') || '';

  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>(initialQuery);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'name'>('featured');
  const [showInStockOnly, setShowInStockOnly] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [showMobileFilterModal, setShowMobileFilterModal] = useState<boolean>(false);

  useEffect(() => {
    Promise.all([getCategories(), getProducts()]).then(([catData, prodData]) => {
      setCategories(catData);
      setProducts(prodData);
      setLoading(false);
    });

    const handleCatUpdate = (e: any) => setCategories(e.detail || INITIAL_CATEGORIES);
    const handleProdUpdate = (e: any) => setProducts(e.detail || INITIAL_PRODUCTS);

    window.addEventListener('ia_categories_updated', handleCatUpdate);
    window.addEventListener('ia_products_updated', handleProdUpdate);

    return () => {
      window.removeEventListener('ia_categories_updated', handleCatUpdate);
      window.removeEventListener('ia_products_updated', handleProdUpdate);
    };
  }, []);

  // Update filter when query param changes
  useEffect(() => {
    const cat = searchParams.get('cat');
    if (cat) setSelectedCategory(cat);
    const q = searchParams.get('q');
    if (q) setSearchQuery(q);
  }, [searchParams]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        // Active status
        if (!product.is_active) return false;

        // Stock status
        if (showInStockOnly && product.stock <= 0) return false;

        // Category filter
        if (selectedCategory !== 'all') {
          const cat = categories.find((c) => c.slug === selectedCategory);
          if (cat && product.category_id !== cat.id && product.category_id !== cat.slug) return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = product.name.toLowerCase().includes(q);
          const matchUrdu = product.name_urdu?.toLowerCase().includes(q);
          const matchDesc = product.description?.toLowerCase().includes(q);
          return matchName || matchUrdu || matchDesc;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        // Default: featured first
        if (a.is_featured && !b.is_featured) return -1;
        if (!a.is_featured && b.is_featured) return 1;
        return 0;
      });
  }, [products, categories, selectedCategory, searchQuery, sortBy, showInStockOnly]);

  const activeCategoryObj = categories.find((c) => c.slug === selectedCategory);

  // 12 Products Per Page Pagination (3 rows of 4 on desktop, 4 rows of 3 on tablet, 6 rows of 2 on mobile)
  const ITEMS_PER_PAGE = 12;
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Reset page to 1 whenever filters or search query change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery, sortBy, showInStockOnly]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = useMemo(() => {
    return filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredProducts, startIndex]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 160, behavior: 'smooth' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-brand-900 to-brand-800 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-xl space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 bg-brand-800/80 px-2.5 py-0.5 rounded-full border border-brand-700">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Daily Mandi Fresh Produce</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            {selectedCategory === 'all' ? 'All Farm Fresh Vegetables' : activeCategoryObj?.name || 'Vegetables'}
          </h1>
          <p className="text-xs sm:text-sm text-brand-200">
            {selectedCategory === 'all'
              ? 'Hand-inspected, cleaned, and sorted fresh vegetables at wholesale Karachi mandi rates.'
              : activeCategoryObj?.description || 'Daily harvested vegetables delivered directly to your doorstep in Karachi.'}
          </p>
        </div>
        <Leaf className="absolute -right-6 -bottom-6 w-36 h-36 text-brand-700/30 pointer-events-none" />
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-gray-100 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search vegetables (e.g., Aloo, Tamatar, Palak)..."
              className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm bg-gray-50 rounded-xl border border-gray-200 focus:outline-hidden focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-48">
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                aria-label="Sort vegetables by"
                className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-3 pr-8 text-xs sm:text-sm font-semibold text-gray-700 focus:outline-hidden focus:border-brand-500"
              >
                <option value="featured">Featured / Best Sellers</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
              </select>
              <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Mobile Filter Toggle Button */}
            <button
              type="button"
              onClick={() => setShowMobileFilterModal(true)}
              className="sm:hidden flex items-center justify-center p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-100"
              aria-label="Filter products"
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Category Horizontal Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Vegetables ({products.length})
          </button>
          {categories.map((cat) => {
            const count = products.filter((p) => p.category_id === cat.id).length;
            const isSelected = selectedCategory === cat.slug;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{cat.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-brand-700 text-white' : 'bg-gray-200 text-gray-600'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Product Grid Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-gray-600 px-1">
        <div>
          Showing{' '}
          <span className="font-black text-brand-900">
            {filteredProducts.length > 0 ? startIndex + 1 : 0}–{Math.min(startIndex + ITEMS_PER_PAGE, filteredProducts.length)}
          </span>{' '}
          of <span className="font-black text-brand-900">{filteredProducts.length}</span> fresh vegetables
          {totalPages > 1 && (
            <span className="ml-2 text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md font-bold">
              Page {currentPage} of {totalPages}
            </span>
          )}
          {searchQuery && <span> for &ldquo;<span className="font-semibold">{searchQuery}</span>&rdquo;</span>}
        </div>
        <label className="hidden sm:flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showInStockOnly}
            onChange={(e) => setShowInStockOnly(e.target.checked)}
            className="rounded text-brand-600 focus:ring-brand-500 h-3.5 w-3.5"
          />
          <span className="text-xs font-medium text-gray-700">In Stock Only</span>
        </label>
      </div>

      {/* Vegetable Grid (12 Per Page) */}
      {paginatedProducts.length > 0 ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {paginatedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* 12-Item Numbered Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 pb-2 border-t border-gray-100">
              <div className="text-xs text-gray-500 font-medium order-2 sm:order-1">
                Showing Page <strong className="text-gray-900">{currentPage}</strong> of <strong className="text-gray-900">{totalPages}</strong> ({filteredProducts.length} total vegetables)
              </div>

              <div className="flex items-center gap-1.5 order-1 sm:order-2">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                  className="px-3 py-2 text-xs font-bold rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1 cursor-pointer shadow-2xs active:scale-95"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Previous</span>
                </button>

                {/* Numbered Page Buttons */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                    const isActive = pageNum === currentPage;
                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => handlePageChange(pageNum)}
                        className={`min-w-9 h-9 px-2.5 text-xs font-black rounded-xl transition-all cursor-pointer ${
                          isActive
                            ? 'bg-brand-600 text-white shadow-sm scale-105'
                            : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                  className="px-3 py-2 text-xs font-bold rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1 cursor-pointer shadow-2xs active:scale-95"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto text-2xl font-bold">
            🥦
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-gray-900 text-base">No vegetables found</h3>
            <p className="text-xs text-gray-500">
              We couldn&apos;t find any fresh vegetables matching your search or filters.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setShowInStockOnly(false);
            }}
            className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* Mobile Filter Modal */}
      {showMobileFilterModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:hidden">
          <div className="bg-white w-full rounded-t-3xl p-5 space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-black text-gray-900 text-base">Filter & Sort</h3>
              <button
                type="button"
                onClick={() => setShowMobileFilterModal(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-700 block">Sort By</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'featured', label: 'Featured' },
                  { id: 'price-asc', label: 'Price: Low-High' },
                  { id: 'price-desc', label: 'Price: High-Low' },
                  { id: 'name', label: 'Name A-Z' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSortBy(item.id as any)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      sortBy === item.id
                        ? 'border-brand-600 bg-brand-50 text-brand-700'
                        : 'border-gray-200 text-gray-700'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-gray-100">
              <label className="flex items-center gap-3 py-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showInStockOnly}
                  onChange={(e) => setShowInStockOnly(e.target.checked)}
                  className="rounded text-brand-600 focus:ring-brand-500 h-4 w-4"
                />
                <span className="text-xs font-medium text-gray-800">Show In Stock Vegetables Only</span>
              </label>
            </div>

            <button
              type="button"
              onClick={() => setShowMobileFilterModal(false)}
              className="w-full bg-brand-600 text-white font-bold py-3 rounded-xl text-xs shadow-md active:scale-98"
            >
              Apply Filters ({filteredProducts.length} Results)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-12 text-center text-gray-500 text-sm">
          Loading fresh vegetables catalog...
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}
