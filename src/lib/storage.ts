import { supabase, getSupabaseUrl } from './supabase';
import { compressImage } from './compressor';

const BUCKET_NAME = 'product-images';

export async function uploadProductImage(file: File): Promise<{ url: string; error?: string }> {
  try {
    // 1. Auto-compress to WebP (<80KB)
    const compressed = await compressImage(file);
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.webp`;
    const filePath = `products/${fileName}`;

    // 2. Direct upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, compressed, {
        cacheControl: '31536000',
        upsert: true,
        contentType: 'image/webp'
      });

    if (error) {
      console.warn('Supabase storage upload error, using local fallback:', error.message);
      // Local fallback: convert to base64 or blob URL for display
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve({ url: reader.result as string });
        reader.onerror = () => resolve({ url: '', error: 'File read failed' });
        reader.readAsDataURL(compressed);
      });
    }

    // 3. Return clean public CDN URL
    const { data: publicData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return { url: publicData.publicUrl };
  } catch (err: any) {
    console.error('Storage upload exception:', err);
    return { url: '', error: err.message || 'Upload failed' };
  }
}
