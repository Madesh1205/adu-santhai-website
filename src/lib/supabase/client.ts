import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://wphgctwmjcvrblpybktd.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseAnonKey) {
  console.warn('VITE_SUPABASE_ANON_KEY is not defined in environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
  },
});

export const BUCKET_GOAT_IMAGES = 'goat-images';
export const BUCKET_GOAT_PHOTOS = 'goat-photos';
export const BUCKET_FARM_DOCS = 'farm-docs';
export const BUCKET_VET_CERTIFICATES = 'vet-certificates';

/**
 * Resolves a storage image path to a public CDN URL.
 * Handles both relative paths (e.g. "FARM-001/GOAT-008/01.jpg") and full URLs.
 */
export function resolveStorageUrl(pathOrUrl: string | null | undefined, bucket: string = BUCKET_GOAT_IMAGES): string {
  if (!pathOrUrl || typeof pathOrUrl !== 'string') return '';
  const trimmed = pathOrUrl.trim();
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }
  const cleanPath = trimmed.replace(/^\/+/, '');
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${cleanPath}`;
}

/**
 * Extracts storage path from a full URL, or returns relative path as-is.
 */
export function extractStoragePath(pathOrUrl: string | null | undefined, bucket: string = BUCKET_GOAT_IMAGES): string {
  if (!pathOrUrl || typeof pathOrUrl !== 'string') return '';
  const trimmed = pathOrUrl.trim();
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) return trimmed;
  const marker = `/storage/v1/object/public/${bucket}/`;
  if (trimmed.includes(marker)) {
    return trimmed.substring(trimmed.indexOf(marker) + marker.length);
  }
  return trimmed.replace(/^\/+/, '');
}
