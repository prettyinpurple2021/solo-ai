import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getGoogleOAuth2Client } from '@/lib/google-auth';
import { authenticateRequest } from '@/lib/auth-server';
import { createClient } from '@/lib/neon/server';
import { decrypt, encrypt } from '@/lib/encryption';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const { user, error: authError } = await authenticateRequest();
    if (authError || !user) {
      return NextResponse.json({ error: authError || 'Authentication failed.' }, { status: 401 });
    }

    const dbClient = await createClient();
    const { rows } = await dbClient.query(
      'SELECT id, access_token, refresh_token FROM user_integrations WHERE user_id = $1 AND provider = $2',
      [user.id, 'google']
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Google integration not found.' }, { status: 404 });
    }

    const integration = rows[0];
    const accessToken = decrypt(integration.access_token);
    const refreshToken = integration.refresh_token ? decrypt(integration.refresh_token) : null;

    if (!refreshToken) {
        // If there's no refresh token, we can't do much if the access token is expired.
        // This can happen if the user revoked access.
        return NextResponse.json({ error: 'Missing refresh token. Please reconnect your account.' }, { status: 400 });
    }

    const requestOauth2Client = getGoogleOAuth2Client();

    requestOauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    try {
      // First attempt to make the API call
      const calendar = google.calendar({ version: 'v3', auth: requestOauth2Client });
      const response = await calendar.events.list({
          calendarId: 'primary',
          timeMin: new Date(new Date().setHours(0, 0, 0, 0)).toISOString(),
          timeMax: new Date(new Date().setHours(23, 59, 59, 999)).toISOString(),
          maxResults: 15,
          singleEvents: true,
          orderBy: 'startTime',
      });
      return NextResponse.json(response.data.items);

    } catch (error: any) {
      // If the error is due to an expired token, refresh it
      if (error.code === 401 || (error.response && error.response.status === 401)) {
        console.log('Access token expired, attempting to refresh...');

        // Use the refresh token to get a new access token
        const { credentials } = await requestOauth2Client.refreshAccessToken();
        const newAccessToken = credentials.access_token;
        const newExpiryDate = credentials.expiry_date;

        if (!newAccessToken) {
          throw new Error('Failed to refresh access token.');
        }

        // Update the database with the new encrypted access token
        await dbClient.query(
          'UPDATE user_integrations SET access_token = $1, expires_at = $2, updated_at = NOW() WHERE id = $3',
          [encrypt(newAccessToken), newExpiryDate ? new Date(newExpiryDate) : null, integration.id]
        );

        console.log('Successfully refreshed and updated access token.');

        // Retry the API call with the new token
        requestOauth2Client.setCredentials({ access_token: newAccessToken });
        const calendar = google.calendar({ version: 'v3', auth: requestOauth2Client });
        const response = await calendar.events.list({
            calendarId: 'primary',
            timeMin: new Date(new Date().setHours(0, 0, 0, 0)).toISOString(),
            timeMax: new Date(new Date().setHours(23, 59, 59, 999)).toISOString(),
            maxResults: 15,
            singleEvents: true,
            orderBy: 'startTime',
        });
        return NextResponse.json(response.data.items);
      }

      // Re-throw other errors
      throw error;
    }
  } catch (error: any) {
    console.error('[Google Events API Error]', error);
    if (error.response && error.response.data) {
      return NextResponse.json({ error: 'Failed to fetch data from Google Calendar.', details: error.response.data.error }, { status: 500 });
    }
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
