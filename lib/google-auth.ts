import { google } from 'googleapis';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  // In a real application, you might want to handle this more gracefully,
  // perhaps by disabling the Google integration feature if keys are missing.
  // For now, we'll throw an error during startup if the keys are not configured.
  throw new Error('GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set in environment variables.');
}

// This is the URL that Google will redirect the user back to after they have
// authenticated. It must match one of the authorized redirect URIs in your
// Google Cloud project settings.
const REDIRECT_URI = process.env.NEXT_PUBLIC_APP_URL
  ? `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/google/callback`
  : 'http://localhost:3000/api/integrations/google/callback';

/**
 * A pre-configured Google OAuth2 client.
 */
export const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  REDIRECT_URI
);

/**
 * The scopes required for the Google Calendar integration.
 * We are requesting read-only access to calendars and events.
 */
export const GOOGLE_CALENDAR_SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/calendar.events.readonly',
];
