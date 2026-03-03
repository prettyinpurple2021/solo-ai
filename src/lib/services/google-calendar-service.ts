
import { google } from 'googleapis';
import { db } from '@/db';
import { calendarConnections } from '@/shared/db/schema';
import { eq, and } from 'drizzle-orm';
import { logError, logInfo } from '@/lib/logger';

export interface CalendarEvent {
  id?: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  location?: string;
  attendees?: string[];
  calendarId?: string;
}

export class GoogleCalendarService {
  private static getOAuth2Client() {
    return new google.auth.OAuth2(
      process.env.GOOGLE_CALENDAR_CLIENT_ID,
      process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
      process.env.NEXT_PUBLIC_APP_URL + '/api/integrations/google/calendar/callback'
    );
  }

  /**
   * Get an authorized calendar client for a user
   */
  private static async getAuthorizedClient(userId: string) {
    const connection = await db.query.calendarConnections.findFirst({
      where: and(
        eq(calendarConnections.user_id, userId),
        eq(calendarConnections.provider, 'google'),
        eq(calendarConnections.is_active, true)
      )
    });

    if (!connection) return null;

    const oauth2Client = this.getOAuth2Client();
    let accessToken = connection.access_token;

    // Refresh token if expired
    if (connection.refresh_token && connection.expires_at && new Date(connection.expires_at) < new Date()) {
      oauth2Client.setCredentials({ refresh_token: connection.refresh_token });
      try {
        const { credentials } = await oauth2Client.refreshAccessToken();
        accessToken = credentials.access_token || accessToken;
        
        await db.update(calendarConnections)
          .set({
            access_token: accessToken,
            expires_at: credentials.expiry_date ? new Date(credentials.expiry_date) : connection.expires_at,
            updated_at: new Date()
          })
          .where(eq(calendarConnections.id, connection.id));
      } catch (error) {
        logError('Failed to refresh Google token:', error);
        return null;
      }
    }

    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: connection.refresh_token
    });

    return google.calendar({ version: 'v3', auth: oauth2Client });
  }

  /**
   * Fetch user's schedule for a given timeframe
   */
  static async getSchedule(userId: string, timeMin: string, timeMax: string) {
    const calendar = await this.getAuthorizedClient(userId);
    if (!calendar) throw new Error('Google Calendar not connected');

    try {
      const response = await calendar.events.list({
        calendarId: 'primary',
        timeMin,
        timeMax,
        singleEvents: true,
        orderBy: 'startTime',
      });

      return response.data.items?.map(event => ({
        id: event.id,
        title: event.summary,
        startTime: event.start?.dateTime || event.start?.date,
        endTime: event.end?.dateTime || event.end?.date,
        location: event.location
      })) || [];
    } catch (error) {
      logError('Failed to fetch schedule:', error);
      throw error;
    }
  }

  /**
   * Check for conflicts in a given timeframe
   */
  static async checkConflicts(userId: string, startTime: string, endTime: string): Promise<boolean> {
    const schedule = await this.getSchedule(userId, startTime, endTime);
    return schedule.length > 0;
  }

  /**
   * Find next available slots (simplified implementation)
   */
  static async findAvailableSlots(userId: string, durationMinutes: number = 30, searchDays: number = 3) {
    const now = new Date();
    const endSearch = new Date(now.getTime() + searchDays * 24 * 60 * 60 * 1000);
    
    const schedule = await this.getSchedule(userId, now.toISOString(), endSearch.toISOString());
    
    // Logic to find free slots would go here
    // For now, return the schedule to let the agent decide
    return schedule;
  }

  /**
   * Create a new calendar event
   */
  static async createEvent(userId: string, eventData: CalendarEvent) {
    const calendar = await this.getAuthorizedClient(userId);
    if (!calendar) throw new Error('Google Calendar not connected');

    try {
      const response = await calendar.events.insert({
        calendarId: eventData.calendarId || 'primary',
        requestBody: {
          summary: eventData.title,
          description: eventData.description,
          start: { dateTime: eventData.startTime },
          end: { dateTime: eventData.endTime },
          location: eventData.location,
          attendees: eventData.attendees?.map(email => ({ email }))
        }
      });

      logInfo('Calendar event created successfully', { userId, eventId: response.data.id });
      return response.data;
    } catch (error) {
      logError('Failed to create event:', error);
      throw error;
    }
  }
}
