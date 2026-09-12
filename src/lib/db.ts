import { supabase } from './supabase';
import { Product, Category, Order, OrderItem, ShopSettings, HeroBanner, Coupon, CartItem } from './types';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_SETTINGS, INITIAL_HERO, INITIAL_COUPONS } from './seedData';

const STORAGE_KEYS = {
  PRODUCTS: 'ia_products_data_v1',
  CATEGORIES: 'ia_categories_data_v1',
  SETTINGS: 'ia_shop_settings_v1',
  HERO: 'ia_hero_banner_v1',
  COUPONS: 'ia_coupons_data_v1',
  ORDERS: 'ia_orders_data_v1',
  CART: 'ia_cart_items_v1',
  ADMIN_AUTH: 'ia_admin_auth_session'
};

const dispatchEvent = (name: string, detail?: any) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(name, { detail }));
  }
};

async function fetchWithTimeout(promise: any, timeoutMs = 3500): Promise<any> {
  let timer: any;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('Supabase request timeout')), timeoutMs);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timer);
  }
}

// ==========================================
// CATEGORIES
// ==========================================
export function getLocalCategories(): Category[] {
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (raw) {
      try {
        const local = JSON.parse(raw);
        if (Array.isArray(local) && local.length > 0) return local;
      } catch (e) {}
    }
  }
  return INITIAL_CATEGORIES;
}

export async function getCategories(): Promise<Category[]> {
  try {
    const fetchPromise = supabase
      .from('categories')
      .select('id, name, name_urdu, slug, icon, sort_order')
      .order('sort_order', { ascending: true });

    const { data, error } = await fetchWithTimeout(fetchPromise as any, 3500);

    if (!error && data && data.length > 0) {
      const categories = data as Category[];
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
        dispatchEvent('ia_categories_updated', categories);
      }
      return categories;
    }
  } catch (err) {
    // Graceful fallback to local cache
  }

  return getLocalCategories();
}

export async function adminSaveCategory(category: Partial<Category>): Promise<Category> {
  const current = await getCategories();
  let updated: Category;

  // Auto-generate clean slug from name if empty
  const autoSlug = (category.name || 'category')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || `cat-${Date.now()}`;

  if (category.id) {
    const index = current.findIndex(c => c.id === category.id);
    updated = {
      ...(current[index] || {}),
      ...category,
      slug: category.slug || current[index]?.slug || autoSlug,
    } as Category;
  } else {
    const id = `cat-${Date.now()}`;
    updated = {
      id,
      name: category.name || 'New Category',
      name_urdu: category.name_urdu || '',
      slug: autoSlug,
      icon: category.icon || '🥦',
      sort_order: category.sort_order ?? (current.length + 1),
    };
  }

  // 1. Sync Local immediately for instantaneous UI reaction
  if (typeof window !== 'undefined') {
    const nextList = category.id 
      ? current.map(c => c.id === updated.id ? updated : c)
      : [...current, updated];
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(nextList));
    dispatchEvent('ia_categories_updated', nextList);
  }

  // 2. Sync Supabase
  try {
    await supabase.from('categories').upsert({
      id: updated.id,
      name: updated.name,
      name_urdu: updated.name_urdu,
      slug: updated.slug,
      icon: updated.icon,
      sort_order: updated.sort_order,
    });
  } catch (err) {
    console.warn('Supabase upsert category error:', err);
  }

  return updated;
}

export async function adminDeleteCategory(id: string): Promise<boolean> {
  // 1. Sync Local immediately
  if (typeof window !== 'undefined') {
    const current = await getCategories();
    const nextList = current.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(nextList));
    dispatchEvent('ia_categories_updated', nextList);

    // Update any local products assigned to this category to fallback cat-1
    const prods = await getAllProductsAdmin();
    const updatedProds = prods.map(p => p.category_id === id ? { ...p, category_id: 'cat-1' } : p);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updatedProds));
    dispatchEvent('ia_products_updated', updatedProds);
  }

  // 2. Sync Supabase
  try {
    await supabase.from('products').update({ category_id: 'cat-1' }).eq('category_id', id);
    await supabase.from('categories').delete().eq('id', id);
  } catch (err) {
    console.warn('Supabase delete category error:', err);
  }

  return true;
}

