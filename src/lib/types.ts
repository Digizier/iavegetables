export interface Category {
  id: string;
  name: string;
  name_urdu?: string;
  slug: string;
  icon?: string;
  description?: string;
  sort_order?: number;
  created_at?: string;
}

export interface Product {
  id: string;
  category_id?: string;
  name: string;
  name_urdu?: string;
  slug: string;
  description?: string;
  price: number; // Base price per unit (e.g. per kg)
  unit: string; // 'kg', 'bunch', 'pack', 'crate'
  weight_options: string[]; // e.g. ["0.5", "1", "2", "5"]
  stock: number;
  is_active: boolean;
  is_featured: boolean;
  badge?: string; // 'Fresh Today', 'Best Seller', etc.
  thumbnail_url: string;
  images?: string[]; // Array of image URLs for gallery / multiple photos
  created_at?: string;
}

export interface OrderItem {
  id?: string;
  order_id?: string;
  product_id?: string;
  product_name: string;
  quantity: number;
  weight_label: string;
  unit_price: number;
  subtotal: number;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  delivery_area: string;
  delivery_fee: number;
  discount_amount: number;
  coupon_code?: string;
  total_amount: number;
  payment_method: string;
  status: 'pending' | 'confirmed' | 'processing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  notes?: string;
  created_at: string;
  items?: OrderItem[];
}

export interface PaymentMethodsConfig {
  cod_enabled: boolean;
  jazzcash_enabled: boolean;
  jazzcash_title: string;
  jazzcash_number: string;
  easypaisa_enabled: boolean;
  easypaisa_title: string;
  easypaisa_number: string;
  bank_enabled: boolean;
  bank_name: string;
  bank_title: string;
  bank_account: string;
  bank_iban?: string;
}

export interface ShopSettings {
  id: string;
  shop_name: string;
  shop_subtitle: string;
  ntn_number: string;
  phone_number: string;
  whatsapp_number: string;
  shop_address: string;
  google_maps_url: string;
  plus_code: string;
  latitude: number;
  longitude: number;
  delivery_fee: number;
  free_delivery_threshold: number;
  delivery_zones: string[];
  payment_methods: PaymentMethodsConfig;
  admin_pin: string;
  updated_at?: string;
}

export interface HeroBanner {
  id: string;
  headline: string;
  subheadline: string;
  ticker_announcement: string;
  badge_text: string;
  updated_at?: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: 'fixed' | 'percentage' | 'percent';
  discount_value: number;
  min_spend: number;
  is_active: boolean;
}

export interface CartItem {
  product: Product;
  selectedWeight: string; // e.g. "1" or "0.5"
  unitPrice: number; // calculated price for selectedWeight
  quantity: number; // how many packs of that weight
}
