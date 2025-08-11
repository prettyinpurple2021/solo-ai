'use client';

import Script from 'next/script';
import { useEffect } from 'react';

interface AdSenseProps {
  /**
   * AdSense client ID - should be passed from environment variable
   */
  clientId?: string;
}

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

/**
 * Google AdSense component that safely loads AdSense scripts using environment variables
 * 
 * Security features:
 * - Uses environment variable for client ID (no hardcoded values)
 * - Only loads when client ID is properly configured
 * - Provides clear error messages for missing configuration
 */
export default function AdSense({ clientId }: AdSenseProps) {
  useEffect(() => {
    // Initialize adsbygoogle array if not already present
    if (typeof window !== 'undefined') {
      window.adsbygoogle = window.adsbygoogle || [];
    }
  }, []);

  // Don't render AdSense if no client ID is provided
  if (!clientId) {
    console.warn(
      'AdSense: NEXT_PUBLIC_ADSENSE_CLIENT_ID is not configured. ' +
      'Please set this environment variable to enable AdSense.'
    );
    return null;
  }

  // Validate client ID format
  if (!clientId.startsWith('ca-pub-')) {
    console.error(
      'AdSense: Invalid client ID format. Expected format: ca-pub-XXXXXXXXXXXXXXXX'
    );
    return null;
  }

  return (
    <>
      <Script
        id="adsense-script"
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
        crossOrigin="anonymous"
        strategy="afterInteractive"
        onError={() => {
          console.error('Failed to load AdSense script');
        }}
      />
    </>
  );
}