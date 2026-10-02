import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://wphgctwmjcvrblpybktd.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwaGdjdHdtamN2cmJscHlia3RkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk2OTA3MTEsImV4cCI6MjEwNTI2NjcxMX0.S6k-iMBtKvjn3F8us6Vfi1vos9K826xL8Kh62rHzuUo';

function getSupabaseUrl(): string {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  if (
    envUrl &&
    typeof envUrl === 'string' &&
    envUrl.trim() &&
    !envUrl.includes('placeholder') &&
    !envUrl.includes('your-project-id') &&
    envUrl.startsWith('https://')
  ) {
    return envUrl.trim();
  }
  return DEFAULT_SUPABASE_URL;
}

function getSupabaseAnonKey(): string {
  const envKey =
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (
    envKey &&
    typeof envKey === 'string' &&
    envKey.trim() &&
    !envKey.includes('placeholder') &&
    !envKey.includes('your-supabase-anon-key') &&
    !envKey.includes('your-supabase-publishable-key')
  ) {
    const cleanKey = envKey.trim();

    // 1. Supabase Publishable Key format (e.g. sbp_...)
    if (cleanKey.startsWith('sbp_') && cleanKey.length > 20) {
      return cleanKey;
    }

    // 2. Standard Supabase JWT Anon Key format (e.g. eyJ...)
    if (cleanKey.startsWith('eyJ') && cleanKey.length > 50) {
      try {
        const parts = cleanKey.split('.');
        if (parts.length === 3) {
          return cleanKey;
        }
      } catch {
        // fall through to default
      }
    }

    // 3. Generic valid custom key
    if (cleanKey.length > 20) {
      return cleanKey;
    }
  }

  return DEFAULT_SUPABASE_ANON_KEY;
}

const supabaseUrl = getSupabaseUrl();
const supabaseAnonKey = getSupabaseAnonKey();

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
