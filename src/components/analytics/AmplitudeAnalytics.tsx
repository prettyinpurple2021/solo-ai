'use client';

import * as amplitude from '@amplitude/unified';
import { useEffect } from 'react';

export const AmplitudeAnalytics = () => {
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY;

    // Only initialize in production and when a key is present.
    // Skipping in dev/staging prevents console noise and avoids
    // polluting analytics data with non-production events.
    if (!apiKey || process.env.NODE_ENV !== 'production') return;

    amplitude.initAll(apiKey, {
      analytics: {
        autocapture: true,
      },
      sessionReplay: {
        sampleRate: 1,
      },
    });
  }, []);

  return null;
};
