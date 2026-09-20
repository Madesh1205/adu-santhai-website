import React, { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  path?: string;
  type?: 'website' | 'product' | 'profile';
  schema?: Record<string, any>;
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description = 'Adu Santhai - Tamil Nadu\'s Premier Direct Goat Marketplace powered by Ammal Farm. Browse verified breeds, sires, and live bookings directly with top goat farmers.',
  image = 'https://adusanthai.ammalfarm.dpdns.org/banner.jpg',
  path = '',
  type = 'website',
  schema,
}) => {
  const appUrl = import.meta.env.VITE_APP_URL || 'https://adusanthai.ammalfarm.dpdns.org';
  const fullTitle = title ? `${title} | Adu Santhai - Ammal Farm` : 'Adu Santhai | Tamil Nadu Goat Marketplace - Ammal Farm';
  const fullUrl = `${appUrl.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;

  useEffect(() => {
    // 1. Update Title
    document.title = fullTitle;

    // 2. Helper to set or create meta tag
    const setMeta = (nameAttr: string, nameValue: string, content: string) => {
      let element = document.querySelector(`meta[${nameAttr}="${nameValue}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(nameAttr, nameValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    setMeta('name', 'description', description);
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:url', fullUrl);
    setMeta('property', 'og:type', type);
    setMeta('property', 'og:image', image);
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', fullTitle);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', image);

    // 3. Update Canonical link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', fullUrl);

    // 4. Update Schema JSON-LD if provided
    let scriptTag = document.getElementById('json-ld-seo') as HTMLScriptElement | null;
    if (schema) {
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.id = 'json-ld-seo';
        scriptTag.type = 'application/ld+json';
        document.head.appendChild(scriptTag);
      }
      scriptTag.text = JSON.stringify(schema);
    } else if (scriptTag) {
      scriptTag.remove();
    }
  }, [fullTitle, description, fullUrl, type, image, schema]);

  return null;
};
