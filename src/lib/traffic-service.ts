import { db } from '@/db';
import { trafficLogs } from '@/db/schema/analytics';
import { logError } from '@/lib/logger';

export interface TrafficData {
  sessionId: string;
  userId?: string;
  url: string;
  referrer?: string;
  userAgent?: string;
  ipAddress?: string;
  metadata?: Record<string, any>;
}

export class TrafficService {
  /**
   * Logs a page view or API request for analytics tracking
   */
  static async logRequest(data: TrafficData): Promise<void> {
    try {
      await db.insert(trafficLogs).values({
        sessionId: data.sessionId,
        userId: data.userId || null,
        url: data.url,
        referrer: data.referrer || null,
        userAgent: data.userAgent || null,
        ipAddress: data.ipAddress || null,
        metadata: data.metadata || {},
      });
    } catch (error) {
      logError('TrafficService: Failed to log request', error);
      // We don't throw here to avoid breaking the main request flow
    }
  }

  /**
   * Identifies the primary attribution source for a session
   */
  static async getSessionAttribution(sessionId: string) {
    try {
      // Logic to find the first entry for this session to determine source
      const firstEntry = await db.query.trafficLogs.findFirst({
        where: (logs, { eq }) => eq(logs.sessionId, sessionId),
        orderBy: (logs, { asc }) => [asc(logs.timestamp)],
      });

      if (!firstEntry) return null;

      const referrer = firstEntry.referrer || 'direct';
      const url = new URL(firstEntry.url, 'http://localhost'); // base for relative urls
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
      if (refUrl.hostname.includes('google.com')) return 'google';
      if (refUrl.hostname.includes('facebook.com')) return 'facebook';
      if (refUrl.hostname.includes('twitter.com') || refUrl.hostname.includes('t.co')) return 'twitter';
      if (refUrl.hostname.includes('linkedin.com')) return 'linkedin';
      return refUrl.hostname;
    } catch {
      return 'unknown';
    }
  }
}