// ==========================================
// PRODUCTS
// ==========================================
export function getLocalProducts(): Product[] {
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (raw) {
      try {
        const local = JSON.parse(raw);
        if (Array.isArray(local) && local.length > 0) return local.filter((p: any) => p.is_active);
      } catch (e) {}
    }
  }
  return INITIAL_PRODUCTS;
}

export async function getProducts(): Promise<Product[]> {
  try {
    const fetchPromise = supabase
      .from('products')
      .select('id, category_id, name, name_urdu, slug, description, price, unit, weight_options, stock, is_active, is_featured, badge, thumbnail_url, images')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    const { data, error } = await fetchWithTimeout(fetchPromise as any, 4000);

    if (!error && data && data.length > 0) {
      const products = data as Product[];
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
        dispatchEvent('ia_products_updated', products);
      }
      return products;
    }
  } catch (err) {
    // Graceful fallback to local cache
  }

  return getLocalProducts();
}

export async function getAllProductsAdmin(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('id, category_id, name, name_urdu, slug, description, price, unit, weight_options, stock, is_active, is_featured, badge, thumbnail_url, images')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      const products = data as Product[];
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
      }
      return products;
    }
  } catch (err) {
    console.warn('Supabase admin products error:', err);
  }

  // Fallback to local storage or defaults ONLY if Supabase is unreachable
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (raw) {
      try {
        const local = JSON.parse(raw);
        if (Array.isArray(local) && local.length > 0) return local;
      } catch (e) {}
    }
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
  }
  return INITIAL_PRODUCTS;
}

export async function adminSaveProduct(product: Partial<Product>): Promise<Product> {
  const current = await getAllProductsAdmin();
  let updated: Product;

  const autoSlug = (product.name || 'vegetable')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || `prod-${Date.now()}`;

  const initialThumb = product.thumbnail_url || product.images?.[0] || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80';
  const initialImages = product.images && product.images.length > 0 ? product.images : [initialThumb];

  if (product.id) {
    const index = current.findIndex(p => p.id === product.id);
    updated = {
      ...(current[index] || {}),
      ...product,
      slug: product.slug || current[index]?.slug || autoSlug,
      thumbnail_url: product.thumbnail_url || product.images?.[0] || current[index]?.thumbnail_url || initialThumb,
      images: initialImages,
    } as Product;
  } else {
    updated = {
      id: `prod-${Date.now()}`,
      category_id: product.category_id || 'cat-1',
      name: product.name || 'Fresh Vegetable',
      name_urdu: product.name_urdu || '',
      slug: autoSlug,
      description: product.description || '',
      price: product.price ?? 100,
      unit: product.unit || 'kg',
      weight_options: product.weight_options && product.weight_options.length > 0 ? product.weight_options : ['0.5', '1', '2', '5'],
      stock: product.stock ?? 100,
      is_active: product.is_active ?? true,
      is_featured: product.is_featured ?? false,
      badge: product.badge || 'Fresh Today',
      thumbnail_url: initialThumb,
      images: initialImages,
    };
  }

  // 1. Sync Local immediately
  if (typeof window !== 'undefined') {
    const nextList = product.id
      ? current.map(p => p.id === updated.id ? updated : p)
      : [updated, ...current];
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(nextList));
    dispatchEvent('ia_products_updated', nextList);
  }

  // 2. Sync Supabase
  try {
    await supabase.from('products').upsert({
      id: updated.id,
      category_id: updated.category_id,
      name: updated.name,
      name_urdu: updated.name_urdu,
      slug: updated.slug,
      description: updated.description,
      price: updated.price,
      unit: updated.unit,
      weight_options: updated.weight_options,
      stock: updated.stock,
      is_active: updated.is_active,
      is_featured: updated.is_featured,
      badge: updated.badge,
      thumbnail_url: updated.thumbnail_url,
      images: updated.images
    });
  } catch (err) {
    console.warn('Supabase upsert product error:', err);
  }

  return updated;
}

export async function adminDeleteProduct(id: string): Promise<boolean> {
  // 1. Sync Local immediately
  if (typeof window !== 'undefined') {
    const current = await getAllProductsAdmin();
    const nextList = current.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(nextList));
    dispatchEvent('ia_products_updated', nextList);
  }

  // 2. Sync Supabase
  try {
    await supabase.from('products').delete().eq('id', id);
  } catch (err) {
    console.warn('Supabase delete product error:', err);
  }

  return true;
}

