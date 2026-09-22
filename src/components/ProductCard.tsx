'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Plus, Minus, Check, Sparkles } from 'lucide-react';
import { Product, CartItem } from '../lib/types';
import { getLocalCart, saveLocalCart } from '../lib/db';

interface ProductCardProps {
  product: Product;
  onOpenCart?: () => void;
}

export default function ProductCard({ product, onOpenCart }: ProductCardProps) {
  const weightOptions = product.weight_options && product.weight_options.length > 0
    ? product.weight_options
    : ['1'];

  const [selectedWeight, setSelectedWeight] = useState<string>(weightOptions[0] || '1');
  const [currentQtyInCart, setCurrentQtyInCart] = useState<number>(0);
  const [addedAnimation, setAddedAnimation] = useState<boolean>(false);

  const optimizedThumb = useMemo(() => {
    const src = product.thumbnail_url;
    if (!src) return 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&auto=format&fit=crop&q=75';
    if (src.includes('images.unsplash.com')) {
      return src.replace(/w=\d+/, 'w=400').replace(/q=\d+/, 'q=75');
    }
    return src;
  }, [product.thumbnail_url]);

  // Compute proportional price for selected weight
  const weightMultiplier = parseFloat(selectedWeight) || 1;
  const computedPrice = Math.round(product.price * weightMultiplier);

  // Sync cart count for this product and selected weight
  useEffect(() => {
    const checkCart = () => {
      const items = getLocalCart();
      const match = items.find(
        (i) => i.product.id === product.id && i.selectedWeight === selectedWeight
      );
      setCurrentQtyInCart(match ? match.quantity : 0);
    };

    checkCart();
    const handleCartUpdate = () => checkCart();
    window.addEventListener('ia_cart_updated', handleCartUpdate);
    return () => window.removeEventListener('ia_cart_updated', handleCartUpdate);
  }, [product.id, selectedWeight]);

  const handleAddToCart = () => {
    const items = getLocalCart();
    const existingIndex = items.findIndex(
      (i) => i.product.id === product.id && i.selectedWeight === selectedWeight
    );

    let updated: CartItem[];
    if (existingIndex > -1) {
      updated = [...items];
      updated[existingIndex].quantity += 1;
    } else {
      updated = [
        ...items,
        {
          product,
          selectedWeight,
          unitPrice: computedPrice,
          quantity: 1,
        },
      ];
    }

    saveLocalCart(updated);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1200);
  };

  const handleUpdateQuantity = (delta: number) => {
    const items = getLocalCart();
    const existingIndex = items.findIndex(
      (i) => i.product.id === product.id && i.selectedWeight === selectedWeight
    );

    if (existingIndex === -1) return;

    const newQty = items[existingIndex].quantity + delta;
    let updated: CartItem[];

    if (newQty <= 0) {
      updated = items.filter((_, idx) => idx !== existingIndex);
    } else {
      updated = [...items];
      updated[existingIndex].quantity = newQty;
    }

    saveLocalCart(updated);
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-2.5 sm:p-3.5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all group relative">
      {/* Top Badges */}
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1 items-start pointer-events-none">
        {product.is_featured && (
          <span className="bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
            ⭐ Featured
          </span>
        )}
        {product.badge && (
          <span className="bg-emerald-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs backdrop-blur-xs flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" />
            {product.badge}
          </span>
        )}
      </div>

      {/* Image Container with subtle hover zoom - Click opens Product Detail */}
      <Link
        href={`/product/${encodeURIComponent(product.id)}/`}
        className="relative aspect-square w-full rounded-xl overflow-hidden bg-gray-50 mb-2.5 flex items-center justify-center block cursor-pointer"
      >
        <img
          src={optimizedThumb}
          alt={`${product.name} ${product.name_urdu ? `(${product.name_urdu})` : ''} - Fresh Vegetable Karachi`}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&auto=format&fit=crop&q=75';
          }}
        />
      </Link>

      {/* Product Information */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <Link href={`/product/${encodeURIComponent(product.id)}/`} className="block">
            <h3 className="font-bold text-gray-900 text-xs sm:text-sm line-clamp-1 hover:text-brand-700 transition-colors">
              {product.name}
            </h3>
          </Link>
          {product.name_urdu && (
            <p className="text-[11px] sm:text-xs text-brand-700 font-medium mb-1.5">
              {product.name_urdu}
            </p>
          )}

          {/* Weight Selection Chips (Fresh Basket Style) */}
          <div className="flex flex-wrap items-center gap-1 mb-2.5">
            {weightOptions.map((opt) => {
              const isSelected = selectedWeight === opt;
              const displayLabel = `${opt} ${product.unit}`;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setSelectedWeight(opt)}
                  className={`text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-md border transition-all ${
                    isSelected
                      ? 'bg-brand-50 border-brand-500 text-brand-700 ring-1 ring-brand-500'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {displayLabel}
                </button>
              );
            })}
          </div>
        </div>

        {/* Pricing & Add to Cart */}
        <div className="pt-2 border-t border-gray-50 flex items-center justify-between gap-2 mt-auto">
          <div>
            <div className="text-brand-800 font-extrabold text-sm sm:text-base leading-tight">
              Rs. {computedPrice}
            </div>
            <div className="text-[10px] text-gray-500 font-medium">
              for {selectedWeight} {product.unit}
            </div>
          </div>

          {/* Add to Cart Stepper Button */}
          <div>
            {currentQtyInCart > 0 ? (
              <div className="flex items-center gap-1.5 bg-brand-600 text-white rounded-full px-1.5 py-1 text-xs shadow-xs">
                <button
                  type="button"
                  onClick={() => handleUpdateQuantity(-1)}
                  className="w-5 h-5 rounded-full bg-brand-700 hover:bg-brand-800 flex items-center justify-center transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="font-bold px-1 text-xs">{currentQtyInCart}</span>
                <button
                  type="button"
                  onClick={() => handleUpdateQuantity(1)}
                  className="w-5 h-5 rounded-full bg-brand-700 hover:bg-brand-800 flex items-center justify-center transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex items-center gap-1 bg-brand-50 hover:bg-brand-600 border border-brand-500 text-brand-700 hover:text-white rounded-full px-3 py-1.5 text-xs font-bold transition-all shadow-2xs hover:shadow-xs active:scale-95"
              >
                {addedAnimation ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Added</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
