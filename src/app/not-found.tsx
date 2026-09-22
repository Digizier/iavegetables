import React from 'react';
import Link from 'next/link';
import { Home, ShoppingBag, Phone } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center bg-white rounded-3xl border border-gray-100 p-8 shadow-sm space-y-6">
        <div className="w-20 h-20 bg-emerald-50 text-brand-700 rounded-full flex items-center justify-center mx-auto text-4xl shadow-inner">
          🥬
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
            Page Not Found • 404
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Vegetable Not Found!
          </h1>
          <p className="text-sm text-gray-500 leading-relaxed">
            The page or fresh produce you are looking for might have been moved, renamed, or is temporarily out of season.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            href="/"
            className="flex-1 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Go to Home</span>
          </Link>

          <Link
            href="/shop"
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Browse Shop</span>
          </Link>
        </div>

        <div className="pt-4 border-t border-gray-100 text-xs text-gray-400">
          Need quick assistance? WhatsApp us at{' '}
          <a
            href="https://wa.me/923413989260"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-600 font-bold hover:underline"
          >
            +92 341 3989260
          </a>
        </div>
      </div>
    </div>
  );
}
