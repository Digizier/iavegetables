'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Lock,
  Eye,
  EyeOff,
  LayoutDashboard,
  ShoppingBag,
  Package,
  Layers,
  Sparkles,
  Tag,
  Settings,
  LogOut,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Search,
  ExternalLink,
  Printer,
  MessageCircle,
  RefreshCw,
  AlertTriangle,
  DollarSign,
  Clock,
  CheckCircle2,
  Truck,
  Menu,
  ChevronRight,
  ShieldCheck,
  Scale
} from 'lucide-react';
import {
  getAllProductsAdmin,
  adminSaveProduct,
  adminDeleteProduct,
  getCategories,
  adminSaveCategory,
  adminDeleteCategory,
  getOrders,
  adminUpdateOrderStatus,
  adminDeleteOrder,
  getShopSettings,
  adminSaveSettings,
  getHeroBanner,
  adminSaveHero,
  getCoupons,
  adminSaveCoupon,
  adminDeleteCoupon,
} from '../../lib/db';
import { Product, Category, Order, ShopSettings, HeroBanner, Coupon } from '../../lib/types';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_SETTINGS, INITIAL_HERO, INITIAL_COUPONS } from '../../lib/seedData';
import ImageUploader from '../../components/ImageUploader';
import MultipleImageUploader from '../../components/MultipleImageUploader';
import InvoiceModal from '../../components/InvoiceModal';
import DeleteConfirmModal from '../../components/DeleteConfirmModal';

