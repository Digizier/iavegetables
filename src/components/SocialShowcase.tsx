'use client';

import React from 'react';
import { Play, Sparkles, ExternalLink, ThumbsUp } from 'lucide-react';

export default function SocialShowcase() {
  const reelPreviews = [
    {
      title: 'Fresh Mandi Tomatoes Crates',
      urdu: 'تازہ ٹماٹر کے کریٹس',
      views: '1.2K',
      likes: '145',
      tag: 'Morning Harvest',
      img: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&auto=format&fit=crop&q=80'
    },
    {
      title: 'Sindhi Onions Sorting & Grading',
      urdu: 'سندھی پیاز کی گریڈنگ',
      views: '2.4K',
      likes: '280',
      tag: 'Wholesale Stock',
      img: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400&auto=format&fit=crop&q=80'
    },
    {
      title: 'Green Leafy Spinach & Saag',
      urdu: 'ہری بھری پالک اور ساگ',
      views: '3.1K',
      likes: '390',
      tag: 'Malir Farm Fresh',
      img: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&auto=format&fit=crop&q=80'
    },
    {
      title: 'Packing Karachi Home Delivery',
      urdu: 'گھر کے لیے آرڈر پیکنگ',
      views: '1.8K',
      likes: '210',
      tag: 'Delivery Packing',
      img: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&auto=format&fit=crop&q=80'
    }
  ];

  return (
    <section className="py-12 bg-gray-50 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-700 text-xs font-bold px-3 py-1 rounded-full mb-2">
              <Sparkles className="w-3.5 h-3.5 text-rose-500" />
              <span>Watch Daily Fresh Mandi Stock</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              TikTok & Social Reels
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Watch authentic daily video updates on our TikTok <strong>@i.a.vegetables.su</strong> (29 Videos • 1,190+ Likes).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://www.tiktok.com/@i.a.vegetables.su"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-black text-white hover:bg-gray-800 text-xs font-bold px-4 py-2 rounded-full flex items-center gap-1.5 shadow-sm transition-all"
            >
              <span>Follow on TikTok</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <a
              href="https://www.facebook.com/p/IA-Vegetables-Supplier-61585790161272/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 text-white hover:bg-blue-700 text-xs font-bold px-4 py-2 rounded-full flex items-center gap-1.5 shadow-sm transition-all"
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>Facebook</span>
            </a>
          </div>
        </div>

        {/* Video Reel Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {reelPreviews.map((reel, idx) => (
            <a
              key={idx}
              href="https://www.tiktok.com/@i.a.vegetables.su"
              target="_blank"
              rel="noopener noreferrer"
              className="relative aspect-[9/14] rounded-2xl overflow-hidden bg-gray-900 shadow-sm hover:shadow-lg transition-all group block"
            >
              <img
                src={reel.img}
                alt={`${reel.title} - I.A Vegetables Karachi TikTok Reel`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-85"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent p-3 flex flex-col justify-between text-white">
                <span className="self-start text-[10px] font-bold bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full">
                  {reel.tag}
                </span>

                <div>
                  <div className="w-8 h-8 rounded-full bg-white/90 text-black flex items-center justify-center mx-auto mb-2 shadow-md group-hover:scale-110 transition-transform">
                    <Play className="w-3.5 h-3.5 fill-black ml-0.5" />
                  </div>
                  <h4 className="font-bold text-xs text-white line-clamp-1">{reel.title}</h4>
                  <p className="text-[10px] text-brand-300">{reel.urdu}</p>
                  <div className="flex items-center justify-between text-[10px] text-gray-400 mt-1">
                    <span>👁️ {reel.views}</span>
                    <span>❤️ {reel.likes}</span>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