export async function adminBulkUpdatePrices(updates: { id: string; price: number }[]): Promise<boolean> {
  if (!updates || updates.length === 0) return true;

  // 1. Sync Local storage immediately so UI and client pages reflect changes instantly
  if (typeof window !== 'undefined') {
    const current = await getAllProductsAdmin();
    const updateMap = new Map(updates.map(u => [u.id, u.price]));
    const nextList = current.map(p => {
      if (updateMap.has(p.id)) {
        return { ...p, price: updateMap.get(p.id)! };
      }
      return p;
    });
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(nextList));
    dispatchEvent('ia_products_updated', nextList);
  }

  // 2. Sync to Supabase in parallel batches
  try {
    const chunkSize = 15;
    for (let i = 0; i < updates.length; i += chunkSize) {
      const chunk = updates.slice(i, i + chunkSize);
      await Promise.all(
        chunk.map(u =>
          supabase
            .from('products')
            .update({ price: u.price })
            .eq('id', u.id)
        )
      );
    }
  } catch (err) {
    console.warn('Supabase bulk update prices error:', err);
  }

  return true;
}

// ==========================================
// SHOP SETTINGS
// ==========================================
export function getLocalSettings(): ShopSettings {
  if (typeof window !== 'undefined') {
    const local = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (local) {
      try { return JSON.parse(local); } catch (e) {}
    }
  }
  return INITIAL_SETTINGS;
}

export async function getShopSettings(): Promise<ShopSettings> {
  try {
    const fetchPromise = supabase
      .from('shop_settings')
      .select('id, shop_name, shop_subtitle, ntn_number, phone_number, whatsapp_number, shop_address, google_maps_url, plus_code, latitude, longitude, delivery_fee, free_delivery_threshold, delivery_zones, payment_methods, admin_pin')
      .eq('id', 'main_settings')
      .single();

    const { data, error } = await fetchWithTimeout(fetchPromise as any, 3500);

    if (!error && data) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data));
        dispatchEvent('ia_settings_updated', data);
      }
      return data as ShopSettings;
    }
  } catch (err) {
    // Graceful fallback to local cache
  }

  return getLocalSettings();
}

export async function adminSaveSettings(settings: Partial<ShopSettings>): Promise<ShopSettings> {
  const current = await getShopSettings();
  const updated: ShopSettings = { ...current, ...settings, id: 'main_settings' };

  try {
    await supabase.from('shop_settings').upsert({
      id: 'main_settings',
      shop_name: updated.shop_name,
      shop_subtitle: updated.shop_subtitle,
      ntn_number: updated.ntn_number,
      phone_number: updated.phone_number,
      whatsapp_number: updated.whatsapp_number,
      shop_address: updated.shop_address,
      google_maps_url: updated.google_maps_url,
      plus_code: updated.plus_code,
      latitude: updated.latitude,
      longitude: updated.longitude,
      delivery_fee: updated.delivery_fee,
      free_delivery_threshold: updated.free_delivery_threshold,
      delivery_zones: updated.delivery_zones,
      payment_methods: updated.payment_methods,
      admin_pin: updated.admin_pin
    });
  } catch (err) {
    console.warn('Supabase settings upsert error:', err);
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    dispatchEvent('ia_settings_updated', updated);
  }

  return updated;
}

// ==========================================
// HERO BANNER
// ==========================================
export function getLocalHeroBanner(): HeroBanner {
  if (typeof window !== 'undefined') {
    const local = localStorage.getItem(STORAGE_KEYS.HERO);
    if (local) {
      try { return JSON.parse(local); } catch (e) {}
    }
  }
  return INITIAL_HERO;
}

export async function getHeroBanner(): Promise<HeroBanner> {
  try {
    const fetchPromise = supabase
      .from('hero_banners')
      .select('id, headline, subheadline, ticker_announcement, badge_text')
      .eq('id', 'main_hero')
      .single();

    const { data, error } = await fetchWithTimeout(fetchPromise as any, 3500);

    if (!error && data) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.HERO, JSON.stringify(data));
        dispatchEvent('ia_hero_updated', data);
      }
      return data as HeroBanner;
    }
  } catch (err) {}

  return getLocalHeroBanner();
}

