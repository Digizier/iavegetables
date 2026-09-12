'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Search, Phone, MapPin, Menu, X, ShieldCheck, ArrowRight, ChevronLeft, ChevronRight, LayoutGrid } from 'lucide-react';
import { getLocalCart, getShopSettings, getProducts, getCategories } from '../lib/db';
import { ShopSettings, Product, CartItem, Category } from '../lib/types';
import { INITIAL_SETTINGS, INITIAL_CATEGORIES } from '../lib/seedData';

interface HeaderProps {
  onOpenCart?: () => void;
}

export default function Header({ onOpenCart }: HeaderProps) {
  const pathname = usePathname();
  const [settings, setSettings] = useState<ShopSettings>(INITIAL_SETTINGS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [cartCount, setCartCount] = useState<number>(0);
  const [cartTotal, setCartTotal] = useState<number>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const headerNavRef = useRef<HTMLDivElement>(null);
  const [canScrollNavLeft, setCanScrollNavLeft] = useState<boolean>(false);
  const [canScrollNavRight, setCanScrollNavRight] = useState<boolean>(false);

  const checkNavScrollability = () => {
    const el = headerNavRef.current;
    if (!el) return;
    const hasOverflow = el.scrollWidth > el.clientWidth;
    setCanScrollNavLeft(el.scrollLeft > 5);
    setCanScrollNavRight(hasOverflow && el.scrollLeft < el.scrollWidth - el.clientWidth - 5);
  };

  const handleNavScroll = (direction: 'left' | 'right') => {
    const el = headerNavRef.current;
    if (!el) return;
    const amount = direction === 'left' ? -250 : 250;
    el.scrollBy({ left: amount, behavior: 'smooth' });
    setTimeout(checkNavScrollability, 300);
  };

  // If on admin route, do NOT render storefront header
  const isAdmin = pathname?.startsWith('/admin');

  useEffect(() => {
    getShopSettings().then(setSettings);
    getProducts().then(setAllProducts);
    getCategories().then((cats) => {
      setCategories(cats);
      setTimeout(checkNavScrollability, 100);
    });

    const updateCartState = () => {
      const items = getLocalCart();
      const count = items.reduce((sum, item) => sum + item.quantity, 0);
      const total = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
      setCartCount(count);
      setCartTotal(total);
    };

    updateCartState();

    const handleCartUpdate = () => updateCartState();
    const handleSettingsUpdate = (e: any) => setSettings(e.detail || INITIAL_SETTINGS);
    const handleProductsUpdate = (e: any) => setAllProducts(e.detail || []);
    const handleCategoriesUpdate = (e: any) => {
      setCategories(e.detail || INITIAL_CATEGORIES);
      setTimeout(checkNavScrollability, 100);
    };

    window.addEventListener('ia_cart_updated', handleCartUpdate);
    window.addEventListener('ia_settings_updated', handleSettingsUpdate);
    window.addEventListener('ia_products_updated', handleProductsUpdate);
    window.addEventListener('ia_categories_updated', handleCategoriesUpdate);
    window.addEventListener('resize', checkNavScrollability);

    return () => {
      window.removeEventListener('ia_cart_updated', handleCartUpdate);
      window.removeEventListener('ia_settings_updated', handleSettingsUpdate);
      window.removeEventListener('ia_products_updated', handleProductsUpdate);
      window.removeEventListener('ia_categories_updated', handleCategoriesUpdate);
      window.removeEventListener('resize', checkNavScrollability);
    };
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const q = searchQuery.toLowerCase();
      const filtered = allProducts.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.name_urdu && p.name_urdu.includes(q))
      );
      setSearchResults(filtered.slice(0, 5));
      setIsSearching(true);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  }, [searchQuery, allProducts]);

  if (isAdmin) return null;

  const cleanPhone = settings.whatsapp_number?.replace(/[^0-9]/g, '') || '923413989260';

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm">
      {/* Top Location & Delivery Bar (Fresh Basket Style) */}
      <div className="bg-brand-700 text-white text-xs py-1.5 px-4 font-medium">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="w-3.5 h-3.5 text-brand-300 shrink-0" />
            <span className="truncate">
              Delivering across <strong className="text-white font-semibold">Karachi</strong> (SITE Town, Clifton, Gulshan & All Areas)
            </span>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <span className="hidden sm:inline-block text-brand-200">NTN: {settings.ntn_number || '4260196-7'}</span>
            <a
              href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent('Hello I.A Vegetables, I want to inquire about vegetable order delivery.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 bg-brand-800 hover:bg-brand-900 px-2 py-0.5 rounded text-white transition-colors"
            >
              <Phone className="w-3 h-3 text-emerald-400" />
              <span>{settings.phone_number || '+92 341 3989260'}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
        {/* Mobile Hamburger & Logo */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-lg text-gray-700 hover:bg-gray-100"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <Link href="/" className="flex items-center gap-2.5">
            <img
              src="/images/logo.png"
              alt="I.A Vegetables Supplier Karachi Logo"
              className="h-11 w-auto object-contain"
            />
            <div className="hidden sm:block">
              <span className="block font-black text-lg leading-tight tracking-tight text-brand-900">
                I.A VEGETABLES
              </span>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-brand-600">
                Fresh Produce • Since 1990
              </span>
            </div>
          </Link>
        </div>

        {/* Search Bar with Instant Autocomplete Dropdown */}
        <div className="flex-1 max-w-xl relative">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search fresh vegetables (Aloo, Tamatar, Palak...)"
              className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:border-brand-500 focus:bg-white transition-all"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Autocomplete Results */}
          {isSearching && searchResults.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden z-50">
              <div className="p-2 divide-y divide-gray-100">
                {searchResults.map((item) => (
                  <Link
                    key={item.id}
                    href={`/product/${encodeURIComponent(item.id)}/`}
                    onClick={() => {
                      setIsSearching(false);
                      setSearchQuery('');
                    }}
                    className="flex items-center justify-between p-2 hover:bg-brand-50 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={item.thumbnail_url}
                        alt={`${item.name} - Fresh Vegetable Karachi`}
                        className="w-10 h-10 object-cover rounded-lg"
                      />
                      <div>
                        <div className="font-semibold text-sm text-gray-800">{item.name}</div>
                        {item.name_urdu && (
                          <div className="text-xs text-brand-700 font-urdu">{item.name_urdu}</div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-sm text-brand-700">Rs. {item.price}</div>
                      <div className="text-[11px] text-gray-500">per {item.unit}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Actions: WhatsApp + Cart Drawer Trigger */}
        <div className="flex items-center gap-2">
          <a
            href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent('Hi, I want to order fresh vegetables in Karachi.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-full border border-emerald-300 text-emerald-700 hover:bg-emerald-50 text-xs font-semibold transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            WhatsApp Order
          </a>

          <button
            onClick={onOpenCart}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-3.5 py-2 rounded-full font-semibold text-sm shadow-sm hover:shadow transition-all"
            aria-label="Open Shopping Cart"
          >
            <div className="relative">
              <ShoppingBag className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-amber-400 text-brand-950 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="hidden sm:inline font-bold">
              {cartTotal > 0 ? `Rs. ${cartTotal.toLocaleString()}` : 'Cart'}
            </span>
          </button>
        </div>
      </div>

      {/* Desktop Category Bar (Scrollable with Controls) */}
      <nav className="hidden md:block border-t border-gray-100 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 relative flex items-center">
          {/* Left Arrow Button */}
          {canScrollNavLeft && (
            <button
              type="button"
              onClick={() => handleNavScroll('left')}
              className="absolute left-2 z-20 w-7 h-7 rounded-full bg-white/95 hover:bg-white text-gray-700 shadow-md border border-gray-200 flex items-center justify-center transition-transform hover:scale-110 cursor-pointer"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          {/* Left Gradient Fade Mask */}
          {canScrollNavLeft && (
            <div className="absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-white to-transparent pointer-events-none z-10" />
          )}

          {/* Scrollable Container */}
          <div
            ref={headerNavRef}
            onScroll={checkNavScrollability}
            onWheel={(e) => {
              if (headerNavRef.current && e.deltaY !== 0) {
                headerNavRef.current.scrollLeft += e.deltaY;
                checkNavScrollability();
              }
            }}
            className="flex items-center gap-5 py-2.5 overflow-x-auto no-scrollbar scroll-smooth w-full text-xs font-semibold text-gray-700 px-1"
          >
            <Link href="/" className="hover:text-brand-600 transition-colors whitespace-nowrap font-bold text-gray-900 shrink-0">
              Home
            </Link>
            <Link href="/shop" className="hover:text-brand-600 transition-colors whitespace-nowrap text-brand-800 font-bold shrink-0">
              All Fresh Vegetables
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/shop?cat=${cat.slug}`}
                className="hover:text-brand-600 transition-colors whitespace-nowrap flex items-center gap-1.5 shrink-0"
              >
                <span>{cat.icon || '🥦'}</span>
                <span>{cat.name}</span>
                {cat.name_urdu && (
                  <span className="text-[11px] text-brand-700/80 font-normal font-urdu">
                    ({cat.name_urdu})
                  </span>
                )}
              </Link>
            ))}
            <Link href="/#store-location" className="hover:text-brand-600 transition-colors whitespace-nowrap text-gray-500 shrink-0">
              📍 SITE Town Shop
            </Link>

            <Link
              href="/shop"
              className="ml-auto hover:text-brand-700 text-brand-800 font-bold whitespace-nowrap flex items-center gap-1 shrink-0 bg-brand-50 hover:bg-brand-100 px-2.5 py-1 rounded-full border border-brand-200 transition-colors"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-brand-600" />
              <span>See All ({categories.length})</span>
            </Link>
          </div>

          {/* Right Gradient Fade Mask */}
          {canScrollNavRight && (
            <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-white to-transparent pointer-events-none z-10" />
          )}

          {/* Right Arrow Button */}
          {canScrollNavRight && (
            <button
              type="button"
              onClick={() => handleNavScroll('right')}
              className="absolute right-2 z-20 w-7 h-7 rounded-full bg-white/95 hover:bg-white text-gray-700 shadow-md border border-gray-200 flex items-center justify-center transition-transform hover:scale-110 cursor-pointer"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </nav>

      {/* Mobile Drawer Menu (Full Dynamic Categories, No Admin Link) */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-3 shadow-xl max-h-[80vh] overflow-y-auto">
          <div className="flex flex-col gap-1 font-medium text-sm text-gray-700">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-2 hover:bg-gray-50 rounded-xl flex items-center justify-between"
            >
              <span className="font-bold text-gray-900">🏠 Home</span>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </Link>
            <Link
              href="/shop"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-2 hover:bg-gray-50 rounded-xl flex items-center justify-between"
            >
              <span className="font-bold text-brand-800">🧺 All Fresh Vegetables</span>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </Link>

            {/* Dynamic Categories Section */}
            <div className="pt-2 pb-1 px-2 text-[11px] font-extrabold uppercase tracking-wider text-gray-400">
              Vegetable Categories
            </div>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/shop?cat=${cat.slug}`}
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 px-2 hover:bg-brand-50/70 rounded-xl flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2 font-semibold text-gray-800">
                  <span className="text-base">{cat.icon || '🥦'}</span>
                  <span>{cat.name}</span>
                  {cat.name_urdu && (
                    <span className="text-[11px] text-brand-700 font-normal font-urdu">
                      ({cat.name_urdu})
                    </span>
                  )}
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-gray-300" />
              </Link>
            ))}

            <div className="pt-2 border-t border-gray-100 mt-2">
              <Link
                href="/#store-location"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 px-2 hover:bg-gray-50 rounded-xl flex items-center justify-between text-xs font-semibold text-brand-800"
              >
                <span>📍 Physical Shop (SITE Town, Keamari)</span>
                <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
