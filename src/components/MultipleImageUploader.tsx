'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, Star, Plus, Loader2, Image as ImageIcon, Check } from 'lucide-react';
import { uploadProductImage } from '../lib/storage';

interface MultipleImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  coverImage?: string;
  onCoverChange?: (url: string) => void;
  label?: string;
}

export default function MultipleImageUploader({
  images = [],
  onChange,
  coverImage,
  onCoverChange,
  label = 'Product Pictures (Main + Additional Photos)'
}: MultipleImageUploaderProps) {
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const effectiveCover = coverImage || images[0] || '';

  const handleFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError('');

    const newUploadedUrls: string[] = [];
    const total = files.length;

    for (let i = 0; i < total; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;

      setUploadProgress(`Processing ${i + 1} of ${total}...`);
      try {
        const result = await uploadProductImage(file);
        if (result.url) {
          newUploadedUrls.push(result.url);
        }
      } catch (err: any) {
        console.warn('Error uploading photo:', err);
      }
    }

    if (newUploadedUrls.length > 0) {
      const updated = [...images, ...newUploadedUrls];
      onChange(updated);
      if (!effectiveCover && onCoverChange && newUploadedUrls[0]) {
        onCoverChange(newUploadedUrls[0]);
      }
    } else {
      setError('No valid images could be uploaded.');
    }

    setUploading(false);
    setUploadProgress('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const removedUrl = images[indexToRemove];
    const next = images.filter((_, idx) => idx !== indexToRemove);
    onChange(next);

    // If removed image was cover, pick new cover
    if (removedUrl === effectiveCover && onCoverChange) {
      onCoverChange(next[0] || '');
    }
  };

  const handleSetCover = (url: string) => {
    if (onCoverChange) {
      onCoverChange(url);
    }
    // Also move this image to the front of images array
    const filtered = images.filter((img) => img !== url);
    onChange([url, ...filtered]);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-gray-800 flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-brand-600" />
          <span>{label}</span>
          <span className="text-[11px] font-normal text-gray-500">
            ({images.length} photo{images.length !== 1 ? 's' : ''})
          </span>
        </label>
        <span className="text-[10px] text-brand-700 font-semibold bg-brand-50 px-2 py-0.5 rounded-full">
          Select multiple at once
        </span>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFilesChange}
        accept="image/png, image/jpeg, image/webp"
        multiple
        className="hidden"
      />

      {/* Grid of uploaded images + Add Button */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5 p-3 bg-gray-50 rounded-2xl border border-gray-200">
        {images.map((imgUrl, idx) => {
          const isCover = imgUrl === effectiveCover || idx === 0;

          return (
            <div
              key={`${imgUrl}-${idx}`}
              className={`relative aspect-square rounded-xl overflow-hidden bg-white border-2 shadow-xs group transition-all ${
                isCover ? 'border-brand-500 ring-2 ring-brand-400/40' : 'border-gray-200 hover:border-gray-400'
              }`}
            >
              <img
                src={imgUrl}
                alt={`Produce ${idx + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80';
                }}
              />

              {/* Cover Badge */}
              {isCover && (
                <div className="absolute top-1 left-1 bg-brand-600 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded shadow-xs flex items-center gap-0.5">
                  <Star className="w-2.5 h-2.5 fill-current text-amber-300" />
                  <span>Main</span>
                </div>
              )}

              {/* Actions overlay: visible on mobile, hover on desktop */}
              <div className="absolute inset-0 bg-black/30 sm:bg-black/50 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex flex-col items-center justify-between p-1.5 pointer-events-none">
                <div className="w-full flex justify-end pointer-events-auto">
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs shadow-md cursor-pointer active:scale-90 transition-transform"
                    title="Delete photo"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {!isCover && (
                  <div className="w-full pointer-events-auto">
                    <button
                      type="button"
                      onClick={() => handleSetCover(imgUrl)}
                      className="w-full bg-white/95 hover:bg-brand-50 text-gray-900 hover:text-brand-700 text-[10px] font-bold py-1 rounded-md shadow-sm text-center transition-colors cursor-pointer active:scale-95"
                    >
                      Set Main
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Upload Trigger Tile */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="aspect-square rounded-xl border-2 border-dashed border-gray-300 hover:border-brand-500 bg-white hover:bg-brand-50/50 flex flex-col items-center justify-center p-2 text-center transition-all cursor-pointer group disabled:opacity-50"
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-1 text-brand-600">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-[10px] font-bold leading-tight">{uploadProgress || 'Uploading...'}</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1 text-gray-500 group-hover:text-brand-700">
              <div className="w-7 h-7 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 group-hover:scale-110 transition-transform">
                <Plus className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold leading-tight">Add Photos</span>
              <span className="text-[9px] text-gray-400">PNG, JPG, WebP</span>
            </div>
          )}
        </button>
      </div>

      {error && <p className="text-[11px] text-rose-600 font-medium">{error}</p>}
      <p className="text-[10px] text-gray-400 leading-tight">
        💡 Tip: You can select multiple vegetable pictures at once. Hover on any photo to set it as the primary cover.
      </p>
    </div>
  );
}