export async function adminSaveHero(hero: Partial<HeroBanner>): Promise<HeroBanner> {
  const current = await getHeroBanner();
  const updated: HeroBanner = { ...current, ...hero, id: 'main_hero' };

  try {
    await supabase.from('hero_banners').upsert({
      id: 'main_hero',
      headline: updated.headline,
      subheadline: updated.subheadline,
      ticker_announcement: updated.ticker_announcement,
      badge_text: updated.badge_text
    });
  } catch (err) {}

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.HERO, JSON.stringify(updated));
    dispatchEvent('ia_hero_updated', updated);
  }

  return updated;
}

// ==========================================
// COUPONS
// ==========================================
export async function getCoupons(): Promise<Coupon[]> {
  try {
    const { data, error } = await supabase
      .from('coupons')
      .select('id, code, discount_type, discount_value, min_spend, is_active')
      .eq('is_active', true);

    if (!error && data && data.length > 0) {
      return data as Coupon[];
    }
  } catch (err) {}

  if (typeof window !== 'undefined') {
    const local = localStorage.getItem(STORAGE_KEYS.COUPONS);
    if (local) {
      try { return JSON.parse(local); } catch (e) {}
    }
  }
  return INITIAL_COUPONS;
}

export async function adminSaveCoupon(coupon: Partial<Coupon>): Promise<Coupon> {
  const current = await getCoupons();
  const updated: Coupon = {
    id: coupon.id || `c-${Date.now()}`,
    code: (coupon.code || 'PROMO').toUpperCase().trim(),
    discount_type: coupon.discount_type || 'fixed',
    discount_value: coupon.discount_value || 100,
    min_spend: coupon.min_spend || 0,
    is_active: coupon.is_active ?? true
  };

  try {
    await supabase.from('coupons').upsert(updated);
  } catch (err) {}

  if (typeof window !== 'undefined') {
    const nextList = coupon.id 
      ? current.map(c => c.id === updated.id ? updated : c)
      : [...current, updated];
    localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(nextList));
    dispatchEvent('ia_coupons_updated', nextList);
  }

  return updated;
}

export async function adminDeleteCoupon(id: string): Promise<boolean> {
  try {
    await supabase.from('coupons').delete().eq('id', id);
  } catch (err) {}

  if (typeof window !== 'undefined') {
    const current = await getCoupons();
    const nextList = current.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(nextList));
    dispatchEvent('ia_coupons_updated', nextList);
  }
  return true;
}

// ==========================================
// ORDERS
// ==========================================
export async function getOrders(): Promise<Order[]> {
  try {
    // 1. Direct PostgREST relationship query
    const { data, error } = await supabase
      .from('orders')
      .select('id, order_number, customer_name, customer_phone, delivery_address, delivery_area, delivery_fee, discount_amount, coupon_code, total_amount, payment_method, status, notes, created_at, order_items(id, product_name, quantity, weight_label, unit_price, subtotal)')
      .order('created_at', { ascending: false });

    if (!error && data) {
      const orders = data.map((o: any) => ({
        ...o,
        items: o.order_items || []
      })) as Order[];

      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
      }
      return orders;
    }

    // 2. Resilient Fallback: If PostgREST join encounters schema cache latency, query tables separately
    console.warn('Supabase join query issue, running 2-step select:', error?.message);
    const { data: rawOrders, error: ordersErr } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (!ordersErr && rawOrders) {
      const orderIds = rawOrders.map((o: any) => o.id);
      let items: any[] = [];
      if (orderIds.length > 0) {
        const { data: rawItems } = await supabase
          .from('order_items')
          .select('*')
          .in('order_id', orderIds);
        items = rawItems || [];
      }

      let orders = rawOrders.map((o: any) => ({
        ...o,
        items: items.filter((item: any) => item.order_id === o.id)
      })) as Order[];

      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
      }
      return orders;
    }
  } catch (err) {
    console.warn('Supabase getOrders error:', err);
  }

  // Fallback to local storage if offline
  if (typeof window !== 'undefined') {
    const local = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (local) {
      try { return JSON.parse(local); } catch (e) {}
    }
  }
  return [];
}

