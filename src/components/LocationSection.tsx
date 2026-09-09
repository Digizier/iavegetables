'use client';

import React from 'react';
import { MapPin, Navigation, Compass, Phone } from 'lucide-react';
import { ShopSettings } from '../lib/types';

interface LocationSectionProps {
  settings: ShopSettings;
}

export default function LocationSection({ settings }: LocationSectionProps) {
  const mapsUrl = settings.google_maps_url || 'https://www.google.com/maps/place/I.A+vegetables+shop/@24.8882505,66.9850563,21z';
  const cleanPhone = settings.whatsapp_number?.replace(/[^0-9]/g, '') || '923413989260';

  return (
    <section id="store-location" className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-1.5 bg-brand-50 border border-brand-200 text-brand-800 text-xs font-bold px-3 py-1 rounded-full mb-2">
            <Compass className="w-3.5 h-3.5 text-brand-600" />
            <span>Store Location & Directions</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Visit Our Shop in Karachi
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1.5">
            Located conveniently in SITE Town, Keamari District. Visit us in person or get delivery right to your door.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {/* Address & Direction Card */}
          <div className="bg-brand-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xl">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-800 border border-brand-700 flex items-center justify-center text-emerald-300">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold tracking-tight">I.A vegetables shop</h3>
                <p className="text-xs text-brand-200 mt-1 leading-relaxed">
                  {settings.shop_address || 'SITE Town, Keamari District, Karachi 75020, Sindh, Pakistan'}
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-brand-800 text-xs text-brand-200">
                <div className="flex items-center justify-between">
                  <span>Google Plus Code:</span>
                  <strong className="font-mono text-emerald-300">{settings.plus_code || '7JP8VXQP+82'}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Coordinates:</span>
                  <span className="font-mono text-[11px] text-brand-300">24.88825° N, 66.98505° E</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Nearby Landmark:</span>
                  <span className="text-white font-semibold">Adjacent to Bizabay</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Operating Hours:</span>
                  <span className="text-amber-300 font-semibold">7:00 AM – 10:00 PM</span>
                </div>
              </div>
            </div>

            <div className="pt-6 space-y-2.5">
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-brand-950 font-black text-xs sm:text-sm py-3 rounded-full flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <Navigation className="w-4 h-4" />
                <span>Get Driving Directions</span>
              </a>

              <a
                href={`tel:${cleanPhone}`}
                className="w-full bg-brand-800 hover:bg-brand-700 text-white font-semibold text-xs py-2.5 rounded-full flex items-center justify-center gap-2 transition-all border border-brand-700"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Shop: {settings.phone_number || '+92 341 3989260'}</span>
              </a>
            </div>
          </div>

          {/* Interactive Responsive Google Map */}
          <div className="lg:col-span-2 rounded-3xl overflow-hidden border border-gray-200 shadow-md min-h-[350px] relative bg-gray-100">
            <iframe
              title="I.A Vegetables Shop Google Map Location"
              src="https://maps.google.com/maps?q=24.8882505,66.9850563&hl=en&z=17&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: '380px' }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
