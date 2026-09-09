'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductDetailClient from './[id]/ProductDetailClient';

function ProductContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id') || 'prod-1';
  return <ProductDetailClient id={id} />;
}

export default function ProductQueryPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
          <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mb-4" />
          <p className="text-sm font-semibold text-gray-600">Loading fresh vegetable details...</p>
        </div>
      }
    >
      <ProductContent />
    </Suspense>
  );
}
