import { supabase, BUCKET_GOAT_IMAGES, resolveStorageUrl } from '@/lib/supabase/client';

export class StorageService {
  /**
   * Compresses an image file in the browser using HTML Canvas to high quality WebP.
   * Limits max dimension to 1920px to optimize storage and loading speed.
   */
  static async compressImage(file: File, maxWidth: number = 1920, maxHeight: number = 1080, quality: number = 0.85): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };

      reader.onerror = (err) => reject(err);

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file); // fallback to original file
          return;
        }

        // Draw image with smooth scaling
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              resolve(file);
            }
          },
          'image/webp',
          quality
        );
      };

      reader.readAsDataURL(file);
    });
  }

  /**
   * Uploads a compressed goat image to Supabase Storage and returns its public URL.
   */
  static async uploadGoatPhoto(
    file: File,
    farmCode: string,
    goatCode: string,
    index: number = 0
  ): Promise<string> {
    try {
      const compressedBlob = await this.compressImage(file);
      const cleanFarmCode = farmCode.trim().replace(/[^a-zA-Z0-9_-]/g, '') || 'FARM-001';
      const cleanGoatCode = goatCode.trim().replace(/[^a-zA-Z0-9_-]/g, '') || 'GOAT';
      const timestamp = Date.now();
      const filePath = `${cleanFarmCode}/${cleanGoatCode}/${timestamp}_${index}.webp`;

      const { data, error } = await supabase.storage
        .from(BUCKET_GOAT_IMAGES)
        .upload(filePath, compressedBlob, {
          contentType: 'image/webp',
          cacheControl: '31536000',
          upsert: true,
        });

      if (error) {
        console.error('Storage upload error:', error);
        throw error;
      }

      return resolveStorageUrl(data.path, BUCKET_GOAT_IMAGES);
    } catch (err) {
      console.error('Failed to compress and upload photo:', err);
      throw err;
    }
  }

  /**
   * Uploads farm documents or logo/banner.
   */
  static async uploadFarmAsset(
    file: File,
    farmCode: string,
    type: 'logo' | 'banner' | 'cert'
  ): Promise<string> {
    const compressed = await this.compressImage(file, type === 'banner' ? 1920 : 800, type === 'banner' ? 600 : 800);
    const cleanFarmCode = farmCode.trim().replace(/[^a-zA-Z0-9_-]/g, '') || 'FARM-001';
    const filePath = `${cleanFarmCode}/${type}_${Date.now()}.webp`;

    const { data, error } = await supabase.storage
      .from('farm-docs')
      .upload(filePath, compressed, {
        contentType: 'image/webp',
        cacheControl: '31536000',
        upsert: true,
      });

    if (error) throw error;
    return resolveStorageUrl(data.path, 'farm-docs');
  }
}
