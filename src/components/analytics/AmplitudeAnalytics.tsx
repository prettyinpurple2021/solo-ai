'use client';

import { useEffect } from 'react';

/** Dynamic import keeps `@amplitude/unified` out of `app/layout` (avoids dev ChunkLoadError from huge webpack eval lines). */
export const AmplitudeAnalytics = () => {
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY;

    // Only initialize in production and when a key is present.
    // Skipping in dev/staging prevents console noise and avoids
    // polluting analytics data with non-production events.
    if (!apiKey || process.env.NODE_ENV !== 'production') return;

    let cancelled = false;
    void import('@amplitude/unified').then((amplitude) => {
      if (cancelled) return;
      amplitude.initAll(apiKey, {
        analytics: {
          autocapture: true,
        },
        sessionReplay: {
          sampleRate: 1,
        },
      });
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
};
