import { db } from '@/db/index';
import { trafficLogs } from '@/shared/db/schema/analytics';
import { logError, logWarn } from '@/lib/logger';
import { z } from 'zod';

export interface TrafficData {
  sessionId: string;
  userId?: string;
  url: string;
  referrer?: string;
  userAgent?: string;
  ipAddress?: string;
  metadata?: Record<string, any>;
}

const UUID_SCHEMA = z.string().uuid();

export class TrafficService {
  /**
   * Logs a page view or API request for analytics tracking
   */
  static async logRequest(data: TrafficData): Promise<void> {
    try {
      // Validate sessionId is a UUID to prevent DB errors
      const sessionIdParse = UUID_SCHEMA.safeParse(data.sessionId);
      if (!sessionIdParse.success) {
        logWarn('TrafficService: Invalid sessionId provided', { sessionId: data.sessionId });
        return;
      }

      // We allow userId to be non-uuid as it might be a Clerk ID or similar string
      
      // Basic URL normalization
      let sanitizedUrl = data.url;
      try {
        const urlObj = new URL(data.url, 'http://localhost');
        sanitizedUrl = urlObj.toString();
      } catch (e) {
        logWarn('TrafficService: Invalid URL provided', { url: data.url });
      }

      await db.insert(trafficLogs).values({
        sessionId: sessionIdParse.data,
        userId: data.userId || null,
        url: sanitizedUrl,
        referrer: data.referrer || null,
        userAgent: data.userAgent || null,
        ipAddress: data.ipAddress || null,
        metadata: data.metadata || {},
      });
    } catch (error) {
      // If the table isn't deployed yet, fail silently (do not spam logs on every request).
      const e = error as any
      const message = typeof e?.message === 'string' ? e.message : ''
      if (e?.code === '42P01' || message.includes('relation "traffic_logs" does not exist')) {
        return
      }
      logError(
        'TrafficService: Failed to log request',
        {
          code: typeof e?.code === 'string' ? e.code : undefined,
          message,
          detail: typeof e?.detail === 'string' ? e.detail : undefined,
          hint: typeof e?.hint === 'string' ? e.hint : undefined,
          constraint: typeof e?.constraint === 'string' ? e.constraint : undefined,
        },
        e instanceof Error ? e : undefined,
      )
      // We don't throw here to avoid breaking the main request flow
    }
  }

  /**
   * Identifies the primary attribution source for a session
   */
  static async getSessionAttribution(sessionId: string) {
    try {
      const sessionIdParse = UUID_SCHEMA.safeParse(sessionId);
      if (!sessionIdParse.success) return null;

      // Logic to find the first entry for this session to determine source
      const firstEntry = await db.query.trafficLogs.findFirst({
        where: (logs, { eq }) => eq(logs.sessionId, sessionIdParse.data),
        orderBy: (logs, { asc }) => [asc(logs.timestamp)],
      });

      if (!firstEntry) return null;

      const referrer = firstEntry.referrer || 'direct';
      let url: URL;
      try {
        url = new URL(firstEntry.url, 'http://localhost');
      } catch (e) {
        return null;
      }
      
      const utmSource = url.searchParams.get('utm_source');
      const utmMedium = url.searchParams.get('utm_medium');
      const utmCampaign = url.searchParams.get('utm_campaign');

      return {
        source: utmSource || this.parseSourceFromReferrer(referrer),
        medium: utmMedium || (referrer === 'direct' ? 'none' : 'referral'),
        campaign: utmCampaign || 'none',
        firstVisitAt: firstEntry.timestamp,
      };
    } catch (error) {
      logError('TrafficService: Failed to get session attribution', error);
      return null;
    }
  }

  private static parseSourceFromReferrer(referrer: string): string {
    if (referrer === 'direct') return 'direct';
    try {
      const refUrl = new URL(referrer);
      const host = refUrl.hostname.toLowerCase();
      
      if (host.includes('google.com')) return 'google';
      if (host.includes('facebook.com') || host.includes('fb.com')) return 'facebook';
      if (host.includes('twitter.com') || host.includes('t.co') || host.includes('x.com')) return 'twitter';
      if (host.includes('linkedin.com')) return 'linkedin';
      if (host.includes('instagram.com')) return 'instagram';
      if (host.includes('youtube.com') || host.includes('youtu.be')) return 'youtube';
      
      return host;
    } catch {
      return 'unknown';
    }
  }
}
