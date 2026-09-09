'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShoppingBag, 
  MapPin, 
  Phone, 
  User, 
  CreditCard, 
  Truck, 
  CheckCircle2, 
  ArrowLeft, 
  MessageCircle, 
  ShieldCheck, 
  Tag, 
  Info,
  AlertCircle
} from 'lucide-react';
import { getLocalCart, saveLocalCart, getShopSettings, getCoupons, createOrder, getAppliedCoupon, setAppliedCoupon as persistCoupon } from '../../lib/db';
import { CartItem, ShopSettings, Coupon, Order } from '../../lib/types';
import { INITIAL_SETTINGS } from '../../lib/seedData';
import OrderConfirmationModal from '../../components/OrderConfirmationModal';

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [settings, setSettings] = useState<ShopSettings>(INITIAL_SETTINGS);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [altPhone, setAltPhone] = useState('');
  const [area, setArea] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'jazzcash' | 'easypaisa' | 'bank'>('cod');

  // Coupon states
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');

  // Validation errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const items = getLocalCart();
    setCart(items);

    Promise.all([getShopSettings(), getCoupons()]).then(([settData, coupData]) => {
      setSettings(settData);
      setCoupons(coupData);
      if (settData.delivery_zones && settData.delivery_zones.length > 0) {
        setArea(settData.delivery_zones[0]);
      }

      // Automatically restore coupon applied in cart drawer!
      const savedCode = getAppliedCoupon();
      if (savedCode) {
        const found = coupData.find(c => c.code.toUpperCase() === savedCode.toUpperCase() && c.is_active);
        if (found) {
          setAppliedCoupon(found);
          setCouponCode(found.code);
        }
      }

      setLoading(false);
    });

    const handleCartUpdate = (e: any) => {
      setCart(e.detail || []);
    };
    window.addEventListener('ia_cart_updated', handleCartUpdate);
    return () => window.removeEventListener('ia_cart_updated', handleCartUpdate);
  }, []);

  // Calculations
  const subtotal = cart.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
  const isFreeDelivery = subtotal >= (settings.free_delivery_threshold || 1500);
  const deliveryFee = isFreeDelivery ? 0 : (settings.delivery_fee || 150);

  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discount_type === 'percentage' || appliedCoupon.discount_type === 'percent') {
      discount = Math.round((subtotal * appliedCoupon.discount_value) / 100);
    } else {
      discount = appliedCoupon.discount_value;
    }
    if (discount > subtotal) discount = subtotal;
  }

  const grandTotal = Math.max(0, subtotal - discount + deliveryFee);

  const handleApplyCoupon = () => {
    setCouponError('');
    if (!couponCode.trim()) return;

    const code = couponCode.trim().toUpperCase();
    const found = coupons.find((c) => c.code.toUpperCase() === code && c.is_active);

    if (!found) {
      setCouponError('Invalid or expired coupon code');
      return;
    }

    if (found.min_spend && subtotal < found.min_spend) {
      setCouponError(`Minimum spend for this coupon is Rs. ${found.min_spend}`);
      return;
    }

    setAppliedCoupon(found);
    persistCoupon(found.code);
    setCouponError('');
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
    persistCoupon('');
  };

  const validateForm = () => {
    const err: { [key: string]: string } = {};
    if (!name.trim()) err.name = 'Please enter your full name';
    if (!phone.trim()) {
      err.phone = 'Please enter your mobile/WhatsApp number';
    } else if (phone.replace(/[^0-9]/g, '').length < 10) {
      err.phone = 'Please enter a valid Pakistani phone number';
    }
    if (!area) err.area = 'Please select your delivery town/area in Karachi';
    if (!address.trim()) err.address = 'Please enter your complete delivery street address';

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (cart.length === 0) return;

    setSubmitting(true);

    try {
      const orderNumber = `IAV-${Math.floor(100000 + Math.random() * 900000)}`;

      const orderPayload = {
        order_number: orderNumber,
        customer_name: name.trim(),
        customer_phone: phone.trim(),
        delivery_address: address.trim(),
        delivery_area: area,
        delivery_fee: deliveryFee,
        discount_amount: discount,
        coupon_code: appliedCoupon ? appliedCoupon.code : undefined,
        total_amount: grandTotal,
        payment_method: paymentMethod === 'cod' ? 'Cash on Delivery (COD)' :
          paymentMethod === 'jazzcash' ? 'JazzCash' :
          paymentMethod === 'easypaisa' ? 'EasyPaisa' : 'Direct Bank Transfer',
        status: 'pending' as const,
        notes: notes.trim() ? `${notes.trim()}${altPhone ? ` | Alt: ${altPhone}` : ''}` : (altPhone ? `Alt: ${altPhone}` : undefined)
      };

      const placedOrder = await createOrder(orderPayload, cart);

      // Clear Cart
      saveLocalCart([]);
      setCart([]);

      // Trigger confirmation modal
      setConfirmedOrder(placedOrder);
    } catch (err) {
      console.error('Failed to submit order:', err);
      alert('An error occurred while saving your order. Please retry or contact us directly on WhatsApp.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-gray-500 text-sm">
        Preparing your checkout...
      </div>
    );
  }

  // Empty cart view
  if (cart.length === 0 && !confirmedOrder) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl">
          🛒
        </div>
        <h2 className="text-2xl font-black text-gray-900">Your basket is currently empty</h2>
        <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto">
          Explore our fresh mandi harvest and add hand-picked Karachi vegetables to your basket before checkout.
        </p>
        <div className="pt-2">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-md transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Browse Fresh Vegetables</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
      {/* Breadcrumb Navigation */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/shop"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-brand-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalog</span>
        </Link>
        <span className="text-xs font-semibold text-brand-700 bg-brand-50 px-3 py-1 rounded-full">
          Safe & Secure Checkout
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Customer & Delivery Details Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSubmitOrder} id="checkout-form" className="space-y-6">
            {/* Step 1: Contact Details */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-gray-100 space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100">
                <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-black text-xs">
                  1
                </div>
                <h2 className="font-black text-gray-900 text-base">Contact Information</h2>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., Muhammad Usman"
                      className={`w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm bg-gray-50 border rounded-xl focus:outline-hidden focus:ring-1 ${
                        errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-brand-500 focus:ring-brand-500'
                      }`}
                    />
                  </div>
                  {errors.name && <p className="text-[11px] text-red-500 mt-1">{errors.name}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Phone / WhatsApp <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="0341 1234567"
                        className={`w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm bg-gray-50 border rounded-xl focus:outline-hidden focus:ring-1 ${
                          errors.phone ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-brand-500 focus:ring-brand-500'
                        }`}
                      />
                    </div>
                    {errors.phone && <p className="text-[11px] text-red-500 mt-1">{errors.phone}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Alternate Phone <span className="text-gray-400 text-[10px]">(Optional)</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        value={altPhone}
                        onChange={(e) => setAltPhone(e.target.value)}
                        placeholder="0300 1234567"
                        className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Karachi Delivery Address */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-gray-100 space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100">
                <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-black text-xs">
                  2
                </div>
                <h2 className="font-black text-gray-900 text-base">Karachi Delivery Destination</h2>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Town / Area <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    required
                    aria-label="Karachi Area or Town"
                    className="w-full py-2.5 px-3 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl font-semibold text-gray-800 focus:outline-hidden focus:border-brand-500"
                  >
                    {settings.delivery_zones?.map((zone) => (
                      <option key={zone} value={zone}>
                        {zone} (Karachi)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Street Address & House / Flat No. <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <textarea
                      rows={2}
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g., Flat # 402, Al-Rehman Heights, Near Bilawal Chowrangi..."
                      className={`w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-gray-50 border rounded-xl focus:outline-hidden focus:ring-1 ${
                        errors.address ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-brand-500 focus:ring-brand-500'
                      }`}
                    />
                  </div>
                  {errors.address && <p className="text-[11px] text-red-500 mt-1">{errors.address}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Special Instructions / Landmark <span className="text-gray-400 text-[10px]">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g., Call before reaching, near green gate"
                    className="w-full px-3 py-2.5 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Payment Method */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-gray-100 space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100">
                <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-black text-xs">
                  3
                </div>
                <h2 className="font-black text-gray-900 text-base">Payment Method</h2>
              </div>

              <div className="space-y-3">
                {/* Cash on Delivery */}
                <label className={`block p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'cod' ? 'border-brand-600 bg-brand-50/50' : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                        className="text-brand-600 focus:ring-brand-500"
                      />
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-gray-900">Cash on Delivery (COD)</div>
                        <div className="text-[11px] text-gray-500">Pay cash upon inspecting fresh vegetables at your door</div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-brand-700 bg-brand-100/60 px-2.5 py-0.5 rounded-full">Recommended</span>
                  </div>
                </label>

                {/* JazzCash */}
                {settings.payment_methods?.jazzcash_enabled && (
                  <label className={`block p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                    paymentMethod === 'jazzcash' ? 'border-brand-600 bg-brand-50/50' : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'jazzcash'}
                        onChange={() => setPaymentMethod('jazzcash')}
                        className="text-brand-600 focus:ring-brand-500 mt-1"
                      />
                      <div className="space-y-1">
                        <div className="text-xs sm:text-sm font-bold text-gray-900">JazzCash Transfer</div>
                        <div className="text-[11px] text-gray-600">
                          Account Title: <strong className="text-gray-900">{settings.payment_methods.jazzcash_title}</strong> | 
                          Number: <strong className="text-gray-900">{settings.payment_methods.jazzcash_number}</strong>
                        </div>
                      </div>
                    </div>
                  </label>
                )}

                {/* EasyPaisa */}
                {settings.payment_methods?.easypaisa_enabled && (
                  <label className={`block p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                    paymentMethod === 'easypaisa' ? 'border-brand-600 bg-brand-50/50' : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'easypaisa'}
                        onChange={() => setPaymentMethod('easypaisa')}
                        className="text-brand-600 focus:ring-brand-500 mt-1"
                      />
                      <div className="space-y-1">
                        <div className="text-xs sm:text-sm font-bold text-gray-900">EasyPaisa Transfer</div>
                        <div className="text-[11px] text-gray-600">
                          Account Title: <strong className="text-gray-900">{settings.payment_methods.easypaisa_title}</strong> | 
                          Number: <strong className="text-gray-900">{settings.payment_methods.easypaisa_number}</strong>
                        </div>
                      </div>
                    </div>
                  </label>
                )}

                {/* Bank Transfer */}
                {settings.payment_methods?.bank_enabled && (
                  <label className={`block p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                    paymentMethod === 'bank' ? 'border-brand-600 bg-brand-50/50' : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'bank'}
                        onChange={() => setPaymentMethod('bank')}
                        className="text-brand-600 focus:ring-brand-500 mt-1"
                      />
                      <div className="space-y-1">
                        <div className="text-xs sm:text-sm font-bold text-gray-900">Direct Bank Transfer</div>
                        <div className="text-[11px] text-gray-600">
                          Bank: <strong className="text-gray-900">{settings.payment_methods.bank_name}</strong> | 
                          Title: <strong className="text-gray-900">{settings.payment_methods.bank_title}</strong> | 
                          Acc: <strong className="text-gray-900">{settings.payment_methods.bank_account}</strong>
                        </div>
                      </div>
                    </div>
                  </label>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Order Summary & Final Total (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-gray-100 space-y-5 sticky top-24">
            <h3 className="font-black text-gray-900 text-base pb-3 border-b border-gray-100 flex items-center justify-between">
              <span>Order Summary</span>
              <span className="text-xs font-semibold text-gray-500">{cart.length} item(s)</span>
            </h3>

            {/* Cart Items List */}
            <div className="max-h-60 overflow-y-auto space-y-3 pr-1 divide-y divide-gray-100">
              {cart.map((item) => (
                <div key={`${item.product.id}-${item.selectedWeight}`} className="flex items-center justify-between pt-2 first:pt-0">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-gray-900 leading-tight">
                      {item.product.name}
                    </h4>
                    <div className="text-[11px] text-gray-500">
                      {item.selectedWeight} {item.product.unit} × {item.quantity}
                    </div>
                  </div>
                  <div className="text-xs font-black text-gray-900 text-right">
                    Rs. {item.unitPrice * item.quantity}
                  </div>
                </div>
              ))}
            </div>

            {/* Coupon Code Box */}
            <div className="pt-2 border-t border-gray-100">
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl p-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Coupon: {appliedCoupon.code} (-Rs. {discount})</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-xs font-bold text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Enter promo code (e.g. TIKTOK10)"
                      className="flex-1 px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl uppercase font-bold focus:outline-hidden focus:border-brand-500"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="bg-gray-800 hover:bg-gray-900 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                  {couponError && <p className="text-[11px] text-red-500">{couponError}</p>}
                </div>
              )}
            </div>

            {/* Calculation Breakdown */}
            <div className="space-y-2 pt-2 border-t border-gray-100 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Vegetables Subtotal</span>
                <span className="font-semibold text-gray-900">Rs. {subtotal}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Discount</span>
                  <span>-Rs. {discount}</span>
                </div>
              )}

              <div className="flex justify-between text-gray-600">
                <span className="flex items-center gap-1">
                  <span>Karachi Delivery Fee</span>
                  {isFreeDelivery && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.2 rounded-full font-bold">
                      FREE OVER RS. {settings.free_delivery_threshold}
                    </span>
                  )}
                </span>
                <span className="font-semibold text-gray-900">
                  {isFreeDelivery ? 'FREE' : `Rs. ${deliveryFee}`}
                </span>
              </div>

              <div className="flex justify-between text-base font-black text-gray-900 pt-3 border-t border-gray-200">
                <span>Grand Total</span>
                <span className="text-brand-700 text-lg">Rs. {grandTotal}</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              form="checkout-form"
              disabled={submitting || cart.length === 0}
              className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 text-white font-black py-3.5 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
            >
              {submitting ? (
                <span>Confirming Order...</span>
              ) : (
                <>
                  <span>Place Order (Rs. {grandTotal})</span>
                  <CheckCircle2 className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Trust Badges */}
            <div className="pt-2 text-center space-y-2 border-t border-gray-100 text-[11px] text-gray-500">
              <div className="flex items-center justify-center gap-1.5 text-emerald-700 font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>100% Quality & Freshness Guarantee</span>
              </div>
              <p>Inspect vegetables before payment. Return any item you are not satisfied with.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Post-Checkout Order Confirmation Modal */}
      <OrderConfirmationModal
        order={confirmedOrder}
        settings={settings}
        onClose={() => {
          setConfirmedOrder(null);
          router.push('/');
        }}
      />
    </div>
  );
}
