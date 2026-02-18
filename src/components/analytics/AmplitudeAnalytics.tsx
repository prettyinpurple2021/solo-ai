'use client';

import * as amplitude from '@amplitude/unified';
import { useEffect } from 'react';

export const AmplitudeAnalytics = () => {
  useEffect(() => {
    amplitude.initAll('684bdddb30888503cc4bb48ffe2c7004', {
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
