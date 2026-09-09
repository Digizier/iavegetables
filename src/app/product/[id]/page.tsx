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
      title: 'Fresh Vegetable | I.A Vegetables Supplier',
    };
  }

  return {
    title: `${product.name} ${product.name_urdu ? `(${product.name_urdu})` : ''} - I.A Vegetables Supplier Karachi`,
    description: product.description || `Buy fresh wholesale ${product.name} delivered across Karachi.`,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProductDetailClient id={id} />;
}
