'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, Check, Image as ImageIcon, Loader2 } from 'lucide-react';
import { uploadProductImage } from '../lib/storage';

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export default function ImageUploader({ value, onChange, label = 'Product Picture' }: ImageUploaderProps) {
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (PNG, JPG, WEBP)');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const result = await uploadProductImage(file);
      if (result.url) {
        onChange(result.url);
      } else {
        setError(result.error || 'Failed to upload photo');
      }
    } catch (err: any) {
      setError(err.message || 'Error uploading photo');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-bold text-gray-700">{label}</label>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
      />

      {value ? (
        <div className="relative w-32 h-32 rounded-2xl overflow-hidden border-2 border-brand-500 bg-gray-50 shadow-xs group">
          <img
            src={value}
            alt="Preview"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 bg-white text-gray-800 rounded-lg text-xs font-bold hover:bg-gray-100 shadow-sm"
              title="Change Picture"
            >
              Change
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="p-1.5 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 shadow-sm"
              title="Remove Picture"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="w-full border-2 border-dashed border-gray-300 hover:border-brand-500 rounded-2xl p-6 text-center cursor-pointer bg-gray-50 hover:bg-brand-50/40 transition-all"
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2 text-brand-600">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="text-xs font-bold">Compressing & Uploading...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5 text-gray-500">
              <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-brand-600">
                <Upload className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-gray-700">Click to Upload Vegetable Photo</span>
              <span className="text-[10px] text-gray-400">PNG, JPG or WebP (Auto-compressed to &lt;80KB)</span>
            </div>
          )}
        </div>
      )}

      {error && <p className="text-[11px] text-rose-600 font-medium">{error}</p>}
    </div>
  );
}
