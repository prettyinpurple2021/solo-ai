import { google } from 'googleapis';

/**
 * The scopes required for the Google Calendar integration.
 * We are requesting read-only access to calendars and events.
 */
export const GOOGLE_CALENDAR_SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/calendar.events.readonly',
];

/**
 * Lazily create and return a configured Google OAuth2 client.
 * This avoids throwing at module import/build time when env vars may be missing.
 */
export function getGoogleOAuth2Client() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error(
      'Missing Google OAuth credentials. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your environment.'
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const redirectUri = `${appUrl}/api/integrations/google/callback`;

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}