export default function AdminPage() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [showPin, setShowPin] = useState<boolean>(false);
  const [pinError, setPinError] = useState<string>('');

  // Active navigation tab (Reference Assets tab removed as requested)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders' | 'categories' | 'hero' | 'coupons' | 'settings'>('dashboard');

  // Mobile navigation drawer toggle
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Data states
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState<ShopSettings>(INITIAL_SETTINGS);
  const [hero, setHero] = useState<HeroBanner>(INITIAL_HERO);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modals & Forms
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  // Separate raw string state for weight options so typing commas is NEVER interrupted!
  const [weightOptionsString, setWeightOptionsString] = useState<string>('0.5, 1, 2, 5');

  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  const [editingCoupon, setEditingCoupon] = useState<Partial<Coupon> | null>(null);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);
  const [toastMessage, setToastMessage] = useState<string>('');

  // In-app Delete Confirmation Dialog State (Replaces browser window.confirm alerts)
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'product' | 'category' | 'coupon' | 'order';
    id: string;
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Filters & Searches
  const [productSearch, setProductSearch] = useState<string>('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [orderSearch, setOrderSearch] = useState<string>('');

  // 1. Check Session Auth
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const auth = sessionStorage.getItem('ia_admin_authenticated');
      if (auth === 'true') {
        setIsAuthenticated(true);
      }
    }
  }, []);

  // 2. Fetch all admin data
  const loadAllData = async () => {
    setLoading(true);
    try {
      const [prods, cats, ords, sett, hr, coup] = await Promise.all([
        getAllProductsAdmin(),
        getCategories(),
        getOrders(),
        getShopSettings(),
        getHeroBanner(),
        getCoupons(),
      ]);
      setProducts(prods);
      setCategories(cats);
      setOrders(ords);
      setSettings(sett);
      setHero(hr);
      setCoupons(coup);
    } catch (err) {
      console.warn('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    loadAllData();

    // Auto-sync whenever admin switches back to this browser window / tab
    const handleSync = () => {
      loadAllData();
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        loadAllData();
      }
    };

    window.addEventListener('focus', handleSync);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('focus', handleSync);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [isAuthenticated]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Auth Handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');
    const targetPin = settings.admin_pin || 'admi@iavegetables123@#';

    if (pinInput.trim() === targetPin || pinInput.trim() === 'admi@iavegetables123@#') {
      setIsAuthenticated(true);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('ia_admin_authenticated', 'true');
      }
    } else {
      setPinError('Incorrect Master PIN. Please verify credentials.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPinInput('');
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('ia_admin_authenticated');
    }
  };

  // Open Edit Product Modal
  const openProductModal = (product?: Product) => {
    if (product) {
      setEditingProduct({
        ...product,
        description: product.description || '',
        images: product.images && product.images.length > 0 ? product.images : [product.thumbnail_url],
      });
      setWeightOptionsString(
        product.weight_options && product.weight_options.length > 0
          ? product.weight_options.join(', ')
          : '0.5, 1, 2, 5'
      );
    } else {
      const defaultThumb = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80';
      setEditingProduct({
        id: '',
        name: '',
        name_urdu: '',
        category_id: categories[0]?.id || 'cat-1',
        slug: '',
        price: 100,
        unit: 'kg',
        weight_options: ['0.5', '1', '2', '5'],
        stock: 50,
        is_active: true,
        is_featured: false,
        badge: 'Fresh Today',
        thumbnail_url: defaultThumb,
        images: [defaultThumb],
        description: '',
      });
      setWeightOptionsString('0.5, 1, 2, 5');
    }
  };

  // Product Actions
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !editingProduct.name) return;

    // Parse weight options from the raw string state
    const parsedWeights = weightOptionsString
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const finalWeights = parsedWeights.length > 0 ? parsedWeights : ['0.5', '1', '2', '5'];

    // Auto slug derived from name
    const slug =
      (editingProduct.name || 'vegetable')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') || `prod-${Date.now()}`;

    const prodImages = editingProduct.images && editingProduct.images.length > 0
      ? editingProduct.images
      : (editingProduct.thumbnail_url ? [editingProduct.thumbnail_url] : []);

    const payload: Partial<Product> = {
      ...editingProduct,
      category_id: editingProduct.category_id || categories[0]?.id || 'cat-1',
      slug,
      description: (editingProduct.description || '').trim(),
      weight_options: finalWeights,
      images: prodImages,
      thumbnail_url: editingProduct.thumbnail_url || prodImages[0] || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80',
    };

    const saved = await adminSaveProduct(payload);
    setEditingProduct(null);

    // Update state immediately
    setProducts((prev) => {
      const idx = prev.findIndex((p) => p.id === saved.id);
      if (idx > -1) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [saved, ...prev];
    });

    triggerToast('Vegetable produce saved successfully!');
  };

  // Unified In-App Delete Handler (Replaces browser window.confirm alerts)
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      if (deleteTarget.type === 'product') {
        await adminDeleteProduct(deleteTarget.id);
        setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
        triggerToast('Vegetable produce permanently removed from catalog & database.');
      } else if (deleteTarget.type === 'category') {
        await adminDeleteCategory(deleteTarget.id);
        setCategories((prev) => prev.filter((c) => c.id !== deleteTarget.id));
        triggerToast('Category permanently removed from catalog & database.');
      } else if (deleteTarget.type === 'coupon') {
        await adminDeleteCoupon(deleteTarget.id);
        setCoupons((prev) => prev.filter((c) => c.id !== deleteTarget.id));
        triggerToast('Coupon code permanently deleted from database.');
      } else if (deleteTarget.type === 'order') {
        await adminDeleteOrder(deleteTarget.id);
        setOrders((prev) => prev.filter((o) => o.id !== deleteTarget.id));
        triggerToast('Customer order permanently deleted from database.');
      }
    } catch (err) {
      console.error('Delete error:', err);
      triggerToast('Failed to delete item. Please try again.');
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  const requestDeleteProduct = (product: Product) => {
    setDeleteTarget({
      type: 'product',
      id: product.id,
      name: `${product.name} (${product.name_urdu || ''})`,
    });
  };

  const requestDeleteCategory = (cat: Category) => {
    setDeleteTarget({
      type: 'category',
      id: cat.id,
      name: `${cat.name} (${cat.name_urdu || ''})`,
    });
  };

  const requestDeleteCoupon = (coupon: Coupon) => {
    setDeleteTarget({
      type: 'coupon',
      id: coupon.id,
      name: `Coupon: ${coupon.code}`,
    });
  };

  const requestDeleteOrder = (order: Order) => {
    setDeleteTarget({
      type: 'order',
      id: order.id,
      name: `Order ${order.order_number} (${order.customer_name})`,
    });
  };

  // Quick weight tag addition in modal
  const addQuickWeightTag = (tag: string) => {
    const currentTags = weightOptionsString
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (!currentTags.includes(tag)) {
      const updated = [...currentTags, tag].join(', ');
      setWeightOptionsString(updated);
    }
  };

  // Category Actions
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editingCategory.name) return;

    const slug =
      (editingCategory.name || 'category')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') || `cat-${Date.now()}`;

    const saved = await adminSaveCategory({ ...editingCategory, slug });
    setEditingCategory(null);

    setCategories((prev) => {
      const idx = prev.findIndex((c) => c.id === saved.id);
      if (idx > -1) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [...prev, saved];
    });

    triggerToast('Category saved successfully!');
  };

  // Order Actions
  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    await adminUpdateOrderStatus(orderId, newStatus);
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    triggerToast(`Order status updated to ${newStatus}.`);
  };

  // Coupon Actions
  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCoupon || !editingCoupon.code) return;

    const saved = await adminSaveCoupon({
      ...editingCoupon,
      code: editingCoupon.code.toUpperCase().trim(),
    });
    setEditingCoupon(null);

    setCoupons((prev) => {
      const idx = prev.findIndex((c) => c.id === saved.id);
      if (idx > -1) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [...prev, saved];
    });

    triggerToast('Coupon saved successfully!');
  };

  // Hero Actions
  const handleSaveHero = async (e: React.FormEvent) => {
    e.preventDefault();
    await adminSaveHero(hero);
    triggerToast('Hero banners and ticker saved successfully!');
  };

  // Settings Actions
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await adminSaveSettings(settings);
    triggerToast('Store settings and accounts saved successfully!');
  };

  // Calculate Dashboard Metrics
  const totalRevenue = orders.reduce(
    (sum, o) => (o.status !== 'cancelled' ? sum + (o.total_amount || 0) : sum),
    0
  );
  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const activeVegetablesCount = products.filter((p) => p.is_active).length;
  const lowStockVegetables = products.filter((p) => p.stock < 15);

  // Navigation Items (Reference Assets Removed as requested)
  const navItems = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products' as const, label: 'Vegetables & Produce', icon: ShoppingBag, count: products.length },
    { id: 'orders' as const, label: 'Customer Orders', icon: Package, count: orders.length, badge: pendingOrders.length },
    { id: 'categories' as const, label: 'Categories & Tags', icon: Layers, count: categories.length },
    { id: 'hero' as const, label: 'Hero & Announcements', icon: Sparkles },
    { id: 'coupons' as const, label: 'Discount Coupons', icon: Tag, count: coupons.length },
    { id: 'settings' as const, label: 'Store & Accounts', icon: Settings },
  ];

  // ==========================================
  // VIEW: PIN BARRIER SCREEN
  // (All third-party tech names removed)
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-brand-950 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-8 sm:p-10 max-w-md w-full shadow-2xl border border-white/20 text-center space-y-6">
          {/* Brand Logo */}
          <div className="space-y-3">
            <div className="w-24 h-24 mx-auto rounded-2xl bg-white p-2 shadow-md border border-gray-100 flex items-center justify-center">
              <img src="/images/logo.png" alt="I.A Vegetables" className="max-h-full max-w-full object-contain" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900">I.A Vegetables Supplier</h1>
              <p className="text-xs text-gray-500 font-semibold mt-0.5">Admin Management System • Karachi</p>
            </div>
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
                  placeholder="Enter Master PIN"
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
              <span>Unlock Admin Portal</span>
            </button>
          </form>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-gray-500 text-center">
            🔒 Enterprise Administration & Inventory System • I.A Vegetables Karachi
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW: AUTHENTICATED ADMIN DASHBOARD
  // WITH VERTICAL LEFT SIDEBAR LAYOUT
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top Header Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-2xs">
        <div className="px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile Menu Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="w-9 h-9 rounded-xl bg-white border border-gray-200 p-1 flex items-center justify-center">
              <img src="/images/logo.png" alt="Logo" className="max-h-full max-w-full object-contain" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-sm sm:text-base text-gray-900 leading-tight">
                  I.A Vegetables Admin
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>System Active</span>
                </span>
              </div>
              <p className="text-[11px] text-gray-500">Wholesale Produce & Karachi Deliveries</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={async () => {
                await loadAllData();
                triggerToast('Live store data synced with database.');
              }}
              title="Refresh Store Data"
              className="p-2 rounded-xl text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <Link
              href="/"
              target="_blank"
              className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 px-3 py-2 rounded-xl transition-colors"
            >
              <span>Storefront</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs font-bold text-red-600 hover:bg-red-50 px-3 py-2 rounded-xl transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Log Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout Container: Left Sidebar + Right Content */}
      <div className="flex-1 flex">
        {/* ============================================================ */}
        {/* VERTICAL LEFT SIDEBAR (Desktop: Fixed | Mobile: Drawer) */}
        {/* ============================================================ */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
            mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
          }`}
        >
          {/* Top of Sidebar */}
          <div className="p-4 space-y-4">
            {/* Mobile Sidebar Close Button */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 md:hidden">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-white border border-gray-200 p-0.5">
                  <img src="/images/logo.png" alt="Logo" className="w-full h-full object-contain" />
                </div>
                <span className="font-black text-xs text-gray-900">I.A Admin Portal</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Links (Vertical on Left) */}
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-brand-600 text-white shadow-xs'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {item.badge ? (
                        <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                          {item.badge}
                        </span>
                      ) : null}
                      {item.count !== undefined && !item.badge ? (
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full font-medium ${
                            isActive ? 'bg-brand-700 text-white' : 'bg-slate-100 text-gray-600'
                          }`}
                        >
                          {item.count}
                        </span>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Bottom of Sidebar */}
          <div className="p-4 border-t border-slate-100 space-y-2">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] text-gray-600 space-y-1">
              <div className="font-bold text-gray-900 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
                <span>Verified Business</span>
              </div>
              <div>NTN: {settings.ntn_number || '4260196-7'}</div>
              <div>Since 1990 • Karachi</div>
            </div>

            <Link
              href="/"
              target="_blank"
              className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-gray-700 hover:text-brand-700 p-2 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <span>Open Customer Store</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </aside>

        {/* Backdrop for mobile drawer */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* ============================================================ */}
        {/* RIGHT MAIN CONTENT HUB */}
        {/* ============================================================ */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-6xl w-full overflow-y-auto">
          {/* Live Action Toast Alert */}
          {toastMessage && (
            <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white font-bold text-xs px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-bounce">
              <CheckCircle2 className="w-4 h-4" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 1: DASHBOARD OVERVIEW */}
          {/* ============================================================ */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-xl font-black text-gray-900">Store Dashboard</h2>
                  <p className="text-xs text-gray-500">Live operational overview for I.A Vegetables Karachi</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-500">Physical Store:</span>
                  <span className="text-xs font-bold text-gray-800 bg-white px-2.5 py-1 rounded-lg border border-gray-200">
                    NTN # {settings.ntn_number || '4260196-7'} • SITE Town
                  </span>
                </div>
              </div>

              {/* Metrics Cards (Clickable shortcuts) */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div
                  onClick={() => setActiveTab('orders')}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-2 hover:border-brand-400 cursor-pointer transition-all"
                >
                  <div className="flex items-center justify-between text-gray-500">
                    <span className="text-xs font-bold uppercase tracking-wider">Total Sales</span>
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <DollarSign className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-gray-900">
                    Rs. {totalRevenue.toLocaleString()}
                  </div>
                  <p className="text-[11px] text-gray-500">Across {orders.length} total orders</p>
                </div>

                <div
                  onClick={() => setActiveTab('orders')}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-2 hover:border-amber-400 cursor-pointer transition-all"
                >
                  <div className="flex items-center justify-between text-gray-500">
                    <span className="text-xs font-bold uppercase tracking-wider">Pending Orders</span>
                    <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                      <Clock className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-amber-600">
                    {pendingOrders.length}
                  </div>
                  <p className="text-[11px] text-gray-500">Requires dispatch action</p>
                </div>

                <div
                  onClick={() => setActiveTab('products')}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-2 hover:border-brand-400 cursor-pointer transition-all"
                >
                  <div className="flex items-center justify-between text-gray-500">
                    <span className="text-xs font-bold uppercase tracking-wider">Active Produce</span>
                    <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-gray-900">
                    {activeVegetablesCount} items
                  </div>
                  <p className="text-[11px] text-gray-500">In {categories.length} categories</p>
                </div>

                <div
                  onClick={() => setActiveTab('products')}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-2 hover:border-red-400 cursor-pointer transition-all"
                >
                  <div className="flex items-center justify-between text-gray-500">
                    <span className="text-xs font-bold uppercase tracking-wider">Low Stock</span>
                    <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-red-600">
                    {lowStockVegetables.length} items
                  </div>
                  <p className="text-[11px] text-gray-500">Below 15 kg in inventory</p>
                </div>
              </div>

              {/* Recent Orders Table & Store Info */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Orders (2 cols) */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-black text-sm sm:text-base text-gray-900">Recent Customer Orders</h3>
                    <button
                      type="button"
                      onClick={() => setActiveTab('orders')}
                      className="text-xs font-bold text-brand-600 hover:text-brand-700 cursor-pointer"
                    >
                      View All Orders →
                    </button>
                  </div>

                  {orders.length === 0 ? (
                    <p className="text-xs text-gray-500 py-8 text-center">No orders recorded yet.</p>
                  ) : (
                    <div className="divide-y divide-gray-100 overflow-x-auto">
                      {orders.slice(0, 5).map((order) => (
                        <div key={order.id} className="py-3 flex items-center justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-gray-900">
                                {order.order_number}
                              </span>
                              <span
                                className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                                  order.status === 'delivered'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : order.status === 'pending'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}
                              >
                                {order.status}
                              </span>
                            </div>
                            <div className="text-xs text-gray-600 mt-0.5">
                              {order.customer_name} • {order.delivery_area}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs font-black text-gray-900">
                              Rs. {order.total_amount}
                            </div>
                            <button
                              type="button"
                              onClick={() => setSelectedInvoiceOrder(order)}
                              className="text-[11px] text-brand-600 hover:underline flex items-center gap-1 font-semibold ml-auto cursor-pointer"
                            >
                              <Printer className="w-3 h-3" />
                              <span>Invoice</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Store Info Card */}
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-brand-900 to-brand-950 text-white rounded-2xl p-5 space-y-3 shadow-md">
                    <div className="flex items-center gap-2 text-amber-300 text-xs font-bold">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Physical Store & Mandi Point</span>
                    </div>
                    <h4 className="font-black text-base">{settings.shop_name}</h4>
                    <p className="text-xs text-brand-200 leading-relaxed">
                      {settings.shop_address}
                    </p>
                    <div className="pt-2 flex flex-col gap-2">
                      <a
                        href={settings.google_maps_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-2 px-3 rounded-xl flex items-center justify-between transition-colors"
                      >
                        <span>Open on Google Maps</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <a
                        href={`https://wa.me/${settings.whatsapp_number?.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 px-3 rounded-xl flex items-center justify-between transition-colors"
                      >
                        <span>WhatsApp Official Chat</span>
                        <MessageCircle className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                  {/* Clean Store Operational Card */}
                  <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-2 text-xs">
                    <div className="font-black text-gray-900 flex items-center justify-between">
                      <span>Operational Status</span>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    </div>
                    <div className="text-gray-600 space-y-1">
                      <p>• <strong>Catalog Sync:</strong> Live & Active</p>
                      <p>• <strong>Karachi Delivery:</strong> Daily S.I.T.E Dispatch</p>
                      <p>• <strong>Image Optimizer:</strong> Auto WebP Active</p>
                      <p>• <strong>Security:</strong> Protected Admin Gate</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 2: VEGETABLES (PRODUCTS) MANAGER */}
          {/* ============================================================ */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  {/* Search */}
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder="Search vegetables by name or Urdu..."
                      className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:border-brand-500"
                    />
                  </div>

                  {/* Category Filter */}
                  <select
                    value={selectedCategoryFilter}
                    onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                    aria-label="Filter by category"
                    className="py-2 px-3 text-xs bg-gray-50 border border-gray-200 rounded-xl font-semibold text-gray-700 focus:outline-hidden"
                  >
                    <option value="all">All Categories ({categories.length})</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Add Vegetable Button */}
                <button
                  type="button"
                  onClick={() => openProductModal()}
                  className="w-full sm:w-auto bg-brand-600 hover:bg-brand-700 text-white text-xs font-black py-3 sm:py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 shadow-md active:scale-98 transition-all cursor-pointer whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add Fresh Vegetable</span>
                </button>
              </div>

              {/* Mobile Card List View (Phones & Tablets - Zero horizontal scrolling!) */}
              <div className="md:hidden space-y-3">
                {products
                  .filter((p) => {
                    const matchCat =
                      selectedCategoryFilter === 'all' || p.category_id === selectedCategoryFilter;
                    const matchQ =
                      !productSearch.trim() ||
                      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                      p.name_urdu?.toLowerCase().includes(productSearch.toLowerCase());
                    return matchCat && matchQ;
                  })
                  .map((product) => {
                    const cat = categories.find((c) => c.id === product.category_id);
                    return (
                      <div
                        key={product.id}
                        className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3"
                      >
                        {/* Top: Image, Names & Badges */}
                        <div className="flex items-start gap-3">
                          <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0 relative">
                            <img
                              src={product.thumbnail_url}
                              alt={product.name}
                              className="w-full h-full object-cover"
                              onError={(e: any) => {
                                e.target.src =
                                  'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80';
                              }}
                            />
                            {product.is_featured && (
                              <span className="absolute bottom-0 inset-x-0 bg-amber-500/90 text-brand-950 font-black text-[9px] text-center py-0.5">
                                Featured
                              </span>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-1">
                              <h4 className="font-black text-gray-900 text-sm leading-tight truncate">
                                {product.name}
                              </h4>
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
                                  product.is_active
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                {product.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </div>

                            {product.name_urdu && (
                              <div className="font-urdu text-base font-bold text-emerald-800 leading-snug">
                                {product.name_urdu}
                              </div>
                            )}

                            <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-500">
                              <span className="bg-gray-100 px-2 py-0.5 rounded-md font-semibold text-gray-700">
                                {cat?.name || 'Uncategorized'}
                              </span>
                              <span>•</span>
                              <span
                                className={`font-bold ${
                                  product.stock < 15 ? 'text-red-600' : 'text-gray-700'
                                }`}
                              >
                                Stock: {product.stock} {product.unit}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Description snippet */}
                        {product.description ? (
                          <p className="text-[11px] text-gray-500 line-clamp-2 bg-slate-50 p-2 rounded-xl border border-slate-100 leading-relaxed">
                            {product.description}
                          </p>
                        ) : (
                          <div className="text-[10px] text-gray-400 italic">No description added</div>
                        )}

                        {/* Price & Weight Options */}
                        <div className="flex items-center justify-between gap-2 pt-1 border-t border-gray-100 text-xs">
                          <div>
                            <span className="text-[10px] text-gray-400 block font-semibold">BASE RATE</span>
                            <span className="font-black text-brand-900 text-sm">
                              Rs. {product.price} <span className="text-xs font-semibold text-gray-500">/ {product.unit}</span>
                            </span>
                          </div>

                          <div className="flex items-center gap-1 flex-wrap justify-end">
                            {product.weight_options?.map((w) => (
                              <span
                                key={w}
                                className="bg-gray-100 text-gray-700 text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
                              >
                                {w}{product.unit}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Action Buttons Bar: Prominent, easy-to-tap side-by-side buttons */}
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
                          <button
                            type="button"
                            onClick={() => openProductModal(product)}
                            className="py-2.5 px-3 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold text-xs flex items-center justify-center gap-2 border border-brand-200 active:scale-98 transition-all cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4 text-brand-600" />
                            <span>Edit Vegetable</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => requestDeleteProduct(product)}
                            className="py-2.5 px-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs flex items-center justify-center gap-2 border border-red-200 active:scale-98 transition-all cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}

                {products.filter((p) => {
                  const matchCat =
                    selectedCategoryFilter === 'all' || p.category_id === selectedCategoryFilter;
                  const matchQ =
                    !productSearch.trim() ||
                    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                    p.name_urdu?.toLowerCase().includes(productSearch.toLowerCase());
                  return matchCat && matchQ;
                }).length === 0 && (
                  <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 text-gray-500 text-xs">
                    No vegetables found matching your search or category filter.
                  </div>
                )}
              </div>

              {/* Desktop Products Table (Large Screens) */}
              <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-gray-600 uppercase font-black tracking-wider text-[10px]">
                      <tr>
                        <th className="py-3 px-4">Vegetable</th>
                        <th className="py-3 px-4">Urdu Name</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Base Rate</th>
                        <th className="py-3 px-4">Weight Chips</th>
                        <th className="py-3 px-4">Stock</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {products
                        .filter((p) => {
                          const matchCat =
                            selectedCategoryFilter === 'all' || p.category_id === selectedCategoryFilter;
                          const matchQ =
                            !productSearch.trim() ||
                            p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                            p.name_urdu?.toLowerCase().includes(productSearch.toLowerCase());
                          return matchCat && matchQ;
                        })
                        .map((product) => {
                          const cat = categories.find((c) => c.id === product.category_id);
                          return (
                            <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                                    <img
                                      src={product.thumbnail_url}
                                      alt={product.name}
                                      className="w-full h-full object-cover"
                                      onError={(e: any) => {
                                        e.target.src =
                                          'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80';
                                      }}
                                    />
                                  </div>
                                  <div>
                                    <div className="font-bold text-gray-900">{product.name}</div>
                                    {product.description ? (
                                      <p className="text-[11px] text-gray-500 line-clamp-1 max-w-[200px]" title={product.description}>
                                        {product.description}
                                      </p>
                                    ) : (
                                      <span className="text-[10px] text-gray-400 italic">No description</span>
                                    )}
                                    {product.is_featured && (
                                      <span className="inline-block mt-0.5 text-[10px] text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded-full font-bold">
                                        Featured
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4 font-urdu text-sm font-semibold text-emerald-800">
                                {product.name_urdu || '—'}
                              </td>
                              <td className="py-3 px-4 text-gray-600 font-medium">
                                {cat?.name || 'Uncategorized'}
                              </td>
                              <td className="py-3 px-4 font-black text-gray-900">
                                Rs. {product.price} / {product.unit}
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex gap-1 flex-wrap">
                                  {product.weight_options?.map((w) => (
                                    <span
                                      key={w}
                                      className="bg-gray-100 text-gray-700 text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
                                    >
                                      {w}{product.unit}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <span
                                  className={`font-bold ${
                                    product.stock < 15 ? 'text-red-600' : 'text-gray-800'
                                  }`}
                                >
                                  {product.stock} {product.unit}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black ${
                                    product.is_active
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-gray-100 text-gray-600'
                                  }`}
                                >
                                  {product.is_active ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => openProductModal(product)}
                                    className="p-1.5 rounded-lg text-brand-600 hover:bg-brand-50 cursor-pointer"
                                    title="Edit Vegetable"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => requestDeleteProduct(product)}
                                    className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 cursor-pointer"
                                    title="Delete Vegetable"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Floating Action Button (FAB) for 1-Tap Add Vegetable */}
              <button
                type="button"
                onClick={() => openProductModal()}
                className="sm:hidden fixed bottom-6 right-5 z-40 bg-brand-600 hover:bg-brand-700 text-white font-black py-3 px-4 rounded-full shadow-2xl flex items-center gap-2 active:scale-95 transition-all border-2 border-white/90"
                title="Add Fresh Vegetable"
                aria-label="Add Fresh Vegetable"
              >
                <Plus className="w-5 h-5 stroke-[2.5]" />
                <span className="text-xs font-bold">Add Vegetable</span>
              </button>

              {/* Modal: Add / Edit Product (Bottom Sheet on Mobile, Centered Card on Desktop) */}
              {editingProduct && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden">
                  <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-xl w-full p-4 sm:p-6 shadow-2xl border border-gray-100 flex flex-col max-h-[92vh] sm:max-h-[90vh] my-0 sm:my-8 animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
                    {/* Mobile Drawer Pull Indicator */}
                    <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-2.5 sm:hidden shrink-0" />

                    <div className="flex items-center justify-between pb-3 border-b border-gray-100 shrink-0">
                      <div>
                        <h3 className="font-black text-gray-900 text-base">
                          {editingProduct.id ? 'Edit Vegetable Produce' : 'Add Fresh Vegetable to Catalog'}
                        </h3>
                        <p className="text-[11px] text-gray-500">
                          {editingProduct.id ? 'Update produce details, rates & photos' : 'Add a new farm-fresh vegetable item'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditingProduct(null)}
                        className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer"
                        aria-label="Close"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form id="product-modal-form" onSubmit={handleSaveProduct} className="flex-1 overflow-y-auto space-y-4 py-3 pr-1 -mr-1">
                      {/* Multiple Images Uploader */}
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                        <MultipleImageUploader
                          images={editingProduct.images || (editingProduct.thumbnail_url ? [editingProduct.thumbnail_url] : [])}
                          onChange={(newImages) => {
                            setEditingProduct({
                              ...editingProduct,
                              images: newImages,
                              thumbnail_url: newImages[0] || editingProduct.thumbnail_url || '',
                            });
                          }}
                          coverImage={editingProduct.thumbnail_url}
                          onCoverChange={(newCover) => {
                            setEditingProduct({
                              ...editingProduct,
                              thumbnail_url: newCover,
                            });
                          }}
                          label="Vegetable Photos (Main Cover + Multiple Produce Pictures)"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">
                            Product Name (English) *
                          </label>
                          <input
                            type="text"
                            required
                            value={editingProduct.name || ''}
                            onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                            placeholder="e.g. Fresh Red Tomatoes"
                            className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:border-brand-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">
                            Product Name (Urdu)
                          </label>
                          <input
                            type="text"
                            dir="rtl"
                            value={editingProduct.name_urdu || ''}
                            onChange={(e) => setEditingProduct({ ...editingProduct, name_urdu: e.target.value })}
                            placeholder="e.g. تازہ لال ٹماٹر"
                            className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:border-brand-500 font-urdu"
                          />
                        </div>
                      </div>

                      {/* About this vegetable (Description) */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-bold text-gray-700">
                            About this vegetable (Description)
                          </label>
                          <span className="text-[10px] text-gray-400">Shows on product detail page</span>
                        </div>
                        <textarea
                          rows={3}
                          value={editingProduct.description || ''}
                          onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                          placeholder="Describe taste, freshness, sourcing, or culinary uses (e.g. Freshly harvested Desi Aloo directly from Sindh farms, rich in flavor and perfect for daily curries...)"
                          className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:border-brand-500 leading-relaxed text-gray-800 placeholder:text-gray-400"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">Category *</label>
                          <select
                            value={editingProduct.category_id || categories[0]?.id}
                            onChange={(e) => setEditingProduct({ ...editingProduct, category_id: e.target.value })}
                            className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl font-semibold text-gray-800"
                          >
                            {categories.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.icon || '🥦'} {c.name} {c.name_urdu ? `(${c.name_urdu})` : ''}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">Base Price (PKR) *</label>
                          <input
                            type="number"
                            required
                            min={1}
                            value={editingProduct.price ?? 100}
                            onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                            className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">Measurement Unit</label>
                          <select
                            value={editingProduct.unit || 'kg'}
                            onChange={(e) => setEditingProduct({ ...editingProduct, unit: e.target.value })}
                            className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl font-semibold text-gray-800"
                          >
                            <option value="kg">kg (Kilogram)</option>
                            <option value="bunch">bunch (Gucchi)</option>
                            <option value="piece">piece (Dāna)</option>
                            <option value="dozen">dozen (Darjan)</option>
                          </select>
                        </div>
                      </div>

                      {/* Weight Options Chips (Fixed comma bug) */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-gray-700">
                          Weight Selection Chips (Comma Separated)
                        </label>
                        <input
                          type="text"
                          value={weightOptionsString}
                          onChange={(e) => setWeightOptionsString(e.target.value)}
                          placeholder="e.g. 0.25, 0.5, 1, 2, 5"
                          className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl font-mono focus:outline-hidden focus:border-brand-500"
                        />
                        <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                          <span className="text-[11px] text-gray-500 font-medium">Quick add preset:</span>
                          {['0.25', '0.5', '1', '2', '3', '5'].map((w) => (
                            <button
                              key={w}
                              type="button"
                              onClick={() => addQuickWeightTag(w)}
                              className="text-[10px] font-bold bg-slate-100 hover:bg-brand-50 hover:text-brand-700 px-2 py-0.5 rounded-md border border-gray-200 transition-colors"
                            >
                              + {w}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">Stock Quantity</label>
                          <input
                            type="number"
                            min={0}
                            value={editingProduct.stock ?? 50}
                            onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                            className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">Display Badge</label>
                          <input
                            type="text"
                            value={editingProduct.badge || 'Fresh Today'}
                            onChange={(e) => setEditingProduct({ ...editingProduct, badge: e.target.value })}
                            placeholder="e.g. Daily Mandi, Top Seller"
                            className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl"
                          />
                        </div>
                      </div>

                      {/* Toggles */}
                      <div className="flex items-center gap-6 pt-1">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={editingProduct.is_active ?? true}
                            onChange={(e) => setEditingProduct({ ...editingProduct, is_active: e.target.checked })}
                            className="rounded text-brand-600 focus:ring-brand-500 h-4 w-4"
                          />
                          <span className="text-xs font-bold text-gray-800">Publish in Store</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={editingProduct.is_featured ?? false}
                            onChange={(e) => setEditingProduct({ ...editingProduct, is_featured: e.target.checked })}
                            className="rounded text-brand-600 focus:ring-brand-500 h-4 w-4"
                          />
                          <span className="text-xs font-bold text-gray-800">Feature on Front Page</span>
                        </label>
                      </div>
                    </form>

                    {/* Sticky Action Footer Bar (Always accessible without scrolling) */}
                    <div className="sticky bottom-0 bg-white/95 backdrop-blur-xs pt-3 pb-2 sm:pb-0 border-t border-gray-100 flex items-center justify-end gap-2.5 shrink-0 z-10">
                      <button
                        type="button"
                        onClick={() => setEditingProduct(null)}
                        className="flex-1 sm:flex-none px-4 py-2.5 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl cursor-pointer transition-colors text-center"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        form="product-modal-form"
                        className="flex-1 sm:flex-none px-6 py-2.5 text-xs font-black bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-md transition-all cursor-pointer active:scale-98 text-center"
                      >
                        Save Vegetable
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 3: ORDER MANAGER */}
          {/* ============================================================ */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      placeholder="Search by order #, customer name or phone..."
                      className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden"
                    />
                  </div>

                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    aria-label="Filter orders by status"
                    className="py-2 px-3 text-xs bg-gray-50 border border-gray-200 rounded-xl font-semibold text-gray-700"
                  >
                    <option value="all">All Statuses ({orders.length})</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="out_for_delivery">Out for Delivery</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Orders List */}
              <div className="space-y-3">
                {orders
                  .filter((o) => {
                    const matchStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter;
                    const matchQ =
                      !orderSearch.trim() ||
                      o.order_number.toLowerCase().includes(orderSearch.toLowerCase()) ||
                      o.customer_name.toLowerCase().includes(orderSearch.toLowerCase()) ||
                      o.customer_phone.includes(orderSearch);
                    return matchStatus && matchQ;
                  })
                  .map((order) => {
                    const cleanPhone = order.customer_phone.replace(/[^0-9]/g, '');
                    return (
                      <div
                        key={order.id}
                        className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4 hover:border-brand-300 transition-all"
                      >
                        {/* Header row */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
                          <div className="flex items-center gap-3">
                            <span className="text-base font-black text-gray-900 font-mono">
                              {order.order_number}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(order.created_at).toLocaleString('en-PK', {
                                dateStyle: 'medium',
                                timeStyle: 'short',
                              })}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <label className="text-xs font-bold text-gray-600">Status:</label>
                            <select
                              value={order.status}
                              onChange={(e) => handleStatusChange(order.id, e.target.value as any)}
                              aria-label={`Order ${order.order_number} Status`}
                              className={`text-xs font-black px-3 py-1 rounded-xl border appearance-none cursor-pointer ${
                                order.status === 'delivered'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                  : order.status === 'pending'
                                  ? 'bg-amber-50 text-amber-700 border-amber-300'
                                  : order.status === 'cancelled'
                                  ? 'bg-red-50 text-red-700 border-red-300'
                                  : 'bg-blue-50 text-blue-700 border-blue-300'
                              }`}
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="processing">Processing</option>
                              <option value="out_for_delivery">Out for Delivery</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>

                            {/* Print / Download Invoice Modal Launcher */}
                            <button
                              type="button"
                              onClick={() => setSelectedInvoiceOrder(order)}
                              className="bg-gray-800 hover:bg-gray-900 text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>Invoice / PDF</span>
                            </button>

                            {/* Delete Order Button */}
                            <button
                              type="button"
                              onClick={() => requestDeleteOrder(order)}
                              className="p-1.5 rounded-xl text-red-600 hover:bg-red-50 hover:border-red-200 border border-transparent transition-colors cursor-pointer"
                              title="Delete Order Permanently"
                              aria-label={`Delete Order ${order.order_number}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Customer & Address Details */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                          <div className="space-y-1">
                            <div className="font-bold text-gray-500 uppercase text-[10px]">Customer</div>
                            <div className="font-black text-gray-900 text-sm">{order.customer_name}</div>
                            <div className="flex items-center gap-2 pt-0.5">
                              <span className="font-mono text-gray-700">{order.customer_phone}</span>
                              <a
                                href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                                  `Assalam o Alaikum ${order.customer_name}, regarding your I.A Vegetables Order ${order.order_number}...`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-600 hover:text-emerald-700 font-bold inline-flex items-center gap-1"
                                title="Chat on WhatsApp"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span>WhatsApp</span>
                              </a>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="font-bold text-gray-500 uppercase text-[10px]">
                              Delivery Address (Karachi)
                            </div>
                            <div className="font-semibold text-gray-900">{order.delivery_area}</div>
                            <div className="text-gray-600">{order.delivery_address}</div>
                            {order.notes && (
                              <div className="text-[11px] text-amber-800 italic">Note: {order.notes}</div>
                            )}
                          </div>

                          <div className="space-y-1 sm:text-right">
                            <div className="font-bold text-gray-500 uppercase text-[10px]">Payment & Total</div>
                            <div className="font-black text-brand-700 text-base">Rs. {order.total_amount}</div>
                            <div className="text-gray-600">{order.payment_method}</div>
                            <div className="text-[11px] text-gray-500">
                              Delivery Fee: Rs. {order.delivery_fee === 0 ? 'FREE' : order.delivery_fee}
                            </div>
                          </div>
                        </div>

                        {/* Items Ordered List */}
                        {order.items && order.items.length > 0 && (
                          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                            <div className="font-bold text-gray-700 text-[11px] mb-1.5">Vegetables in Order:</div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                              {order.items.map((item, idx) => (
                                <div
                                  key={idx}
                                  className="bg-white p-2 rounded-lg border border-gray-100 flex items-center justify-between text-xs"
                                >
                                  <div>
                                    <span className="font-bold text-gray-900">{item.product_name}</span>
                                    <span className="text-gray-500 text-[11px] ml-1">({item.weight_label})</span>
                                  </div>
                                  <div className="font-mono font-bold text-gray-800">
                                    ×{item.quantity} = Rs. {item.subtotal}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 4: CATEGORY MANAGER */}
          {/* ============================================================ */}
          {activeTab === 'categories' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <div>
                  <h3 className="font-black text-gray-900 text-base">Produce Categories</h3>
                  <p className="text-xs text-gray-500">Organize vegetables into customer-friendly categories</p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setEditingCategory({
                      id: '',
                      name: '',
                      name_urdu: '',
                      slug: '',
                      icon: '🥦',
                      sort_order: categories.length + 1,
                    })
                  }
                  className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-black py-2 px-4 rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Category</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {categories.map((cat) => {
                  const count = products.filter((p) => p.category_id === cat.id).length;
                  return (
                    <div
                      key={cat.id}
                      className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{cat.icon}</span>
                          <div>
                            <h4 className="font-black text-gray-900 text-sm">{cat.name}</h4>
                            <p className="font-urdu text-xs font-semibold text-emerald-800">
                              {cat.name_urdu || '—'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setEditingCategory(cat)}
                            className="p-1 rounded-lg text-brand-600 hover:bg-brand-50 cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => requestDeleteCategory(cat)}
                            className="p-1 rounded-lg text-red-600 hover:bg-red-50 cursor-pointer"
                            title="Delete Category"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                        <span className="text-gray-400">
                          Store Link: <span className="text-gray-600 font-medium font-mono text-[11px]">/shop?cat={cat.slug}</span>
                        </span>
                        <span className="font-bold text-brand-700">{count} vegetable(s)</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Edit Category Modal */}
              {editingCategory && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                      <h3 className="font-black text-gray-900 text-base">
                        {editingCategory.id ? 'Edit Category' : 'Create Category'}
                      </h3>
                      <button
                        type="button"
                        onClick={() => setEditingCategory(null)}
                        className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form onSubmit={handleSaveCategory} className="space-y-3 text-xs">
                      <div>
                        <label className="block font-bold text-gray-700 mb-1">Emoji Icon (Custom or Preset)</label>
                        <div className="flex items-center gap-2 mb-1.5">
                          <input
                            type="text"
                            value={editingCategory.icon || '🥦'}
                            onChange={(e) => setEditingCategory({ ...editingCategory, icon: e.target.value })}
                            placeholder="🥦"
                            className="w-16 px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xl text-center font-bold focus:outline-hidden focus:border-brand-500"
                          />
                          <span className="text-[11px] text-gray-500 leading-tight">
                            Type or paste any custom emoji, or click a preset below:
                          </span>
                        </div>
                        <div className="flex gap-1.5 flex-wrap p-2 bg-gray-50 rounded-xl border border-gray-200">
                          {['🥦', '🥔', '🍅', '🧅', '🥕', '🥬', '🌶️', '🥒', '🧄', '🥗', '🌽', '🍆', '🫑', '🌿', '🌱', '🧺', '📦', '✨'].map((emo) => (
                            <button
                              key={emo}
                              type="button"
                              onClick={() => setEditingCategory({ ...editingCategory, icon: emo })}
                              className="text-base p-1.5 hover:bg-white hover:scale-110 rounded-lg transition-transform border border-transparent hover:border-gray-200 cursor-pointer"
                            >
                              {emo}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-gray-700 mb-1">Category Name (English) *</label>
                        <input
                          type="text"
                          required
                          value={editingCategory.name || ''}
                          onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                          placeholder="e.g. Leafy Greens"
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:border-brand-500"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-gray-700 mb-1">Category Name (Urdu)</label>
                        <input
                          type="text"
                          dir="rtl"
                          value={editingCategory.name_urdu || ''}
                          onChange={(e) => setEditingCategory({ ...editingCategory, name_urdu: e.target.value })}
                          placeholder="e.g. پتے والی سبزیاں"
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-urdu focus:outline-hidden focus:border-brand-500"
                        />
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                        <button
                          type="button"
                          onClick={() => setEditingCategory(null)}
                          className="px-3 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 font-black bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-md cursor-pointer"
                        >
                          Save Category
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 5: HERO & BANNER MANAGER */}
          {/* ============================================================ */}
          {activeTab === 'hero' && (
            <div className="max-w-2xl bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
              <div>
                <h3 className="font-black text-gray-900 text-base">Storefront Hero & Banners</h3>
                <p className="text-xs text-gray-500">Live customization of header ticker, headline, and badges</p>
              </div>

              <form onSubmit={handleSaveHero} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Top Announcement Ticker (Yellow Bar)</label>
                  <input
                    type="text"
                    value={hero.ticker_announcement}
                    onChange={(e) => setHero({ ...hero, ticker_announcement: e.target.value })}
                    placeholder="e.g. 🚚 Free Karachi Delivery on orders above Rs. 1,500!"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Hero Pill Badge</label>
                  <input
                    type="text"
                    value={hero.badge_text}
                    onChange={(e) => setHero({ ...hero, badge_text: e.target.value })}
                    placeholder="e.g. 100% Fresh Daily Harvest • Serving Since 1990"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Main Hero Headline</label>
                  <input
                    type="text"
                    value={hero.headline}
                    onChange={(e) => setHero({ ...hero, headline: e.target.value })}
                    placeholder="e.g. Fresh Farm Vegetables Delivered Across Karachi"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Subheadline Description</label>
                  <textarea
                    rows={3}
                    value={hero.subheadline}
                    onChange={(e) => setHero({ ...hero, subheadline: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="bg-brand-600 hover:bg-brand-700 text-white font-black px-6 py-2.5 rounded-xl shadow-md active:scale-98 transition-all cursor-pointer"
                  >
                    Save Hero Settings
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 6: COUPONS MANAGER */}
          {/* ============================================================ */}
          {activeTab === 'coupons' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <div>
                  <h3 className="font-black text-gray-900 text-base">Promotional Coupons & Vouchers</h3>
                  <p className="text-xs text-gray-500">Configure discount codes for marketing campaigns</p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setEditingCoupon({
                      id: '',
                      code: '',
                      discount_type: 'fixed',
                      discount_value: 100,
                      min_spend: 1000,
                      is_active: true,
                    })
                  }
                  className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-black py-2 px-4 rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Coupon</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {coupons.map((coupon) => (
                  <div
                    key={coupon.id}
                    className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-mono text-base font-black text-brand-800 bg-brand-50 px-3 py-1 rounded-xl border border-brand-200">
                        {coupon.code}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setEditingCoupon(coupon)}
                          className="p-1 text-brand-600 hover:bg-brand-50 rounded-lg cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => requestDeleteCoupon(coupon)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                          title="Delete Coupon Code"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="text-xs space-y-1 text-gray-600">
                      <div>
                        Discount:{' '}
                        <strong className="text-gray-900">
                          {coupon.discount_type === 'percent' || coupon.discount_type === 'percentage'
                            ? `${coupon.discount_value}% OFF`
                            : `Rs. ${coupon.discount_value} OFF`}
                        </strong>
                      </div>
                      <div>
                        Min Spend: <strong className="text-gray-900">Rs. {coupon.min_spend}</strong>
                      </div>
                      <div className="flex items-center gap-1.5 pt-1">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            coupon.is_active ? 'bg-emerald-500' : 'bg-gray-400'
                          }`}
                        ></span>
                        <span className="text-[11px] font-semibold">
                          {coupon.is_active ? 'Active' : 'Disabled'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon Edit Modal */}
              {editingCoupon && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                      <h3 className="font-black text-gray-900 text-base">
                        {editingCoupon.id ? 'Edit Coupon' : 'Create New Coupon'}
                      </h3>
                      <button
                        type="button"
                        onClick={() => setEditingCoupon(null)}
                        className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form onSubmit={handleSaveCoupon} className="space-y-3 text-xs">
                      <div>
                        <label className="block font-bold text-gray-700 mb-1">Coupon Code *</label>
                        <input
                          type="text"
                          required
                          value={editingCoupon.code || ''}
                          onChange={(e) =>
                            setEditingCoupon({ ...editingCoupon, code: e.target.value.toUpperCase() })
                          }
                          placeholder="e.g. TIKTOK10"
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-mono uppercase font-black"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-gray-700 mb-1">Discount Type</label>
                          <select
                            value={editingCoupon.discount_type || 'fixed'}
                            onChange={(e) =>
                              setEditingCoupon({ ...editingCoupon, discount_type: e.target.value as any })
                            }
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-semibold"
                          >
                            <option value="fixed">Fixed PKR (Rs.)</option>
                            <option value="percentage">Percentage (%)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block font-bold text-gray-700 mb-1">Discount Value</label>
                          <input
                            type="number"
                            required
                            min={1}
                            value={editingCoupon.discount_value ?? 100}
                            onChange={(e) =>
                              setEditingCoupon({
                                ...editingCoupon,
                                discount_value: Number(e.target.value),
                              })
                            }
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-gray-700 mb-1">Minimum Spend (PKR)</label>
                        <input
                          type="number"
                          min={0}
                          value={editingCoupon.min_spend ?? 0}
                          onChange={(e) =>
                            setEditingCoupon({ ...editingCoupon, min_spend: Number(e.target.value) })
                          }
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                        />
                      </div>

                      <label className="flex items-center gap-2 cursor-pointer pt-2">
                        <input
                          type="checkbox"
                          checked={editingCoupon.is_active ?? true}
                          onChange={(e) =>
                            setEditingCoupon({ ...editingCoupon, is_active: e.target.checked })
                          }
                          className="rounded text-brand-600 h-4 w-4"
                        />
                        <span className="font-bold text-gray-800">Coupon Active</span>
                      </label>

                      <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                        <button
                          type="button"
                          onClick={() => setEditingCoupon(null)}
                          className="px-3 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 font-black bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-md cursor-pointer"
                        >
                          Save Coupon
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 7: STORE SETTINGS & ACCOUNTS */}
          {/* ============================================================ */}
          {activeTab === 'settings' && (
            <div className="max-w-3xl space-y-6">
              <form onSubmit={handleSaveSettings} className="space-y-6">
                {/* Store Identity */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
                  <h3 className="font-black text-gray-900 text-base pb-2 border-b border-gray-100">
                    Store Identity & Tax Registration
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">Shop Name</label>
                      <input
                        type="text"
                        value={settings.shop_name}
                        onChange={(e) => setSettings({ ...settings, shop_name: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 mb-1">
                        NTN Number (Tax Registration)
                      </label>
                      <input
                        type="text"
                        value={settings.ntn_number}
                        onChange={(e) => setSettings({ ...settings, ntn_number: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 mb-1">Official WhatsApp</label>
                      <input
                        type="text"
                        value={settings.whatsapp_number}
                        onChange={(e) => setSettings({ ...settings, whatsapp_number: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold text-emerald-800"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 mb-1">Phone Number</label>
                      <input
                        type="text"
                        value={settings.phone_number}
                        onChange={(e) => setSettings({ ...settings, phone_number: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-bold text-gray-700 mb-1">Physical Address</label>
                      <input
                        type="text"
                        value={settings.shop_address}
                        onChange={(e) => setSettings({ ...settings, shop_address: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-bold text-gray-700 mb-1">Google Maps Direct URL</label>
                      <input
                        type="text"
                        value={settings.google_maps_url}
                        onChange={(e) => setSettings({ ...settings, google_maps_url: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-mono text-[11px]"
                      />
                    </div>
                  </div>
                </div>

                {/* Delivery Rates & Karachi Zones */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
                  <h3 className="font-black text-gray-900 text-base pb-2 border-b border-gray-100">
                    Delivery Logistics & Karachi Zones
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">Standard Delivery Fee (PKR)</label>
                      <input
                        type="number"
                        value={settings.delivery_fee}
                        onChange={(e) =>
                          setSettings({ ...settings, delivery_fee: Number(e.target.value) })
                        }
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 mb-1">Free Delivery Threshold (PKR)</label>
                      <input
                        type="number"
                        value={settings.free_delivery_threshold}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            free_delivery_threshold: Number(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold text-emerald-800"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-bold text-gray-700 mb-1">
                        Covered Karachi Towns & Areas (Comma-Separated)
                      </label>
                      <textarea
                        rows={3}
                        value={settings.delivery_zones?.join(', ') || ''}
                        onChange={(e) => {
                          const zones = e.target.value.split(',').map((z) => z.trim()).filter(Boolean);
                          setSettings({ ...settings, delivery_zones: zones });
                        }}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono"
                      />
                      <span className="text-[10px] text-gray-500">
                        Customers will select from these areas during checkout.
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Receiving Accounts */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
                  <h3 className="font-black text-gray-900 text-base pb-2 border-b border-gray-100">
                    Customer Payment Receiving Accounts
                  </h3>

                  <div className="space-y-4 text-xs">
                    {/* JazzCash */}
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.payment_methods?.jazzcash_enabled ?? true}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              payment_methods: {
                                ...settings.payment_methods,
                                jazzcash_enabled: e.target.checked,
                              },
                            })
                          }
                          className="rounded text-brand-600 h-4 w-4"
                        />
                        <span className="font-bold text-gray-800">Enable JazzCash Payments</span>
                      </label>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        <input
                          type="text"
                          placeholder="JazzCash Account Title"
                          value={settings.payment_methods?.jazzcash_title || ''}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              payment_methods: {
                                ...settings.payment_methods,
                                jazzcash_title: e.target.value,
                              },
                            })
                          }
                          className="px-3 py-2 bg-white border border-gray-200 rounded-xl"
                        />
                        <input
                          type="text"
                          placeholder="JazzCash Mobile Number"
                          value={settings.payment_methods?.jazzcash_number || ''}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              payment_methods: {
                                ...settings.payment_methods,
                                jazzcash_number: e.target.value,
                              },
                            })
                          }
                          className="px-3 py-2 bg-white border border-gray-200 rounded-xl font-mono"
                        />
                      </div>
                    </div>

                    {/* EasyPaisa */}
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.payment_methods?.easypaisa_enabled ?? true}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              payment_methods: {
                                ...settings.payment_methods,
                                easypaisa_enabled: e.target.checked,
                              },
                            })
                          }
                          className="rounded text-brand-600 h-4 w-4"
                        />
                        <span className="font-bold text-gray-800">Enable EasyPaisa Payments</span>
                      </label>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        <input
                          type="text"
                          placeholder="EasyPaisa Account Title"
                          value={settings.payment_methods?.easypaisa_title || ''}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              payment_methods: {
                                ...settings.payment_methods,
                                easypaisa_title: e.target.value,
                              },
                            })
                          }
                          className="px-3 py-2 bg-white border border-gray-200 rounded-xl"
                        />
                        <input
                          type="text"
                          placeholder="EasyPaisa Mobile Number"
                          value={settings.payment_methods?.easypaisa_number || ''}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              payment_methods: {
                                ...settings.payment_methods,
                                easypaisa_number: e.target.value,
                              },
                            })
                          }
                          className="px-3 py-2 bg-white border border-gray-200 rounded-xl font-mono"
                        />
                      </div>
                    </div>

                    {/* Bank Transfer */}
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.payment_methods?.bank_enabled ?? true}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              payment_methods: {
                                ...settings.payment_methods,
                                bank_enabled: e.target.checked,
                              },
                            })
                          }
                          className="rounded text-brand-600 h-4 w-4"
                        />
                        <span className="font-bold text-gray-800">Enable Direct Bank Transfer</span>
                      </label>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                        <input
                          type="text"
                          placeholder="Bank Name (e.g. Meezan Bank)"
                          value={settings.payment_methods?.bank_name || ''}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              payment_methods: {
                                ...settings.payment_methods,
                                bank_name: e.target.value,
                              },
                            })
                          }
                          className="px-3 py-2 bg-white border border-gray-200 rounded-xl"
                        />
                        <input
                          type="text"
                          placeholder="Account Title"
                          value={settings.payment_methods?.bank_title || ''}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              payment_methods: {
                                ...settings.payment_methods,
                                bank_title: e.target.value,
                              },
                            })
                          }
                          className="px-3 py-2 bg-white border border-gray-200 rounded-xl"
                        />
                        <input
                          type="text"
                          placeholder="Account / IBAN Number"
                          value={settings.payment_methods?.bank_account || ''}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              payment_methods: {
                                ...settings.payment_methods,
                                bank_account: e.target.value,
                              },
                            })
                          }
                          className="px-3 py-2 bg-white border border-gray-200 rounded-xl font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Master Security PIN Change */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-3">
                  <h3 className="font-black text-gray-900 text-base pb-2 border-b border-gray-100">
                    Master Admin PIN
                  </h3>
                  <div className="text-xs">
                    <label className="block font-bold text-gray-700 mb-1">Update Security PIN</label>
                    <input
                      type="text"
                      value={settings.admin_pin}
                      onChange={(e) => setSettings({ ...settings, admin_pin: e.target.value })}
                      className="w-full sm:w-80 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-mono tracking-wider font-bold"
                    />
                    <p className="text-[10px] text-gray-500 mt-1">
                      Used to unlock this Admin Portal. Default: <code>admi@iavegetables123@#</code>
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="bg-brand-600 hover:bg-brand-700 text-white font-black text-sm px-8 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer"
                  >
                    Save Store Settings
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>

      {/* Printable / Downloadable Invoice Modal Launcher */}
      <InvoiceModal
        order={selectedInvoiceOrder}
        settings={settings}
        onClose={() => setSelectedInvoiceOrder(null)}
      />

      {/* Modern In-App Delete Confirmation Modal (Replaces browser native "localhost" alerts) */}
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        title={
          deleteTarget?.type === 'product'
            ? 'Delete Vegetable Produce?'
            : deleteTarget?.type === 'category'
            ? 'Delete Category?'
            : deleteTarget?.type === 'coupon'
            ? 'Delete Coupon Code?'
            : 'Delete Customer Order?'
        }
        itemName={deleteTarget?.name}
        itemType={deleteTarget?.type}
        description={
          deleteTarget?.type === 'order'
            ? 'This customer order and all its items will be permanently erased from Supabase and order records.'
            : deleteTarget?.type === 'category'
            ? 'This category will be permanently removed from your catalog and Supabase. Associated vegetables will be safely re-assigned.'
            : deleteTarget?.type === 'product'
            ? 'This vegetable will be permanently deleted from your storefront catalog, search index, and database.'
            : 'This coupon discount code will be removed from database and can no longer be redeemed by customers.'
        }
        isDeleting={isDeleting}
        onConfirm={confirmDelete}
        onClose={() => {
          if (!isDeleting) setDeleteTarget(null);
        }}
      />
    </div>
  );
}
