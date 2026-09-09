'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';
import CartDrawer from './CartDrawer';
import { MessageCircle } from 'lucide-react';
import { getShopSettings } from '../lib/db';
import { INITIAL_SETTINGS } from '../lib/seedData';
import { ShopSettings } from '../lib/types';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [settings, setSettings] = useState<ShopSettings>(INITIAL_SETTINGS);
  const pathname = usePathname();

  const isAdmin = pathname?.startsWith('/admin');

  useEffect(() => {
    getShopSettings().then(setSettings);
    const handleSettingsUpdate = (e: any) => setSettings(e.detail || INITIAL_SETTINGS);
    const handleOpenCart = () => setIsCartOpen(true);

    window.addEventListener('ia_settings_updated', handleSettingsUpdate);
    window.addEventListener('ia_open_cart', handleOpenCart);

    return () => {
      window.removeEventListener('ia_settings_updated', handleSettingsUpdate);
      window.removeEventListener('ia_open_cart', handleOpenCart);
    };
  }, []);

  const cleanPhone = settings.whatsapp_number?.replace(/[^0-9]/g, '') || '923413989260';

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {!isAdmin && <Header onOpenCart={() => setIsCartOpen(true)} />}

      <main className="flex-1">
        {children}
      </main>

      {!isAdmin && <Footer />}

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* Floating WhatsApp Action Button for Mobile */}
      {!isAdmin && (
        <a
          href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent('Assalam o Alaikum, I would like to order fresh vegetables in Karachi.')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-5 right-5 z-40 bg-emerald-500 hover:bg-emerald-600 text-white p-3.5 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95"
          aria-label="Order on WhatsApp"
        >
          <MessageCircle className="w-6 h-6" />
        </a>
      )}
    </div>
  );
}
