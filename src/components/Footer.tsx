'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MapPin, Phone, MessageCircle, Clock, ShieldCheck, Heart } from 'lucide-react';
import { getShopSettings } from '../lib/db';
import { ShopSettings } from '../lib/types';
import { INITIAL_SETTINGS } from '../lib/seedData';

export default function Footer() {
  const pathname = usePathname();
  const [settings, setSettings] = useState<ShopSettings>(INITIAL_SETTINGS);

  const isAdmin = pathname?.startsWith('/admin');

  useEffect(() => {
    getShopSettings().then(setSettings);
    const handleUpdate = (e: any) => setSettings(e.detail || INITIAL_SETTINGS);
    window.addEventListener('ia_settings_updated', handleUpdate);
    return () => window.removeEventListener('ia_settings_updated', handleUpdate);
  }, []);

  if (isAdmin) return null;

  const cleanPhone = settings.whatsapp_number?.replace(/[^0-9]/g, '') || '923413989260';

  return (
    <footer className="bg-brand-950 text-brand-100 pt-12 pb-8 border-t-4 border-brand-600">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        {/* Col 1: Brand & Heritage */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <img
              src="/images/logo.png"
              alt="I.A Vegetables Supplier"
              className="h-12 w-auto object-contain bg-white rounded-xl p-1"
            />
            <div>
              <div className="font-black text-white text-lg tracking-tight">I.A VEGETABLES</div>
              <div className="text-xs text-brand-300 font-semibold tracking-wider uppercase">Supplier • Since 1990</div>
            </div>
          </div>
          <p className="text-xs text-brand-200 leading-relaxed">
            Karachi&apos;s trusted wholesale and retail fresh vegetable supplier. Hand-picked morning mandi produce, sorted, graded, and delivered fresh to households and businesses.
          </p>
          <div className="inline-block bg-brand-900/80 border border-brand-700/60 px-3 py-1.5 rounded-lg text-xs font-mono text-amber-300">
            NTN #: <strong>{settings.ntn_number || '4260196-7'}</strong>
          </div>
        </div>

        {/* Col 2: Physical Store & Karachi Address */}
        <div className="space-y-3">
          <div className="text-white font-bold text-sm uppercase tracking-wider border-b border-brand-800 pb-2">
            Physical Shop in Karachi
          </div>
          <div className="flex items-start gap-2.5 text-xs text-brand-200">
            <MapPin className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-white">I.A vegetables shop</div>
              <div>{settings.shop_address || 'SITE Town, Keamari District, Karachi 75020'}</div>
              <div className="text-brand-300 text-[11px] mt-0.5">Plus Code: {settings.plus_code || '7JP8VXQP+82'} (Near Bizabay)</div>
            </div>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-brand-200">
            <Clock className="w-4 h-4 text-brand-400 shrink-0" />
            <div>Open Daily: 7:00 AM – 10:00 PM</div>
          </div>
          <a
            href={settings.google_maps_url || 'https://www.google.com/maps/place/I.A+vegetables+shop/@24.8882505,66.9850563,21z'}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 underline"
          >
            Open in Google Maps ↗
          </a>
        </div>

        {/* Col 3: Direct Ordering & Support */}
        <div className="space-y-3">
          <div className="text-white font-bold text-sm uppercase tracking-wider border-b border-brand-800 pb-2">
            Order & Contact
          </div>
          <div className="space-y-2">
            <a
              href={`https://wa.me/${cleanPhone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 p-2 bg-emerald-900/60 hover:bg-emerald-900 border border-emerald-700/50 rounded-xl text-xs text-emerald-100 font-medium transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <div className="font-bold text-white">WhatsApp Order</div>
                <div>{settings.whatsapp_number || '+92 341 3989260'}</div>
              </div>
            </a>
            <a
              href={`tel:${cleanPhone}`}
              className="flex items-center gap-2.5 p-2 bg-brand-900/60 hover:bg-brand-900 border border-brand-800 rounded-xl text-xs text-brand-200 font-medium transition-colors"
            >
              <Phone className="w-4 h-4 text-brand-400 shrink-0" />
              <div>
                <div className="font-bold text-white">Phone Support</div>
                <div>{settings.phone_number || '+92 341 3989260'}</div>
              </div>
            </a>
          </div>
        </div>

        {/* Col 4: Social Proof & Accepted Payments */}
        <div className="space-y-3">
          <div className="text-white font-bold text-sm uppercase tracking-wider border-b border-brand-800 pb-2">
            Connect & Pay
          </div>
          <div className="space-y-1.5 text-xs text-brand-200">
            <div>
              <a
                href="https://www.tiktok.com/@i.a.vegetables.su"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-emerald-400 flex items-center gap-1.5 transition-colors"
              >
                <span>🎵 TikTok: <strong>@i.a.vegetables.su</strong></span>
                <span className="text-[10px] bg-brand-800 px-1.5 py-0.5 rounded text-brand-300">29 Videos</span>
              </a>
            </div>
            <div>
              <a
                href="https://www.facebook.com/p/IA-Vegetables-Supplier-61585790161272/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-emerald-400 flex items-center gap-1.5 transition-colors"
              >
                <span>👍 Facebook: <strong>I.A Vegetables Supplier</strong></span>
              </a>
            </div>
            <div>
              <a
                href="https://www.instagram.com/imranabbasi6184?utm_source=qr&igsi=bmJyNWNwYjUwYm1i"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-pink-400 flex items-center gap-1.5 transition-colors"
              >
                <span>📸 Instagram: <strong>@imranabbasi6184</strong></span>
              </a>
            </div>
          </div>

          <div className="pt-2">
            <div className="text-[11px] font-bold text-brand-300 uppercase tracking-wider mb-2">Accepted In Karachi:</div>
            <div className="flex flex-wrap gap-1.5">
              <span className="bg-brand-900 border border-brand-700/60 text-[10px] px-2 py-1 rounded text-white font-semibold">Cash on Delivery (COD)</span>
              <span className="bg-brand-900 border border-brand-700/60 text-[10px] px-2 py-1 rounded text-white font-semibold">JazzCash</span>
              <span className="bg-brand-900 border border-brand-700/60 text-[10px] px-2 py-1 rounded text-white font-semibold">EasyPaisa</span>
              <span className="bg-brand-900 border border-brand-700/60 text-[10px] px-2 py-1 rounded text-white font-semibold">Bank Transfer</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Legal bar */}
      <div className="max-w-7xl mx-auto px-4 pt-6 border-t border-brand-900/80 flex flex-col sm:flex-row items-center justify-between text-xs text-brand-400 gap-3">
        <div>
          © {new Date().getFullYear()} I.A Vegetables Supplier. All rights reserved. NTN: {settings.ntn_number || '4260196-7'}.
        </div>
        <div className="flex items-center gap-4">
          <Link href="/shop" className="hover:text-white transition-colors">Catalog</Link>
          <Link href="/#store-location" className="hover:text-white transition-colors">Shop Location</Link>
          <Link href="/admin" prefetch={false} className="hover:text-white transition-colors">Admin Panel</Link>
        </div>
      </div>
    </footer>
  );
}
