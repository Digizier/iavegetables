import React from 'react';
import type { Metadata } from 'next';
import ShopClient from './ShopClient';

export const metadata: Metadata = {
  title: 'Online Fresh Vegetables Shop Karachi | Wholesale Mandi Rates - I.A Vegetables',
  description: 'Order farm-fresh vegetables online in Karachi. Aloo, Piyaz, Tamatar, Palak, Bhindi, Garlic & Ginger at wholesale mandi rates with same-day doorstep delivery. NTN # 4260196-7.',
  alternates: {
    canonical: 'https://www.iavegetables.com/shop/',
  },
  openGraph: {
    title: 'Online Fresh Vegetables Shop Karachi | Wholesale Mandi Rates',
    description: 'Browse our complete catalog of farm-fresh produce with wholesale rates and same-day Karachi delivery.',
    url: 'https://www.iavegetables.com/shop/',
    siteName: 'I.A Vegetables Supplier',
    images: [
      {
        url: '/images/logo.png',
        width: 600,
        height: 600,
        alt: 'I.A Vegetables Shop Online Karachi',
      },
    ],
    locale: 'en_PK',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Fresh Vegetables Catalog Karachi | I.A Vegetables',
    description: 'Browse fresh farm produce with wholesale mandi rates and doorstep delivery in Karachi.',
    images: ['/images/logo.png'],
  },
};

export default function ShopPage() {
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://www.iavegetables.com/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Shop Vegetables',
        item: 'https://www.iavegetables.com/shop/',
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ShopClient />
    </>
  );
}
