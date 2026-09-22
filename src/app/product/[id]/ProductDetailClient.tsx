'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Plus, 
  Minus, 
  Check, 
  Sparkles, 
  ShoppingBag, 
  CreditCard, 
  MessageCircle, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Scale, 
  Share2,
  CheckCircle2,
  ChevronRight,
  Info
} from 'lucide-react';
import { Product, Category, CartItem, ShopSettings } from '../../../lib/types';
import { getProducts, getCategories, getShopSettings, getLocalCart, saveLocalCart, getLocalProducts, getLocalCategories, getLocalSettings, subscribeToStoreRealtime } from '../../../lib/db';
import { INITIAL_CATEGORIES, INITIAL_SETTINGS } from '../../../lib/seedData';
import ProductCard from '../../../components/ProductCard';

interface ProductDetailClientProps {
  id: string;
}

export default function ProductDetailClient({ id }: ProductDetailClientProps) {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>(() => getLocalProducts());
  const [categories, setCategories] = useState<Category[]>(() => getLocalCategories());
  const [settings, setSettings] = useState<ShopSettings>(() => getLocalSettings());
  const [loading, setLoading] = useState<boolean>(() => !getLocalProducts().some(p => p.id === id || p.slug === id));

  // Active product
  const product = useMemo(() => {
    return products.find((p) => p.id === id || p.slug === id);
  }, [products, id]);

  // Weight mode: 'preset' or 'custom'
  const [weightMode, setWeightMode] = useState<'preset' | 'custom'>('preset');
  const [selectedWeight, setSelectedWeight] = useState<string>('1');
  const [customWeight, setCustomWeight] = useState<string>('1.5');
  const [quantity, setQuantity] = useState<number>(1);
  const [addedAnimation, setAddedAnimation] = useState<boolean>(false);
  const [copiedToast, setCopiedToast] = useState<boolean>(false);

  const productImages = useMemo(() => {
    if (!product) return [];
    if (product.images && product.images.length > 0) return product.images;
    return product.thumbnail_url ? [product.thumbnail_url] : [];
  }, [product]);

  const [selectedImage, setSelectedImage] = useState<string>(product?.thumbnail_url || '');

  useEffect(() => {
    if (product) {
      setSelectedImage(product.thumbnail_url || productImages[0] || '');
    }
  }, [product, productImages]);

  useEffect(() => {
    // Instant re-read from local storage upon mount
    const localProds = getLocalProducts();
    setCategories(getLocalCategories());
    setSettings(getLocalSettings());
    if (localProds.length > 0) {
      setProducts(localProds);
      if (localProds.some(p => p.id === id || p.slug === id)) {
        setLoading(false);
      }
    }

    Promise.all([getProducts(), getCategories(), getShopSettings()]).then(([prods, cats, sett]) => {
      if (prods && prods.length > 0) setProducts(prods);
      if (cats && cats.length > 0) setCategories(cats);
      if (sett) setSettings(sett);
      setLoading(false);
    });

    const handleProdUpdate = (e: any) => {
      if (Array.isArray(e.detail) && e.detail.length > 0) {
        setProducts(e.detail);
        setLoading(false);
      }
    };
    const handleSettUpdate = (e: any) => {
      if (e.detail) setSettings(e.detail);
    };

    window.addEventListener('ia_products_updated', handleProdUpdate);
    window.addEventListener('ia_settings_updated', handleSettUpdate);

    const unsubscribe = subscribeToStoreRealtime({
      onProductsUpdate: (fresh) => {
        if (fresh && fresh.length > 0) {
          setProducts(fresh);
          setLoading(false);
        }
      },
    });

    return () => {
      window.removeEventListener('ia_products_updated', handleProdUpdate);
      window.removeEventListener('ia_settings_updated', handleSettUpdate);
      if (unsubscribe) unsubscribe();
    };
  }, [id]);

  // Update default selected weight when product loads
  useEffect(() => {
    if (product && product.weight_options && product.weight_options.length > 0) {
      setSelectedWeight(product.weight_options[0]);
    }
  }, [product]);

  // Effective weight calculation
  const effectiveWeightNum = useMemo(() => {
    if (weightMode === 'custom') {
      const parsed = parseFloat(customWeight);
      return isNaN(parsed) || parsed <= 0 ? 1 : parsed;
    }
    const parsed = parseFloat(selectedWeight);
    return isNaN(parsed) || parsed <= 0 ? 1 : parsed;
  }, [weightMode, selectedWeight, customWeight]);

  const effectiveWeightLabel = useMemo(() => {
    if (!product) return '';
    if (weightMode === 'custom') {
      return `${effectiveWeightNum} ${product.unit}`;
    }
    return `${selectedWeight} ${product.unit}`;
  }, [weightMode, effectiveWeightNum, selectedWeight, product?.unit]);

  // Price calculation
  const unitPrice = product ? Math.round(product.price * effectiveWeightNum) : 0;
  const totalPrice = unitPrice * quantity;

  // Category of current product
  const category = categories.find((c) => c.id === product?.category_id || c.slug === product?.category_id);

  // 4 Related Vegetables: Same category first, then others
  const relatedProducts = useMemo(() => {
    if (!product) return [];
    const sameCat = products.filter(
      (p) => p.id !== product.id && (p.category_id === product.category_id || (category && p.category_id === category.id)) && p.is_active
    );
    const otherCat = products.filter(
      (p) => p.id !== product.id && p.category_id !== product.category_id && (!category || p.category_id !== category.id) && p.is_active
    );

    const combined = [...sameCat, ...otherCat];
    return combined.slice(0, 4);
  }, [products, product, category]);

  // Add to Cart
  const handleAddToCart = () => {
    if (!product) return;
    const items = getLocalCart();
    const weightKey = weightMode === 'custom' ? `${effectiveWeightNum}` : selectedWeight;
    const existingIndex = items.findIndex(
      (i) => i.product.id === product.id && i.selectedWeight === weightKey
    );

    let updated: CartItem[];
    if (existingIndex > -1) {
      updated = [...items];
      updated[existingIndex].quantity += quantity;
    } else {
      updated = [
        ...items,
        {
          product,
          selectedWeight: weightKey,
          unitPrice,
          quantity,
        },
      ];
    }

    saveLocalCart(updated);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1500);

    // Trigger cart drawer open event if listener exists
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ia_open_cart'));
    }
  };

  // Buy Now: Add and route to checkout
  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/checkout');
  };

  // WhatsApp Order Link
  const cleanPhone = settings.whatsapp_number?.replace(/[^0-9]/g, '') || '923413989260';
  const whatsappMessage = product ? encodeURIComponent(
    `Assalam o Alaikum, I want to order fresh ${product.name} (${product.name_urdu || ''}):\n` +
    `• Weight: ${effectiveWeightLabel}\n` +
    `• Quantity: ${quantity} pack(s)\n` +
    `• Total: Rs. ${totalPrice}\n` +
    `Please confirm Karachi delivery timing.`
  ) : '';
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${whatsappMessage}`;

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2000);
    }
  };

  if (loading && !product) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 space-y-10">
        <div className="h-4 bg-gray-200 rounded w-48 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start bg-white rounded-3xl p-5 sm:p-8 border border-gray-100 shadow-xs animate-pulse">
          <div className="lg:col-span-5 space-y-4">
            <div className="aspect-square w-full rounded-2xl bg-gray-200" />
            <div className="flex gap-2">
              <div className="w-16 h-16 rounded-xl bg-gray-200" />
              <div className="w-16 h-16 rounded-xl bg-gray-200" />
            </div>
          </div>
          <div className="lg:col-span-7 space-y-5">
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-5 bg-gray-200 rounded w-1/3" />
            <div className="h-10 bg-gray-200 rounded w-1/2" />
            <div className="h-24 bg-gray-100 rounded-2xl" />
            <div className="h-12 bg-gray-200 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="text-4xl">🥬</div>
        <h2 className="text-xl font-bold text-gray-900">Vegetable Not Found</h2>
        <p className="text-sm text-gray-500">The requested fresh vegetable could not be found or has been updated.</p>
        <Link
          href="/shop"
          className="inline-block bg-brand-600 text-white font-bold text-xs px-6 py-3 rounded-full hover:bg-brand-700 transition-colors"
        >
          Browse All Fresh Produce
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 space-y-10">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-gray-500 overflow-x-auto no-scrollbar">
        <Link href="/" className="hover:text-brand-700 whitespace-nowrap">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
        <Link href="/shop" className="hover:text-brand-700 whitespace-nowrap">Vegetables</Link>
        {category && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <Link href={`/shop?cat=${category.slug}`} className="hover:text-brand-700 whitespace-nowrap">
              {category.name}
            </Link>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
        <span className="font-bold text-gray-900 truncate">{product.name}</span>
      </nav>

      {/* Main Product Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start bg-white rounded-3xl p-5 sm:p-8 border border-gray-100 shadow-xs">
        {/* Left Column: Product Image Gallery (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-50 border border-gray-100 shadow-xs group">
            <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start">
              {product.is_featured && (
                <span className="bg-amber-500 text-white text-xs font-black px-3 py-1 rounded-full shadow-md flex items-center gap-1.5">
                  <span>⭐ Featured Produce</span>
                </span>
              )}
              {product.badge && (
                <span className="bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{product.badge}</span>
                </span>
              )}
            </div>

            <img
              src={selectedImage || product.thumbnail_url}
              alt={product.name}
              className="w-full h-full object-cover object-center transition-all duration-300"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80';
              }}
            />
          </div>

          {/* Multiple Gallery Thumbnails */}
          {productImages.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {productImages.map((imgUrl, i) => {
                const isSelected = (selectedImage || product.thumbnail_url) === imgUrl;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedImage(imgUrl)}
                    className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                      isSelected
                        ? 'border-brand-600 ring-2 ring-brand-400/50 scale-105'
                        : 'border-gray-200 opacity-70 hover:opacity-100 hover:border-gray-300'
                    }`}
                  >
                    <img src={imgUrl} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                );
              })}
            </div>
          )}

          {/* Quick Assurance Badges */}
          <div className="grid grid-cols-3 gap-2 text-center text-[11px] text-gray-600">
            <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
              <span className="block text-emerald-600 font-black">100% Fresh</span>
              <span>Daily Mandi</span>
            </div>
            <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
              <span className="block text-brand-700 font-black">Cleaned</span>
              <span>Hand-Inspected</span>
            </div>
            <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
              <span className="block text-amber-700 font-black">Same Day</span>
              <span>Karachi Fast</span>
            </div>
          </div>
        </div>

        {/* Right Column: Details & Interactive Purchasing (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Header & Urdu Title */}
          <div className="space-y-1.5 pb-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-brand-700 bg-brand-50 px-3 py-0.5 rounded-full">
                {category?.name || 'Fresh Produce'}
              </span>
              <button
                type="button"
                onClick={handleShare}
                className="text-xs font-semibold text-gray-500 hover:text-gray-800 flex items-center gap-1.5 transition-colors"
                title="Share link"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{copiedToast ? 'Link Copied!' : 'Share'}</span>
              </button>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              {product.name}
            </h1>

            {product.name_urdu && (
              <div className="font-urdu text-xl font-bold text-emerald-800 pt-0.5" dir="rtl">
                {product.name_urdu}
              </div>
            )}
          </div>

          {/* Dynamic Price Display */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 flex items-baseline justify-between">
            <div>
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Calculated Price</div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-3xl font-black text-brand-800">
                  Rs. {totalPrice}
                </span>
                <span className="text-xs text-gray-500 font-medium">
                  ({effectiveWeightLabel} × {quantity})
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-gray-500 block">Base Mandi Rate</span>
              <span className="text-xs font-bold text-gray-800">
                Rs. {product.price} / {product.unit}
              </span>
            </div>
          </div>

          {/* User Self-Select Weight System (Preset Chips OR Custom kg) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-gray-900 flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-brand-600" />
                <span>Select Packaging Weight:</span>
              </label>

              {/* Toggle between Presets & Custom kg */}
              <div className="flex items-center bg-gray-100 p-0.5 rounded-xl text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setWeightMode('preset')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    weightMode === 'preset' ? 'bg-white text-brand-700 shadow-2xs' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Quick Chips
                </button>
                <button
                  type="button"
                  onClick={() => setWeightMode('custom')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    weightMode === 'custom' ? 'bg-white text-brand-700 shadow-2xs' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Custom Amount
                </button>
              </div>
            </div>

            {/* PRESET CHIPS MODE */}
            {weightMode === 'preset' ? (
              <div className="flex flex-wrap gap-2">
                {(product.weight_options && product.weight_options.length > 0 ? product.weight_options : ['0.5', '1', '2', '5']).map((w) => {
                  const isSelected = selectedWeight === w;
                  const chipPrice = Math.round(product.price * (parseFloat(w) || 1));
                  return (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setSelectedWeight(w)}
                      className={`py-2.5 px-4 rounded-xl border text-xs font-bold transition-all flex flex-col items-center ${
                        isSelected
                          ? 'border-brand-600 bg-brand-50 text-brand-800 ring-2 ring-brand-500/20 shadow-xs'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-sm font-black">{w} {product.unit}</span>
                      <span className="text-[10px] font-medium text-gray-500 mt-0.5">Rs. {chipPrice}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              /* CUSTOM WEIGHT MODE: User self-decides how much they want to buy */
              <div className="p-4 bg-brand-50/60 rounded-2xl border border-brand-200/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-brand-900">Enter Exact Desired Quantity:</span>
                  <span className="text-brand-700 font-semibold text-[11px]">
                    e.g. 0.75, 1.5, 3, 5, 10
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="100"
                      value={customWeight}
                      onChange={(e) => setCustomWeight(e.target.value)}
                      placeholder="e.g. 1.5"
                      className="w-full py-2.5 px-4 text-base font-bold bg-white border border-brand-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-brand-500/30 font-mono"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black text-gray-500 uppercase">
                      {product.unit}
                    </span>
                  </div>

                  <div className="text-xs text-gray-700 font-bold whitespace-nowrap bg-white px-3 py-2.5 rounded-xl border border-brand-200">
                    = Rs. {unitPrice}
                  </div>
                </div>
                <p className="text-[11px] text-brand-800">
                  💡 You are not limited by pre-set weights! Enter any custom kilogram weight you need for your family or cooking recipe.
                </p>
              </div>
            )}
          </div>

          {/* Quantity Stepper */}
          <div className="flex items-center gap-4 pt-1">
            <label className="text-xs font-black text-gray-900">Pack Quantity:</label>
            <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50 overflow-hidden">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-9 h-9 flex items-center justify-center hover:bg-gray-200 text-gray-700 transition-colors"
                aria-label="Decrease packs"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-12 text-center text-xs font-black text-gray-900 font-mono">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="w-9 h-9 flex items-center justify-center hover:bg-gray-200 text-gray-700 transition-colors"
                aria-label="Increase packs"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <span className="text-xs text-gray-500 font-medium">
              Total Weight: {(effectiveWeightNum * quantity).toFixed(1)} {product.unit}
            </span>
          </div>

          {/* Action Buttons: Add to Basket & Buy Now */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={handleAddToCart}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-black py-3.5 px-6 rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer text-sm"
            >
              {addedAnimation ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Added to Basket!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Basket (Rs. {totalPrice})</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleBuyNow}
              className="w-full bg-amber-500 hover:bg-amber-600 text-brand-950 font-black py-3.5 px-6 rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer text-sm"
            >
              <CreditCard className="w-4 h-4" />
              <span>Buy Now (Direct Checkout)</span>
            </button>
          </div>

          {/* WhatsApp Direct Order Button */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-2xl shadow-xs transition-all flex items-center justify-center gap-2 text-xs active:scale-98"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Order via WhatsApp Direct (+92 341 3989260)</span>
          </a>

          {/* Description & Details */}
          {product.description && (
            <div className="pt-4 border-t border-gray-100 space-y-1.5 text-xs text-gray-600">
              <h3 className="font-bold text-gray-900">About this vegetable:</h3>
              <p className="leading-relaxed">{product.description}</p>
            </div>
          )}

          {/* Store Guarantee Box */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-gray-600 space-y-2">
            <div className="flex items-center gap-2 text-brand-800 font-bold">
              <ShieldCheck className="w-4 h-4 text-brand-600" />
              <span>I.A Vegetables Supplier Guarantee (Since 1990)</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Wholesale mandi sourced fresh daily. Inspect before payment upon delivery anywhere in Karachi. If you are not satisfied with produce quality, hand it back to the rider at zero charge.
            </p>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4 RELATED FRESH VEGETABLES: Same category first, then others */}
      {/* ============================================================ */}
      <section className="space-y-4 pt-6 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-gray-900">Similar Fresh Produce</h2>
            <p className="text-xs text-gray-500">More farm-fresh vegetables hand-picked for your kitchen</p>
          </div>

          <Link
            href="/shop"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            <span>View All Vegetables</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {relatedProducts.map((relProd) => (
            <ProductCard key={relProd.id} product={relProd} />
          ))}
        </div>
      </section>
    </div>
  );
}
