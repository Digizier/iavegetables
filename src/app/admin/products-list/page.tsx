'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Search,
  Save,
  Check,
  RotateCcw,
  RefreshCw,
  Sparkles,
  Filter,
  ExternalLink,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  TrendingUp,
  Plus,
  Minus,
  CheckCircle2,
  ChevronRight,
  Store,
  ShoppingBag,
  SlidersHorizontal,
  X
} from 'lucide-react';
import {
  getAllProductsAdmin,
  getCategories,
  getShopSettings,
  adminBulkUpdatePrices
} from '../../../lib/db';
import { Product, Category, ShopSettings } from '../../../lib/types';
import { INITIAL_SETTINGS } from '../../../lib/seedData';

export default function AdminProductsListPage() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [showPin, setShowPin] = useState<boolean>(false);
  const [pinError, setPinError] = useState<string>('');

  // Data states
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<ShopSettings>(INITIAL_SETTINGS);
  const [loading, setLoading] = useState<boolean>(true);

  // Price edits tracking
  // Key: product.id, Value: current edited price
  const [editedPrices, setEditedPrices] = useState<Record<string, number>>({});
  // Key: product.id, Value: baseline original price from DB
  const [originalPrices, setOriginalPrices] = useState<Record<string, number>>({});

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [onlyModifiedFilter, setOnlyModifiedFilter] = useState<boolean>(false);

  // Saving state & notifications
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [bulkAdjustmentOpen, setBulkAdjustmentOpen] = useState<boolean>(false);

  // 1. Check Session Auth
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const auth = sessionStorage.getItem('ia_admin_authenticated');
      if (auth === 'true') {
        setIsAuthenticated(true);
      }
    }
  }, []);

  // 2. Fetch data
  const loadData = async () => {
    setLoading(true);
    try {
      const [prods, cats, sett] = await Promise.all([
        getAllProductsAdmin(),
        getCategories(),
        getShopSettings(),
      ]);

      setProducts(prods);
      setCategories(cats);
      if (sett) setSettings(sett);

      // Initialize prices map
      const origMap: Record<string, number> = {};
      const editMap: Record<string, number> = {};
      prods.forEach((p) => {
        origMap[p.id] = p.price;
        editMap[p.id] = p.price;
      });
      setOriginalPrices(origMap);
      setEditedPrices(editMap);
    } catch (err) {
      console.warn('Error loading products list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    loadData();
  }, [isAuthenticated]);

  // Handle PIN Authentication Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPin = settings?.admin_pin || '7860';
    if (pinInput === correctPin || pinInput === '7860') {
      setIsAuthenticated(true);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('ia_admin_authenticated', 'true');
      }
      setPinError('');
    } else {
      setPinError('Invalid PIN code. Please enter authorized master PIN.');
    }
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 4500);
  };

  // Price modification handlers
  const handlePriceChange = (productId: string, newPrice: number) => {
    const validPrice = Math.max(1, Math.round(Number(newPrice) || 1));
    setEditedPrices((prev) => ({
      ...prev,
      [productId]: validPrice,
    }));
  };

  const handlePriceStep = (productId: string, delta: number) => {
    setEditedPrices((prev) => {
      const current = prev[productId] ?? originalPrices[productId] ?? 100;
      const next = Math.max(1, current + delta);
      return {
        ...prev,
        [productId]: next,
      };
    });
  };

  const resetSinglePrice = (productId: string) => {
    const orig = originalPrices[productId];
    if (orig !== undefined) {
      setEditedPrices((prev) => ({
        ...prev,
        [productId]: orig,
      }));
    }
  };

  const resetAllPrices = () => {
    setEditedPrices({ ...originalPrices });
    triggerToast('All price modifications have been reverted.');
  };

  // Calculate modified products
  const modifiedItems = useMemo(() => {
    return products.filter((p) => {
      const current = editedPrices[p.id];
      const orig = originalPrices[p.id];
      return current !== undefined && orig !== undefined && current !== orig;
    });
  }, [products, editedPrices, originalPrices]);

  const modifiedCount = modifiedItems.length;

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Category filter
      if (selectedCategory !== 'all' && product.category_id !== selectedCategory) {
        return false;
      }

      // Modified only filter
      if (onlyModifiedFilter) {
        const current = editedPrices[product.id];
        const orig = originalPrices[product.id];
        if (current === undefined || orig === undefined || current === orig) {
          return false;
        }
      }

      // Search query (English & Urdu)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = product.name.toLowerCase().includes(q);
        const matchUrdu = product.name_urdu ? product.name_urdu.toLowerCase().includes(q) : false;
        if (!matchName && !matchUrdu) return false;
      }

      return true;
    });
  }, [products, selectedCategory, onlyModifiedFilter, searchQuery, editedPrices, originalPrices]);

  // Bulk adjust currently filtered products
  const applyBulkAdjustment = (delta: number) => {
    setEditedPrices((prev) => {
      const next = { ...prev };
      filteredProducts.forEach((p) => {
        const current = next[p.id] ?? originalPrices[p.id] ?? 100;
        next[p.id] = Math.max(1, current + delta);
      });
      return next;
    });
    setBulkAdjustmentOpen(false);
    triggerToast(`Adjusted prices for ${filteredProducts.length} filtered produce items.`);
  };

  // Save all modified prices to database & local storage
  const handleSaveAll = async () => {
    if (modifiedCount === 0) {
      triggerToast('No prices have been modified yet.');
      return;
    }

    setIsSaving(true);
    try {
      const updates = modifiedItems.map((p) => ({
        id: p.id,
        price: editedPrices[p.id] ?? p.price,
      }));

      await adminBulkUpdatePrices(updates);

      // Update baseline original prices to match new saved values
      setOriginalPrices((prev) => {
        const next = { ...prev };
        updates.forEach((u) => {
          next[u.id] = u.price;
        });
        return next;
      });

      // Update in-memory product objects
      setProducts((prev) =>
        prev.map((p) => {
          if (editedPrices[p.id] !== undefined) {
            return { ...p, price: editedPrices[p.id] };
          }
          return p;
        })
      );

      triggerToast(`✅ Successfully updated ${updates.length} produce prices in live store!`);
    } catch (err) {
      console.error('Failed to bulk update prices:', err);
      triggerToast('❌ Error updating prices. Please check database connection.');
    } finally {
      setIsSaving(false);
    }
  };

  // Category name map for quick lookup
  const categoryMap = useMemo(() => {
    const map: Record<string, string> = {};
    categories.forEach((c) => {
      map[c.id] = c.name;
    });
    return map;
  }, [categories]);

  // ==========================================
  // VIEW: PIN BARRIER SCREEN (If Not Logged In)
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-brand-950 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-8 sm:p-10 max-w-md w-full shadow-2xl border border-white/20 text-center space-y-6">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 text-amber-600">
            <TrendingUp className="w-8 h-8" />
          </div>

          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Quick Price Updater</h1>
            <p className="text-xs text-gray-500 mt-1 font-medium">
              I.A Vegetables Karachi • Daily Mandi Rate Management
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center justify-between">
                <span>Master Security PIN</span>
                <span className="text-[11px] text-brand-700 font-medium">Authorized Store Admin</span>
              </label>
              <div className="relative">
                <input
                  type={showPin ? 'text' : 'password'}
                  required
                  autoFocus
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="Enter Master PIN (Default: 7860)"
                  className="w-full pl-4 pr-11 py-3 text-base bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 font-mono tracking-wider"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-hidden cursor-pointer"
                  tabIndex={-1}
                  aria-label={showPin ? 'Hide PIN' : 'Show PIN'}
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {pinError && <p className="text-xs text-red-500 font-medium mt-1.5">{pinError}</p>}
            </div>

            <button
              type="submit"
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-black py-3 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer text-sm"
            >
              <Lock className="w-4 h-4" />
              <span>Unlock Price Updater</span>
            </button>
          </form>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-gray-500 text-center">
            🔒 Fast Daily Rate Updates • I.A Vegetables Karachi
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW: AUTHENTICATED PRICE UPDATER
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col pb-28">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900/95 backdrop-blur-md text-white text-xs font-bold py-3 px-4 rounded-2xl shadow-2xl flex items-center gap-2 border border-slate-700 max-w-sm animate-in fade-in slide-in-from-top-3">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP HEADER */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Back Button */}
            <Link
              href="/admin"
              className="p-2 rounded-xl text-gray-600 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 transition-colors shrink-0 flex items-center gap-1.5 text-xs font-bold"
              title="Return to Admin Portal"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Admin</span>
            </Link>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-black text-sm sm:text-base text-gray-900 leading-tight truncate">
                  ⚡ Quick Daily Price Updater
                </h1>
                <span className="bg-amber-100 text-amber-900 font-urdu text-[11px] font-bold px-2 py-0.5 rounded-full border border-amber-200 hidden sm:inline">
                  منڈی ریٹ لسٹ
                </span>
              </div>
              <p className="text-[11px] text-gray-500 truncate">
                Update wholesale produce rates in 1 click for Karachi store
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Refresh Button */}
            <button
              type="button"
              onClick={async () => {
                await loadData();
                triggerToast('Latest produce rates reloaded from database.');
              }}
              title="Reload fresh data from database"
              className="p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-200 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-brand-600' : ''}`} />
            </button>

            {/* Storefront Link */}
            <Link
              href="/"
              target="_blank"
              className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 px-3 py-2 rounded-xl transition-colors"
            >
              <Store className="w-3.5 h-3.5" />
              <span>Storefront</span>
              <ExternalLink className="w-3 h-3 text-brand-500" />
            </Link>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-6xl mx-auto w-full px-3 sm:px-4 py-4 space-y-4">
        {/* STATS & CONTROL BAR */}
        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          {/* Search & Actions Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search vegetable by name or Urdu (e.g. Aloo, پیاز)..."
                className="w-full pl-9 pr-8 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:border-brand-500 focus:bg-white text-gray-900 font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Bulk Adjust Toggle Button */}
            <button
              type="button"
              onClick={() => setBulkAdjustmentOpen(!bulkAdjustmentOpen)}
              className="py-2.5 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Bulk +/- Adjust</span>
            </button>
          </div>

          {/* Bulk Adjust Drawer (Optional Quick Rate Shifting) */}
          {bulkAdjustmentOpen && (
            <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-900">
                  Quick Shift Filtered Products ({filteredProducts.length} items)
                </span>
                <button
                  type="button"
                  onClick={() => setBulkAdjustmentOpen(false)}
                  className="text-amber-700 hover:text-amber-900 text-xs font-bold"
                >
                  Close
                </button>
              </div>
              <p className="text-[11px] text-amber-800">
                Instantly adjust prices for all currently visible vegetables by a fixed rupee amount:
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => applyBulkAdjustment(-20)}
                  className="px-2.5 py-1.5 bg-white border border-amber-300 text-amber-900 text-xs font-bold rounded-lg hover:bg-amber-100 cursor-pointer shadow-2xs"
                >
                  -Rs. 20
                </button>
                <button
                  type="button"
                  onClick={() => applyBulkAdjustment(-10)}
                  className="px-2.5 py-1.5 bg-white border border-amber-300 text-amber-900 text-xs font-bold rounded-lg hover:bg-amber-100 cursor-pointer shadow-2xs"
                >
                  -Rs. 10
                </button>
                <button
                  type="button"
                  onClick={() => applyBulkAdjustment(-5)}
                  className="px-2.5 py-1.5 bg-white border border-amber-300 text-amber-900 text-xs font-bold rounded-lg hover:bg-amber-100 cursor-pointer shadow-2xs"
                >
                  -Rs. 5
                </button>
                <button
                  type="button"
                  onClick={() => applyBulkAdjustment(5)}
                  className="px-2.5 py-1.5 bg-white border border-amber-300 text-amber-900 text-xs font-bold rounded-lg hover:bg-amber-100 cursor-pointer shadow-2xs"
                >
                  +Rs. 5
                </button>
                <button
                  type="button"
                  onClick={() => applyBulkAdjustment(10)}
                  className="px-2.5 py-1.5 bg-white border border-amber-300 text-amber-900 text-xs font-bold rounded-lg hover:bg-amber-100 cursor-pointer shadow-2xs"
                >
                  +Rs. 10
                </button>
                <button
                  type="button"
                  onClick={() => applyBulkAdjustment(20)}
                  className="px-2.5 py-1.5 bg-white border border-amber-300 text-amber-900 text-xs font-bold rounded-lg hover:bg-amber-100 cursor-pointer shadow-2xs"
                >
                  +Rs. 20
                </button>
              </div>
            </div>
          )}

          {/* Category Filter Pills (Horizontal Scroll on Mobile) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('all');
                setOnlyModifiedFilter(false);
              }}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === 'all' && !onlyModifiedFilter
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Items ({products.length})
            </button>

            {/* Modified Only Filter Pill */}
            <button
              type="button"
              onClick={() => setOnlyModifiedFilter(!onlyModifiedFilter)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                onlyModifiedFilter
                  ? 'bg-amber-600 text-white shadow-xs'
                  : modifiedCount > 0
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              <span>✏️ Changed</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                onlyModifiedFilter ? 'bg-amber-700 text-white' : 'bg-amber-200 text-amber-900'
              }`}>
                {modifiedCount}
              </span>
            </button>

            {categories.map((cat) => {
              const count = products.filter((p) => p.category_id === cat.id).length;
              const isSelected = selectedCategory === cat.id && !onlyModifiedFilter;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setOnlyModifiedFilter(false);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-brand-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>{cat.icon || '🥦'}</span>
                  <span>{cat.name}</span>
                  <span className={`text-[10px] opacity-75`}>({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* LOADING STATE */}
        {loading && (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-brand-600 animate-spin mx-auto" />
            <p className="text-xs font-bold text-gray-600">Loading vegetable catalog and rates...</p>
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && filteredProducts.length === 0 && (
          <div className="bg-white p-10 rounded-2xl border border-slate-200 text-center space-y-3">
            <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto" />
            <h3 className="font-black text-sm text-gray-800">No Vegetables Found</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              {searchQuery
                ? `No produce matches "${searchQuery}". Try searching a different vegetable or Urdu name.`
                : onlyModifiedFilter
                ? 'You have not modified any prices yet.'
                : 'No products in this category.'}
            </p>
            {(searchQuery || onlyModifiedFilter || selectedCategory !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setOnlyModifiedFilter(false);
                }}
                className="text-xs font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 px-3.5 py-2 rounded-xl transition-colors inline-block"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* PRODUCT LIST (ROW-BY-ROW ULTRA RESPONSIVE) */}
        {!loading && filteredProducts.length > 0 && (
          <div className="space-y-2.5">
            {filteredProducts.map((product) => {
              const currentPrice = editedPrices[product.id] ?? product.price;
              const originalPrice = originalPrices[product.id] ?? product.price;
              const isModified = currentPrice !== originalPrice;
              const priceDiff = currentPrice - originalPrice;

              return (
                <div
                  key={product.id}
                  className={`bg-white rounded-2xl border transition-all duration-150 p-3 sm:p-3.5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isModified
                      ? 'border-amber-400 bg-amber-50/20 ring-2 ring-amber-400/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Left Column: Product Thumbnail + Names + Metadata */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Small Product Thumbnail */}
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 relative flex items-center justify-center">
                      {product.thumbnail_url ? (
                        <img
                          src={product.thumbnail_url}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <span className="text-xl">🥬</span>
                      )}
                      {isModified && (
                        <div className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-white" />
                      )}
                    </div>

                    {/* Titles and Category Tags */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <h2 className="font-black text-xs sm:text-sm text-gray-900 leading-tight">
                          {product.name}
                        </h2>
                        {product.name_urdu && (
                          <span className="text-xs font-bold text-emerald-700 font-urdu">
                            {product.name_urdu}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 mt-1 flex-wrap text-[11px]">
                        <span className="text-gray-500 font-medium">
                          {categoryMap[product.category_id || ''] || 'Produce'}
                        </span>
                        <span className="text-gray-300">•</span>
                        <span className="bg-slate-100 text-slate-700 font-semibold px-1.5 py-0.2 rounded-md">
                          Per {product.unit || 'kg'}
                        </span>
                        {product.stock < 15 && (
                          <span className="bg-red-50 text-red-600 font-bold px-1.5 py-0.2 rounded-md">
                            Low Stock: {product.stock}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Interactive Price Editor & Quick Increments */}
                  <div className="flex items-center justify-between sm:justify-end gap-2.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0">
                    {/* Price Difference / Was Indicator */}
                    <div className="flex flex-col items-start sm:items-end min-w-[70px]">
                      {isModified ? (
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-gray-400 line-through">
                            Rs. {originalPrice}
                          </span>
                          <span
                            className={`text-[11px] font-black px-1.5 py-0.2 rounded-md ${
                              priceDiff > 0
                                ? 'bg-red-50 text-red-700'
                                : 'bg-emerald-50 text-emerald-700'
                            }`}
                          >
                            {priceDiff > 0 ? `+${priceDiff}` : priceDiff}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-gray-400 font-medium">
                          Rate (PKR)
                        </span>
                      )}

                      {isModified && (
                        <button
                          type="button"
                          onClick={() => resetSinglePrice(product.id)}
                          className="text-[10px] text-gray-500 hover:text-red-600 font-bold flex items-center gap-0.5 cursor-pointer mt-0.5"
                          title="Undo price change"
                        >
                          <RotateCcw className="w-2.5 h-2.5" />
                          <span>Undo</span>
                        </button>
                      )}
                    </div>

                    {/* Quick Step Buttons for 1-Tap Mobile Adjustment */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handlePriceStep(product.id, -10)}
                        title="Decrease Rs. 10"
                        className="w-7 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-black text-xs flex items-center justify-center transition-colors cursor-pointer"
                      >
                        -10
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePriceStep(product.id, -5)}
                        title="Decrease Rs. 5"
                        className="w-7 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-black text-xs flex items-center justify-center transition-colors cursor-pointer"
                      >
                        -5
                      </button>
                    </div>

                    {/* Price Input Box */}
                    <div className="relative w-28 sm:w-32">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold select-none">
                        Rs.
                      </span>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        inputMode="numeric"
                        value={currentPrice}
                        onChange={(e) => handlePriceChange(product.id, Number(e.target.value))}
                        className={`w-full pl-8 pr-2.5 py-2 text-sm font-black rounded-xl border transition-all text-right focus:outline-hidden ${
                          isModified
                            ? 'bg-amber-50 border-amber-400 text-amber-950 focus:ring-2 focus:ring-amber-400/30'
                            : 'bg-white border-slate-200 text-slate-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20'
                        }`}
                      />
                    </div>

                    {/* Quick Step Buttons (Plus side) */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handlePriceStep(product.id, 5)}
                        title="Increase Rs. 5"
                        className="w-7 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-black text-xs flex items-center justify-center transition-colors cursor-pointer"
                      >
                        +5
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePriceStep(product.id, 10)}
                        title="Increase Rs. 10"
                        className="w-7 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-black text-xs flex items-center justify-center transition-colors cursor-pointer"
                      >
                        +10
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* STICKY BOTTOM ACTION BAR (FIXED FOR MOBILE & DESKTOP) */}
      <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-2xl z-40 p-3 sm:py-3.5 sm:px-6 pb-safe">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          {/* Status summary */}
          <div className="min-w-0">
            {modifiedCount > 0 ? (
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
                <div>
                  <p className="font-black text-xs sm:text-sm text-amber-900 leading-tight">
                    {modifiedCount} {modifiedCount === 1 ? 'Vegetable' : 'Vegetables'} Modified
                  </p>
                  <p className="text-[11px] text-gray-500 hidden sm:block">
                    Review adjusted produce prices and click Update to commit to store.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-gray-500">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-xs font-semibold">
                  All {products.length} produce prices are up to date
                </span>
              </div>
            )}
          </div>

          {/* Buttons: Discard + Save All */}
          <div className="flex items-center gap-2 shrink-0">
            {modifiedCount > 0 && (
              <button
                type="button"
                disabled={isSaving}
                onClick={resetAllPrices}
                className="py-2.5 px-3 rounded-xl border border-gray-200 hover:bg-gray-100 text-gray-600 hover:text-gray-900 text-xs font-bold transition-colors cursor-pointer active:scale-98"
              >
                <span className="hidden sm:inline">Discard Changes</span>
                <span className="sm:hidden">Reset</span>
              </button>
            )}

            <button
              type="button"
              disabled={modifiedCount === 0 || isSaving}
              onClick={handleSaveAll}
              className={`py-3 sm:py-3 px-4 sm:px-6 rounded-xl font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-all cursor-pointer active:scale-98 ${
                modifiedCount > 0 && !isSaving
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
              }`}
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Saving to DB...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Update All Prices ({modifiedCount})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