export async function createOrder(
  orderInput: Omit<Order, 'id' | 'created_at' | 'items'>,
  items: CartItem[]
): Promise<Order> {
  const newOrder: Order = {
    ...orderInput,
    id: `ord-${Date.now()}`,
    created_at: new Date().toISOString(),
    items: items.map(item => ({
      product_name: item.product.name,
      quantity: item.quantity,
      weight_label: `${item.selectedWeight} ${item.product.unit}`,
      unit_price: item.unitPrice,
      subtotal: item.unitPrice * item.quantity
    }))
  };

  // 1. Insert into Supabase
  try {
    const { data: orderData, error: orderErr } = await supabase
      .from('orders')
      .insert({
        order_number: newOrder.order_number,
        customer_name: newOrder.customer_name,
        customer_phone: newOrder.customer_phone,
        delivery_address: newOrder.delivery_address,
        delivery_area: newOrder.delivery_area,
        delivery_fee: newOrder.delivery_fee,
        discount_amount: newOrder.discount_amount,
        coupon_code: newOrder.coupon_code,
        total_amount: newOrder.total_amount,
        payment_method: newOrder.payment_method,
        status: newOrder.status,
        notes: newOrder.notes
      })
      .select('id')
      .single();

    if (!orderErr && orderData?.id) {
      newOrder.id = orderData.id;

      // Insert Order Items
      const itemsPayload = items.map(item => ({
        order_id: orderData.id,
        product_id: item.product.id && !item.product.id.startsWith('prod-') ? item.product.id : null,
        product_name: item.product.name,
        quantity: item.quantity,
        weight_label: `${item.selectedWeight} ${item.product.unit}`,
        unit_price: item.unitPrice,
        subtotal: item.unitPrice * item.quantity
      }));

      await supabase.from('order_items').insert(itemsPayload);
    }
  } catch (err) {
    console.warn('Supabase createOrder error, saved locally:', err);
  }

  // 2. Save locally
  if (typeof window !== 'undefined') {
    const current = await getOrders();
    const nextList = [newOrder, ...current.filter(o => o.id !== newOrder.id && o.order_number !== newOrder.order_number)];
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(nextList));
    dispatchEvent('ia_orders_updated', nextList);
  }

  return newOrder;
}

export async function adminUpdateOrderStatus(id: string, status: Order['status']): Promise<boolean> {
  try {
    await supabase.from('orders').update({ status }).eq('id', id);
  } catch (err) {}

  if (typeof window !== 'undefined') {
    const current = await getOrders();
    const nextList = current.map(o => o.id === id ? { ...o, status } : o);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(nextList));
    dispatchEvent('ia_orders_updated', nextList);
  }
  return true;
}

export async function adminDeleteOrder(id: string): Promise<boolean> {
  // 1. Sync Local immediately
  if (typeof window !== 'undefined') {
    const current = await getOrders();
    const nextList = current.filter(o => o.id !== id);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(nextList));
    dispatchEvent('ia_orders_updated', nextList);
  }

  // 2. Sync Supabase: delete order_items first, then the order
  try {
    await supabase.from('order_items').delete().eq('order_id', id);
    const { error } = await supabase.from('orders').delete().eq('id', id);
    if (error) {
      console.warn('Supabase delete order error:', error);
    }
  } catch (err) {
    console.warn('Supabase delete order exception:', err);
  }

  return true;
}

// ==========================================
// CART STATE HELPER (CLIENT SIDE ONLY)
// ==========================================
export function getLocalCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CART);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveLocalCart(items: CartItem[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(items));
  dispatchEvent('ia_cart_updated', items);
}

// ==========================================
// ADMIN AUTH SESSION
// ==========================================
export function isAdminAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(STORAGE_KEYS.ADMIN_AUTH) === 'true';
}

export function setAdminAuthenticated(auth: boolean) {
  if (typeof window === 'undefined') return;
  if (auth) {
    sessionStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'true');
  } else {
    sessionStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
  }
}

// ==========================================
// APPLIED COUPON PERSISTENCE
// ==========================================
export function getAppliedCoupon(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('ia_applied_coupon') || '';
}

export function setAppliedCoupon(code: string) {
  if (typeof window === 'undefined') return;
  if (code) {
    localStorage.setItem('ia_applied_coupon', code.toUpperCase().trim());
    dispatchEvent('ia_coupon_applied', code.toUpperCase().trim());
  } else {
    localStorage.removeItem('ia_applied_coupon');
    dispatchEvent('ia_coupon_applied', '');
  }
}

