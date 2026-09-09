import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Portal | I.A Vegetables Supplier',
  description: 'Enterprise Management System for I.A Vegetables Supplier Karachi',
  robots: 'noindex, nofollow',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 antialiased font-sans">
      {children}
    </div>
  );
}
