'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag, MessageCircle, Truck } from 'lucide-react';
import { CartItem, ShopSettings } from '../lib/types';
import { getLocalCart, saveLocalCart, getShopSettings, getCoupons, getAppliedCoupon, setAppliedCoupon as persistAppliedCoupon } from '../lib/db';
import { INITIAL_SETTINGS } from '../lib/seedData';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [settings, setSettings] = useState<ShopSettings>(INITIAL_SETTINGS);
  const [couponCode, setCouponCode] = useState<string>('');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [appliedCoupon, setAppliedCoupon] = useState<string>('');
  const [couponError, setCouponError] = useState<string>('');

  // Sync coupon when items change or drawer opens
  const syncActiveCoupon = async (currentItems: CartItem[]) => {
    const code = getAppliedCoupon();
    if (!code) {
      setAppliedCoupon('');
      setDiscountAmount(0);
      return;
    }

    try {
      const coupons = await getCoupons();
      const match = coupons.find(c => c.code.toUpperCase() === code.toUpperCase() && c.is_active);
      if (match) {
        const subtotal = currentItems.reduce((sum, i) => sum + (i.unitPrice * i.quantity), 0);
        if (match.min_spend && subtotal < match.min_spend) {
          setAppliedCoupon('');
          setDiscountAmount(0);
          return;
        }

        let disc = 0;
        if (match.discount_type === 'fixed') {
          disc = match.discount_value;
        } else {
          disc = Math.round((subtotal * match.discount_value) / 100);
        }
        if (disc > subtotal) disc = subtotal;

        setAppliedCoupon(match.code);
        setDiscountAmount(disc);
      } else {
        setAppliedCoupon('');
        setDiscountAmount(0);
      }
    } catch (e) {
      console.warn('Coupon sync error:', e);
    }
  };

  useEffect(() => {
    const current = getLocalCart();
    setItems(current);
    getShopSettings().then(setSettings);
    syncActiveCoupon(current);

    const handleCartUpdate = () => {
      const updated = getLocalCart();
      setItems(updated);
      syncActiveCoupon(updated);
    };
    const handleSettingsUpdate = (e: any) => setSettings(e.detail || INITIAL_SETTINGS);
    const handleCouponApplied = (e: any) => {
      const code = e.detail;
      if (!code) {
        setAppliedCoupon('');
        setDiscountAmount(0);
      } else {
        syncActiveCoupon(getLocalCart());
      }
    };

    window.addEventListener('ia_cart_updated', handleCartUpdate);
    window.addEventListener('ia_settings_updated', handleSettingsUpdate);
    window.addEventListener('ia_coupon_applied', handleCouponApplied);

    return () => {
      window.removeEventListener('ia_cart_updated', handleCartUpdate);
      window.removeEventListener('ia_settings_updated', handleSettingsUpdate);
      window.removeEventListener('ia_coupon_applied', handleCouponApplied);
    };
  }, [isOpen]);

  const updateQuantity = (index: number, delta: number) => {
    const next = [...items];
    const newQty = next[index].quantity + delta;
    if (newQty <= 0) {
      next.splice(index, 1);
    } else {
      next[index].quantity = newQty;
    }
    saveLocalCart(next);
  };

  const removeItem = (index: number) => {
    const next = items.filter((_, idx) => idx !== index);
    saveLocalCart(next);
  };

  const handleApplyCoupon = async () => {
    setCouponError('');
    if (!couponCode.trim()) return;

    const coupons = await getCoupons();
    const match = coupons.find(c => c.code.toUpperCase() === couponCode.trim().toUpperCase() && c.is_active);

    if (!match) {
      setCouponError('Invalid or expired coupon code');
      return;
    }

    const subtotal = items.reduce((sum, i) => sum + (i.unitPrice * i.quantity), 0);
    if (match.min_spend && subtotal < match.min_spend) {
      setCouponError(`Minimum order amount of Rs. ${match.min_spend} required for this code`);
      return;
    }

    let discount = 0;
    if (match.discount_type === 'fixed') {
      discount = match.discount_value;
    } else {
      discount = Math.round((subtotal * match.discount_value) / 100);
    }
    if (discount > subtotal) discount = subtotal;

    setDiscountAmount(discount);
    setAppliedCoupon(match.code);
    setCouponCode('');
    persistAppliedCoupon(match.code);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon('');
    setDiscountAmount(0);
    setCouponCode('');
    persistAppliedCoupon('');
  };

  const subtotal = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const freeThreshold = settings.free_delivery_threshold || 1500;
  const deliveryFee = subtotal >= freeThreshold || subtotal === 0 ? 0 : (settings.delivery_fee || 150);
  const grandTotal = Math.max(0, subtotal + deliveryFee - discountAmount);
  const amountToFreeShipping = Math.max(0, freeThreshold - subtotal);
  const freeProgress = Math.min(100, Math.round((subtotal / freeThreshold) * 100));

  const cleanPhone = settings.whatsapp_number?.replace(/[^0-9]/g, '') || '923413989260';

  const generateWhatsAppMessage = () => {
    let msg = `*🛒 New Order Inquiry - I.A Vegetables Supplier*\n\n`;
    items.forEach((item, idx) => {
      msg += `${idx + 1}. *${item.product.name}* (${item.selectedWeight} ${item.product.unit})\n   Qty: ${item.quantity} × Rs. ${item.unitPrice} = Rs. ${item.unitPrice * item.quantity}\n`;
    });
    msg += `\n*Subtotal:* Rs. ${subtotal}\n`;
    if (discountAmount > 0) msg += `*Discount:* -Rs. ${discountAmount} (${appliedCoupon})\n`;
    msg += `*Delivery Fee:* Rs. ${deliveryFee === 0 ? 'FREE' : deliveryFee}\n`;
    msg += `*Grand Total:* Rs. ${grandTotal}\n\n`;
    msg += `Please confirm my delivery in Karachi!`;
    return encodeURIComponent(msg);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-fade-in"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-brand-50/50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-brand-600" />
              <h2 className="font-extrabold text-base text-gray-900">Your Fresh Cart</h2>
              <span className="bg-brand-100 text-brand-800 text-xs font-bold px-2 py-0.5 rounded-full">
                {items.length} items
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Bar */}
          <div className="bg-emerald-50 px-4 py-2.5 border-b border-emerald-100 text-xs text-emerald-900">
            <div className="flex items-center justify-between font-semibold mb-1">
              <span className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-emerald-600" />
                {amountToFreeShipping > 0 ? (
                  <>Add <strong className="text-emerald-700">Rs. {amountToFreeShipping}</strong> more for Free Delivery!</>
                ) : (
                  <span className="text-emerald-700 font-bold">🎉 You qualify for FREE Karachi Delivery!</span>
                )}
              </span>
              <span className="text-[11px] font-bold text-emerald-700">{freeProgress}%</span>
            </div>
            <div className="w-full h-1.5 bg-emerald-200/80 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 transition-all duration-300 rounded-full"
                style={{ width: `${freeProgress}%` }}
              />
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 divide-y divide-gray-100">
            {items.length === 0 ? (
              <div className="py-16 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl">
                  🥦
                </div>
                <h3 className="font-bold text-gray-800 text-sm mb-1">Your cart is empty</h3>
                <p className="text-xs text-gray-500 mb-4">Add some fresh Karachi mandi vegetables to get started!</p>
                <button
                  onClick={onClose}
                  className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold px-4 py-2 rounded-full"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              items.map((item, index) => (
                <div key={`${item.product.id}-${item.selectedWeight}`} className="py-3 flex items-center gap-3">
                  <img
                    src={item.product.thumbnail_url}
                    alt={item.product.name}
                    className="w-14 h-14 object-cover rounded-xl border border-gray-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-xs text-gray-900 truncate">{item.product.name}</h4>
                    <div className="text-[11px] text-brand-700 font-semibold mb-1">
                      {item.selectedWeight} {item.product.unit} @ Rs. {item.unitPrice}
                    </div>
                    {/* Stepper */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center border border-gray-200 rounded-full bg-gray-50">
                        <button
                          onClick={() => updateQuantity(index, -1)}
                          className="w-5 h-5 flex items-center justify-center text-gray-600 hover:text-black"
                        >
                          <Minus className="w-2.5 h-2.5" />
                        </button>
                        <span className="text-xs font-bold px-2">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(index, 1)}
                          className="w-5 h-5 flex items-center justify-center text-gray-600 hover:text-black"
                        >
                          <Plus className="w-2.5 h-2.5" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(index)}
                        className="text-gray-400 hover:text-rose-500 p-1"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-extrabold text-xs sm:text-sm text-gray-900">
                      Rs. {item.unitPrice * item.quantity}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Summary & Actions */}
          {items.length > 0 && (
            <div className="p-4 border-t border-gray-100 bg-gray-50/70 space-y-3">
              {/* Coupon Code Input */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter Coupon (e.g. FREESHIP)"
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-brand-500"
                  />
                  <Tag className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="bg-gray-800 hover:bg-black text-white text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors"
                >
                  Apply
                </button>
              </div>

              {couponError && <p className="text-[11px] text-rose-600 font-medium">{couponError}</p>}
              {appliedCoupon && (
                <div className="flex items-center justify-between text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                  <span>Coupon &apos;{appliedCoupon}&apos; applied (-Rs. {discountAmount})</span>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-gray-400 hover:text-rose-600 font-bold ml-2 text-xs cursor-pointer"
                    title="Remove coupon"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Totals */}
              <div className="space-y-1.5 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">Rs. {subtotal}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount</span>
                    <span>-Rs. {discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Karachi Delivery Fee</span>
                  <span className="font-semibold text-gray-900">
                    {deliveryFee === 0 ? <strong className="text-emerald-600 font-bold">FREE</strong> : `Rs. ${deliveryFee}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-black text-gray-900 border-t border-gray-200 pt-2">
                  <span>Total Amount</span>
                  <span className="text-brand-800 text-base">Rs. {grandTotal}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <Link
                  href="/checkout"
                  onClick={onClose}
                  className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-2.5 rounded-full flex items-center justify-center gap-2 text-sm shadow-md transition-all active:scale-98"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href={`https://wa.me/${cleanPhone}?text=${generateWhatsAppMessage()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 rounded-full flex items-center justify-center gap-1.5 text-xs shadow-sm transition-all"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Quick WhatsApp Order</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
