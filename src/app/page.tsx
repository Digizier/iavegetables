'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, Truck, ShieldCheck, Phone, CheckCircle2, ChevronRight, MessageCircle } from 'lucide-react';
import CategoryScroller from '../components/CategoryScroller';
import ProductCard from '../components/ProductCard';
import ShopShowcase from '../components/ShopShowcase';
import LocationSection from '../components/LocationSection';
import SocialShowcase from '../components/SocialShowcase';
import FaqSection from '../components/FaqSection';
import { 
  getCategories, 
  getProducts, 
  getShopSettings, 
  getHeroBanner, 
  getLocalCategories, 
  getLocalProducts, 
  getLocalSettings, 
  getLocalHeroBanner,
  subscribeToStoreRealtime
} from '../lib/db';
import { Category, Product, ShopSettings, HeroBanner } from '../lib/types';
import { INITIAL_CATEGORIES, INITIAL_SETTINGS, INITIAL_HERO } from '../lib/seedData';

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>(() => getLocalCategories());
  const [products, setProducts] = useState<Product[]>(() => getLocalProducts());
  const [settings, setSettings] = useState<ShopSettings>(() => getLocalSettings());
  const [hero, setHero] = useState<HeroBanner>(() => getLocalHeroBanner());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(() => getLocalProducts().length === 0);

  useEffect(() => {
    // Instant re-read from local storage upon mount
    const localProds = getLocalProducts();
    setCategories(getLocalCategories());
    if (localProds.length > 0) {
      setProducts(localProds);
      setLoading(false);
    }
    setSettings(getLocalSettings());
    setHero(getLocalHeroBanner());

    // Background asynchronous revalidation with database
    Promise.all([
      getCategories(),
      getProducts(),
      getShopSettings(),
      getHeroBanner(),
    ]).then(([catData, prodData, settData, heroData]) => {
      if (catData && catData.length > 0) setCategories(catData);
      if (prodData && prodData.length > 0) setProducts(prodData);
      if (settData) setSettings(settData);
      if (heroData) setHero(heroData);
      setLoading(false);
    });

    const handleCatUpdate = (e: any) => {
      if (Array.isArray(e.detail) && e.detail.length > 0) setCategories(e.detail);
    };
    const handleProdUpdate = (e: any) => {
      if (Array.isArray(e.detail) && e.detail.length > 0) {
        setProducts(e.detail);
        setLoading(false);
      }
    };
    const handleSettUpdate = (e: any) => {
      if (e.detail) setSettings(e.detail);
    };
    const handleHeroUpdate = (e: any) => {
      if (e.detail) setHero(e.detail);
    };

    window.addEventListener('ia_categories_updated', handleCatUpdate);
    window.addEventListener('ia_products_updated', handleProdUpdate);
    window.addEventListener('ia_settings_updated', handleSettUpdate);
    window.addEventListener('ia_hero_updated', handleHeroUpdate);

    // Real-time synchronization across devices (mobile, desktop, new profiles)
    const unsubscribe = subscribeToStoreRealtime({
      onProductsUpdate: (fresh) => {
        if (fresh && fresh.length > 0) {
          setProducts(fresh);
          setLoading(false);
        }
      },
      onCategoriesUpdate: (fresh) => {
        if (fresh && fresh.length > 0) setCategories(fresh);
      },
      onSettingsUpdate: (fresh) => {
        if (fresh) setSettings(fresh);
      },
    });

    return () => {
      window.removeEventListener('ia_categories_updated', handleCatUpdate);
      window.removeEventListener('ia_products_updated', handleProdUpdate);
      window.removeEventListener('ia_settings_updated', handleSettUpdate);
      window.removeEventListener('ia_hero_updated', handleHeroUpdate);
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const featuredProducts = useMemo(() => products.filter((p) => p.is_featured && p.is_active), [products]);
  const topFeaturedProducts = useMemo(() => featuredProducts.slice(0, 4), [featuredProducts]);
  const topFeaturedIds = useMemo(() => new Set(topFeaturedProducts.map((p) => p.id)), [topFeaturedProducts]);

  // Filter products by selected category
  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'all') {
      // Exclude the 4 featured products already highlighted in the top section
      // so customers see unique items in "Today's Fresh Harvest" without duplicate repetition
      return products.filter((p) => p.is_active && !topFeaturedIds.has(p.id));
    }
    return products.filter((p) => {
      if (!p.is_active) return false;
      const cat = categories.find((c) => c.slug === selectedCategory);
      return cat ? (p.category_id === cat.id || p.category_id === cat.slug) : true;
    });
  }, [products, selectedCategory, categories, topFeaturedIds]);

  // Limit homepage to 12 latest/active items (3 clean rows of 4 on desktop, 6 rows of 2 on mobile)
  const displayedProducts = filteredProducts.slice(0, 12);
  const activeCategoryObj = categories.find((c) => c.slug === selectedCategory);

  const cleanPhone = settings.whatsapp_number?.replace(/[^0-9]/g, '') || '923413989260';

  return (
    <div className="space-y-6 sm:space-y-10">
      {/* Top Announcement Ticker */}
      <div className="bg-amber-500 text-brand-950 text-xs font-black py-2 px-4 text-center shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
          <span>{hero.ticker_announcement || '🚚 Free Karachi Delivery on orders above Rs. 1,500! Fresh morning harvest arrived.'}</span>
        </div>
      </div>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-brand-950 via-brand-900 to-brand-800 text-white p-6 sm:p-12 shadow-xl">
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 bg-brand-800/80 border border-brand-700/70 px-3.5 py-1 rounded-full text-xs font-bold text-amber-300 backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{hero.badge_text || '100% Fresh Daily Harvest • Serving Since 1990'}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
              {hero.headline || 'Fresh Farm Vegetables Delivered Across Karachi'}
            </h1>

            <p className="text-xs sm:text-sm text-brand-200 leading-relaxed">
              {hero.subheadline || 'Direct from the mandi to your kitchen. Hand-picked, sorted, and delivered fresh daily to SITE Town, Clifton, Gulshan, Malir, and all Karachi areas.'}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/shop"
                className="bg-brand-500 hover:bg-brand-400 text-brand-950 font-black text-xs sm:text-sm px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2 active:scale-95"
              >
                <span>Shop Fresh Produce</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <a
                href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent('Assalam o Alaikum I.A Vegetables, I want to place an order.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-full backdrop-blur-xs transition-all flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>Quick WhatsApp Order</span>
              </a>
            </div>

            {/* Micro Stats */}
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-brand-800/80 text-[11px] sm:text-xs text-brand-300">
              <div>
                <strong className="block text-white font-black text-sm sm:text-base">30+ Years</strong>
                <span>Serving Karachi Since 1990</span>
              </div>
              <div>
                <strong className="block text-white font-black text-sm sm:text-base">Same-Day</strong>
                <span>Doorstep Delivery</span>
              </div>
              <div>
                <strong className="block text-white font-black text-sm sm:text-base">COD & Online</strong>
                <span>Cash, JazzCash, EasyPaisa</span>
              </div>
            </div>
          </div>

          {/* Decorative Produce Overlay Visuals */}
          <div className="absolute right-0 bottom-0 top-0 w-1/2 opacity-20 lg:opacity-35 pointer-events-none hidden sm:block">
            <img
              src="/images/logo.png"
              alt="I.A Vegetables Supplier Karachi - Fresh Produce Since 1990"
              className="w-full h-full object-contain object-right-bottom p-6"
            />
          </div>
        </div>
      </section>

      {/* Fresh Basket Style Horizontal Category Icon Scroller */}
      <CategoryScroller
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* Featured Produce Showcase Section (Shows live whenever any product is marked 'Feature on Front Page' in Admin) */}
      {selectedCategory === 'all' && featuredProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4">
          <div className="bg-gradient-to-r from-amber-500/10 via-emerald-50/60 to-brand-500/10 border border-amber-200/80 rounded-3xl p-4 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 bg-amber-500 text-white text-[10px] sm:text-xs font-black px-2.5 py-0.5 rounded-full shadow-xs mb-1.5">
                  <Sparkles className="w-3 h-3" />
                  <span>SPECIAL SELECTION • خاص انتخاب</span>
                </div>
                <h2 className="text-lg sm:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                  <span>Featured Daily Produce</span>
                  <span className="text-xs text-brand-700 font-bold font-urdu bg-brand-100/70 px-2 py-0.5 rounded-md">
                    خاص منتخب سبزیاں
                  </span>
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Hand-picked premium quality vegetables highlighted for today&apos;s Karachi orders.
                </p>
              </div>

              <Link
                href="/shop"
                className="text-xs text-brand-700 hover:text-brand-800 font-black flex items-center gap-1 hover:underline"
              >
                <span>View All ({featuredProducts.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
              {topFeaturedProducts.map((product) => (
                <ProductCard key={`featured-${product.id}`} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Main Vegetable Grid (Fresh Basket 2-Column on Mobile!) */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <span>{selectedCategory === 'all' ? 'Today’s Fresh Harvest' : activeCategoryObj?.name || 'Vegetables'}</span>
              {selectedCategory !== 'all' && activeCategoryObj?.name_urdu && (
                <span className="text-xs text-brand-700 font-bold bg-brand-50 px-2 py-0.5 rounded-md font-urdu">
                  {activeCategoryObj.name_urdu}
                </span>
              )}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Showing latest 12 fresh produce items at daily mandi wholesale &amp; retail prices.
            </p>
          </div>

          <Link
            href={selectedCategory === 'all' ? '/shop' : `/shop?cat=${selectedCategory}`}
            className="text-xs text-brand-600 hover:text-brand-700 font-bold flex items-center gap-1 hover:underline"
          >
            <span>View All ({selectedCategory === 'all' ? products.filter((p) => p.is_active).length : filteredProducts.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Skeleton loading grid while products are being fetched from database */}
        {loading && products.length === 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl p-2.5 sm:p-3.5 flex flex-col justify-between shadow-xs animate-pulse space-y-3">
                <div className="aspect-square w-full rounded-xl bg-gray-200" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
                <div className="h-8 bg-gray-200 rounded-full w-full mt-2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
            {displayedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 p-6">
            <div className="text-3xl mb-2">🥬</div>
            <h3 className="font-bold text-gray-800 text-sm">No vegetables found in this category</h3>
            <p className="text-xs text-gray-500 mt-1 mb-4">Please select another category or view all vegetables.</p>
            <button
              onClick={() => setSelectedCategory('all')}
              className="bg-brand-600 text-white text-xs font-bold px-4 py-2 rounded-full cursor-pointer"
            >
              Show All Produce
            </button>
          </div>
        )}

        {/* Explore All Categories & Full Catalog Showcase Callout */}
        <div className="mt-8 bg-gradient-to-br from-brand-950 via-brand-900 to-emerald-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-brand-800/80">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-brand-800/80 border border-brand-700/80 px-3 py-1 rounded-full text-xs font-bold text-amber-300">
                <span>⚡ {products.length}+ Farm-Fresh Items Available</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight">
                Explore All {categories.length} Categories &amp; Fresh Vegetables
              </h3>
              <p className="text-xs sm:text-sm text-brand-200 max-w-xl">
                Browse our complete catalog with instant weight selection, 10-per-page fast browsing, wholesale mandi rates, and same-day delivery anywhere in Karachi.
              </p>
            </div>

            <Link
              href="/shop"
              className="shrink-0 bg-amber-400 hover:bg-amber-300 text-brand-950 font-black text-xs sm:text-sm px-6 py-3.5 rounded-full shadow-lg transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              <span>View All Vegetables in Shop ({products.length})</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Quick Category Chips */}
          <div className="mt-6 pt-6 border-t border-brand-800/80">
            <div className="text-xs font-bold text-brand-300 mb-3 text-center sm:text-left">
              Jump directly to vegetable category:
            </div>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/shop?cat=${cat.slug}`}
                  className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/15 px-3 py-1.5 rounded-xl text-xs font-bold text-white transition-all backdrop-blur-xs"
                >
                  <span>{cat.icon || '🥦'}</span>
                  <span>{cat.name}</span>
                  {cat.name_urdu && <span className="font-urdu text-[11px] text-amber-300">({cat.name_urdu})</span>}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Weekly Family Boxes Banner */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="bg-gradient-to-r from-emerald-800 via-brand-800 to-brand-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-2 text-center md:text-left">
            <span className="bg-amber-400 text-brand-950 text-[11px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Family Saver Deal
            </span>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight">
              Weekly Family Vegetable Crate (10 KG Complete Kitchen Pack)
            </h3>
            <p className="text-xs text-brand-200 max-w-xl">
              Includes 3kg Aloo, 2kg Piyaz, 2kg Tamatar, 1kg Palak, 1kg Kheera + FREE Podina, Dhaniya &amp; Hari Mirch! Delivered to your doorstep in Karachi for just <strong>Rs. 1,250</strong>.
            </p>
          </div>
          <Link
            href="/shop?cat=family-bundles"
            className="shrink-0 bg-white hover:bg-brand-50 text-brand-900 font-extrabold text-xs sm:text-sm px-6 py-3 rounded-full shadow-md transition-all active:scale-95"
          >
            Order Family Crate
          </Link>
        </div>
      </section>

      {/* Physical Shop Showcase (Real Shop Photo, NTN # 4260196-7, SITE Town Karachi) */}
      <ShopShowcase settings={settings} />

      {/* Interactive Google Maps Location Section */}
      <LocationSection settings={settings} />

      {/* TikTok Reels & Social Showcase (@i.a.vegetables.su) */}
      <SocialShowcase />

      {/* Answer Engine Optimization (AEO) FAQ Section with FAQPage Schema */}
      <FaqSection />

      {/* Farm to Table Trust Badges (Fresh Basket Style) */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xs grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-1.5 flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-xl">
              🌿
            </div>
            <h4 className="font-bold text-xs sm:text-sm text-gray-900">Farm Fresh Quality</h4>
            <p className="text-[11px] text-gray-500">Mandi fresh morning harvest picked daily.</p>
          </div>

          <div className="space-y-1.5 flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xl">
              🚚
            </div>
            <h4 className="font-bold text-xs sm:text-sm text-gray-900">Karachi-Wide Delivery</h4>
            <p className="text-[11px] text-gray-500">Fast delivery straight to your kitchen.</p>
          </div>

          <div className="space-y-1.5 flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xl">
              💵
            </div>
            <h4 className="font-bold text-xs sm:text-sm text-gray-900">Easy Payment Options</h4>
            <p className="text-[11px] text-gray-500">Cash on Delivery, JazzCash &amp; EasyPaisa.</p>
          </div>

          <div className="space-y-1.5 flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xl">
              💬
            </div>
            <h4 className="font-bold text-xs sm:text-sm text-gray-900">1-Click WhatsApp</h4>
            <p className="text-[11px] text-gray-500">Instant order confirmation via WhatsApp.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
