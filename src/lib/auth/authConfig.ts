/**
 * Centralized Authentication & URL Configuration for Adu Santhai (Ammal Farm)
 *
 * Provides safe URL generation and validation across development and production environments.
 * Prevents hardcoding and ensures open-redirect protection.
 */

const DEFAULT_CANONICAL_URL = 'https://adusanthai.ammalfarm.dpdns.org';

/**
 * Returns the base site URL according to environment configuration.
 * Priority: VITE_SITE_URL > VITE_APP_URL > window.location.origin > Default Canonical
 */
export function getSiteUrl(): string {
  const envUrl = import.meta.env.VITE_SITE_URL || import.meta.env.VITE_APP_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim().length > 0) {
    return envUrl.trim().replace(/\/+$/, '');
  }

  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }

  return DEFAULT_CANONICAL_URL;
}

/**
 * Returns the centralized authentication callback URL.
 * Used for both email verification and password reset redirect targets.
 */
export function getAuthCallbackUrl(next?: string): string {
  const baseUrl = getSiteUrl();
  const url = new URL('/auth/callback', baseUrl);
  if (next) {
    const sanitizedNext = sanitizeRedirectUrl(next);
    url.searchParams.set('next', sanitizedNext);
  }
  return url.toString();
}

/**
 * Returns the direct password reset URL.
 */
export function getPasswordResetUrl(): string {
  const baseUrl = getSiteUrl();
  return `${baseUrl}/auth/reset-password`;
}

/**
 * Sanitizes a redirect path to prevent open redirect vulnerabilities.
 * Ensures the target starts with a single '/' and does not redirect to external domains.
 */
export function sanitizeRedirectUrl(target: string | null | undefined, fallback: string = '/marketplace'): string {
  if (!target || typeof target !== 'string') return fallback;

  const trimmed = target.trim();

  // Prevent protocol-relative URLs (//attacker.com) or external schemes (http:, https:, javascript:)
  if (trimmed.startsWith('//') || /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) {
    return fallback;
  }

  // Must begin with a leading slash
  if (!trimmed.startsWith('/')) {
    return `/${trimmed}`;
  }

  return trimmed;
}
