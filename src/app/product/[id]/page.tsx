import React from 'react';
import type { Metadata } from 'next';
import { INITIAL_PRODUCTS } from '../../../lib/seedData';
import ProductDetailClient from './ProductDetailClient';

export function generateStaticParams() {
  return INITIAL_PRODUCTS.map((product) => ({
    id: product.id,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = INITIAL_PRODUCTS.find((p) => p.id === id || p.slug === id);

  if (!product) {
    return {
      title: 'Fresh Farm Vegetable | I.A Vegetables Supplier Karachi',
      description: 'Order fresh farm vegetables online in Karachi at wholesale mandi rates with same-day doorstep delivery.',
    };
  }

  const urduSuffix = product.name_urdu ? ` (${product.name_urdu})` : '';
  const metaTitle = `${product.name}${urduSuffix} - Buy Online at Mandi Rate | I.A Vegetables Karachi`;
  const metaDesc = `Buy fresh ${product.name}${urduSuffix} online in Karachi for Rs. ${product.price}/${product.unit}. Direct morning mandi harvest delivered fresh to SITE Town, Clifton, DHA, Gulshan, Malir & all Karachi. NTN # 4260196-7.`;

  return {
    title: metaTitle,
    description: metaDesc,
    alternates: {
      canonical: `https://www.iavegetables.com/product/${product.id}/`,
    },
    openGraph: {
      title: metaTitle,
      description: metaDesc,
      url: `https://www.iavegetables.com/product/${product.id}/`,
      siteName: 'I.A Vegetables Supplier',
      images: [
        {
          url: product.thumbnail_url || '/images/logo.png',
          width: 600,
          height: 600,
          alt: `${product.name}${urduSuffix} - Fresh Karachi Vegetable`,
        },
      ],
      locale: 'en_PK',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: metaTitle,
      description: metaDesc,
      images: [product.thumbnail_url || '/images/logo.png'],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = INITIAL_PRODUCTS.find((p) => p.id === id || p.slug === id) || INITIAL_PRODUCTS[0];

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    alternateName: product.name_urdu || undefined,
    image: product.thumbnail_url ? [product.thumbnail_url] : ['https://www.iavegetables.com/images/logo.png'],
    description: product.description || `Fresh farm ${product.name} delivered across Karachi at wholesale mandi rates.`,
    sku: product.id,
    brand: {
      '@type': 'Brand',
      name: 'I.A Vegetables Supplier',
    },
    offers: {
      '@type': 'Offer',
      url: `https://www.iavegetables.com/product/${product.id}/`,
      priceCurrency: 'PKR',
      price: product.price,
      priceValidUntil: '2026-12-31',
      itemCondition: 'https://schema.org/NewCondition',
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'I.A Vegetables Supplier',
        telephone: '+923413989260',
      },
    },
  };

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
      {
        '@type': 'ListItem',
        position: 3,
        name: product.name,
        item: `https://www.iavegetables.com/product/${product.id}/`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ProductDetailClient id={id} />
    </>
  );
}

