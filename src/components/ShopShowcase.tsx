'use client';

import React from 'react';
import { MapPin, Phone, ShieldCheck, CheckCircle2, Clock, Award } from 'lucide-react';
import { ShopSettings } from '../lib/types';

interface ShopShowcaseProps {
  settings: ShopSettings;
}

export default function ShopShowcase({ settings }: ShopShowcaseProps) {
  const cleanPhone = settings.whatsapp_number?.replace(/[^0-9]/g, '') || '923413989260';

  return (
    <section className="bg-gradient-to-b from-white to-brand-50/40 py-12 border-y border-brand-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Real Storefront Photo with Verified Badges */}
          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden shadow-xl border-4 border-white bg-gray-100 group">
              <img
                src="/images/shop-front.jpg"
                alt="I.A Vegetables Physical Storefront - SITE Town Keamari Karachi"
                className="w-full h-auto object-cover group-hover:scale-102 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-5 text-white">
                <div className="inline-flex items-center gap-1.5 bg-brand-600 text-white text-[11px] font-bold px-3 py-1 rounded-full w-max mb-2 shadow-sm">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified Physical Storefront</span>
                </div>
                <h3 className="font-extrabold text-lg sm:text-xl tracking-tight leading-tight">
                  I. A VEGETABLE SHOP
                </h3>
                <p className="text-xs text-brand-200 mt-1">
                  SITE Town, Keamari District, Karachi • Established 1990
                </p>
              </div>
            </div>

            {/* Floating NTN Badge */}
            <div className="absolute -bottom-4 right-4 bg-white border border-gray-100 rounded-2xl p-3 shadow-lg flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 font-bold text-base">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Govt. Registered</div>
                <div className="font-mono font-bold text-xs text-gray-900">NTN # {settings.ntn_number || '4260196-7'}</div>
              </div>
            </div>
          </div>

          {/* Shop Story & Delivery Promise */}
          <div className="space-y-5">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-brand-100 text-brand-800 text-xs font-bold px-3 py-1 rounded-full mb-2">
                <span>📍 Karachi Mandi Direct</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight leading-tight">
                Over 30 Years of Supplying Fresh Vegetables in Karachi
              </h2>
              <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                Whether you visit our physical counter in <strong>SITE Town, Keamari</strong> or order online for doorstep delivery across Karachi, you always get freshly harvested morning vegetables at transparent wholesale and retail market rates.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-xs flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-gray-900">Daily Mandi Fresh Harvest</div>
                  <div className="text-gray-500 text-[11px]">Vegetables sourced fresh at dawn every single morning.</div>
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-xs flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-gray-900">Karachi-Wide Delivery</div>
                  <div className="text-gray-500 text-[11px]">Doorstep drops in SITE, Clifton, Gulshan, Malir, Nazimabad.</div>
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-xs flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-gray-900">Cash on Delivery & Online</div>
                  <div className="text-gray-500 text-[11px]">Pay via COD, JazzCash, EasyPaisa, or Bank Transfer.</div>
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-xs flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-gray-900">Walk-in Welcome</div>
                  <div className="text-gray-500 text-[11px]">Visit our shop 7 days a week, 7:00 AM to 10:00 PM.</div>
                </div>
              </div>
            </div>

            {/* Quick Contact Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent('Hello I.A Vegetables, I want to order fresh vegetables.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-full shadow-md hover:shadow-lg transition-all flex items-center gap-2"
              >
                <Phone className="w-4 h-4" />
                <span>Order on WhatsApp: {settings.phone_number || '+92 341 3989260'}</span>
              </a>

              <a
                href="#store-location"
                className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 font-bold text-xs sm:text-sm px-4 py-2.5 rounded-full transition-all flex items-center gap-1.5"
              >
                <MapPin className="w-4 h-4 text-brand-600" />
                <span>View Google Map</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
