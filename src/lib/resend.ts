import { Resend } from 'resend';

import { logWarn } from '@/lib/logger';

if (!process.env.RESEND_API_KEY) {
  // We don't throw here to allow non-email features to work without the key, 
  // but we log a warning.
  logWarn('RESEND_API_KEY is not defined in environment variables');
}

export const resend = new Resend(process.env.RESEND_API_KEY);

export const FROM_EMAIL = process.env.FROM_EMAIL || 'SoloSuccess AI <onboarding@resend.dev>';
