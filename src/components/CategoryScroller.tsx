'use client';

import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, LayoutGrid, X } from 'lucide-react';
import { Category } from '../lib/types';

interface CategoryScrollerProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (slug: string) => void;
}

export default function CategoryScroller({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryScrollerProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState<boolean>(false);
  const [canScrollRight, setCanScrollRight] = useState<boolean>(false);
  const [showAllModal, setShowAllModal] = useState<boolean>(false);

  const checkScrollability = () => {
    const el = scrollerRef.current;
    if (!el) return;
    const hasOverflow = el.scrollWidth > el.clientWidth;
    setCanScrollLeft(el.scrollLeft > 5);
    setCanScrollRight(hasOverflow && el.scrollLeft < el.scrollWidth - el.clientWidth - 5);
  };

  useEffect(() => {
    checkScrollability();
    const handleResize = () => checkScrollability();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [categories]);

  const handleScroll = (direction: 'left' | 'right') => {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = direction === 'left' ? -300 : 300;
    el.scrollBy({ left: amount, behavior: 'smooth' });
    setTimeout(checkScrollability, 350);
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (scrollerRef.current && e.deltaY !== 0) {
      scrollerRef.current.scrollLeft += e.deltaY;
      checkScrollability();
    }
  };

  return (
    <>
      <div className="bg-white border-b border-gray-100 py-2.5 shadow-xs sticky top-[57px] sm:top-[69px] z-30">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 relative flex items-center gap-2">
          {/* Desktop Left Scroll Button */}
          {canScrollLeft && (
            <button
              type="button"
              onClick={() => handleScroll('left')}
              className="hidden md:flex absolute left-2 z-20 w-8 h-8 rounded-full bg-white/95 hover:bg-white text-gray-700 shadow-md border border-gray-200 items-center justify-center transition-transform hover:scale-110 cursor-pointer"
              aria-label="Scroll categories left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          {/* Left Gradient Fade Mask */}
          {canScrollLeft && (
            <div className="hidden md:block absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white to-transparent pointer-events-none z-10" />
          )}

          {/* Horizontal Scroller */}
          <div
            ref={scrollerRef}
            onScroll={checkScrollability}
            onWheel={handleWheel}
            className="flex-1 flex items-center gap-2 sm:gap-2.5 overflow-x-auto no-scrollbar py-1 scroll-smooth px-1"
          >
            {/* All Button */}
            <button
              type="button"
              onClick={() => onSelectCategory('all')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-bold transition-all shrink-0 border cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-brand-600 text-white border-brand-600 shadow-sm ring-2 ring-brand-500/20'
                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <span>🧺</span>
              <span>All Vegetables</span>
            </button>

            {/* Dynamic Categories */}
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.slug;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onSelectCategory(cat.slug)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-bold transition-all shrink-0 border cursor-pointer ${
                    isSelected
                      ? 'bg-brand-600 text-white border-brand-600 shadow-sm ring-2 ring-brand-500/20'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-sm sm:text-base">{cat.icon || '🥦'}</span>
                  <span className="whitespace-nowrap">{cat.name}</span>
                  {cat.name_urdu && (
                    <span
                      className={`text-[11px] font-normal font-urdu whitespace-nowrap ${
                        isSelected ? 'text-brand-100' : 'text-gray-400'
                      }`}
                    >
                      ({cat.name_urdu})
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Gradient Fade Mask */}
          {canScrollRight && (
            <div className="hidden md:block absolute right-24 top-0 bottom-0 w-12 bg-gradient-to-l from-white to-transparent pointer-events-none z-10" />
          )}

          {/* Desktop Right Scroll Button */}
          {canScrollRight && (
            <button
              type="button"
              onClick={() => handleScroll('right')}
              className="hidden md:flex absolute right-24 z-20 w-8 h-8 rounded-full bg-white/95 hover:bg-white text-gray-700 shadow-md border border-gray-200 items-center justify-center transition-transform hover:scale-110 cursor-pointer"
              aria-label="Scroll categories right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          {/* "See All" / View All Categories Button */}
          <button
            type="button"
            onClick={() => setShowAllModal(true)}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-full text-xs font-bold bg-brand-50 hover:bg-brand-100 text-brand-800 border border-brand-200 transition-colors shadow-2xs cursor-pointer ml-1"
            title="View all categories grid"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-brand-600" />
            <span className="hidden sm:inline">See All</span>
            <span className="sm:hidden">All</span>
            <span className="bg-brand-200/80 text-brand-900 text-[10px] px-1.5 py-0.2 rounded-full">
              {categories.length}
            </span>
          </button>
        </div>
      </div>

      {/* "See All Categories" Modal */}
      {showAllModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-gray-100 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center font-bold">
                  🧺
                </div>
                <div>
                  <h3 className="font-black text-gray-900 text-base">All Vegetable Categories</h3>
                  <p className="text-xs text-gray-500">Pick a category to browse fresh produce</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAllModal(false)}
                className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    onSelectCategory('all');
                    setShowAllModal(false);
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                    selectedCategory === 'all'
                      ? 'bg-brand-50 border-brand-500 ring-2 ring-brand-400'
                      : 'bg-gray-50/70 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                  }`}
                >
                  <span className="text-2xl">🧺</span>
                  <div>
                    <span className="block font-bold text-xs text-gray-900">All Vegetables</span>
                    <span className="text-[11px] text-gray-500">Full Mandi Harvest</span>
                  </div>
                </button>

                {categories.map((cat) => {
                  const isSelected = selectedCategory === cat.slug;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        onSelectCategory(cat.slug);
                        setShowAllModal(false);
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                        isSelected
                          ? 'bg-brand-50 border-brand-500 ring-2 ring-brand-400'
                          : 'bg-gray-50/70 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-2xl">{cat.icon || '🥦'}</span>
                      <div className="min-w-0">
                        <span className="block font-bold text-xs text-gray-900 truncate">
                          {cat.name}
                        </span>
                        {cat.name_urdu && (
                          <span className="text-[11px] text-emerald-800 font-urdu block truncate">
                            {cat.name_urdu}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
