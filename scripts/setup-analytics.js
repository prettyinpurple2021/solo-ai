#!/usr/bin/env node

/**
 * SoloBoss AI Platform - Analytics Setup Script
 * 
 * This script sets up comprehensive analytics tracking for the platform launch.
 */

const fs = require('fs');
const path = require('path');

class AnalyticsSetup {
  constructor() {
    this.analyticsConfig = {
      googleAnalytics: {
        trackingId: process.env.GA_TRACKING_ID || 'G-XXXXXXXXXX',
        measurementId: process.env.GA_MEASUREMENT_ID || 'G-XXXXXXXXXX'
      },
      conversionGoals: [
        {
          name: 'User Registration',
          type: 'event',
          eventName: 'user_registration',
          value: 1
        },
        {
          name: 'Plan Upgrade',
          type: 'event',
          eventName: 'plan_upgrade',
          value: 19
        },
        {
          name: 'Feature Usage',
          type: 'event',
          eventName: 'feature_used',
          value: 1
        },
        {
          name: 'AI Conversation',
          type: 'event',
          eventName: 'ai_conversation',
          value: 1
        }
      ],
      customDimensions: [
        { name: 'User Plan', index: 1 },
        { name: 'AI Agent Used', index: 2 },
        { name: 'Feature Category', index: 3 },
        { name: 'User Type', index: 4 }
      ],
      customMetrics: [
        { name: 'Conversations Per Day', index: 1 },
        { name: 'Features Used', index: 2 },
        { name: 'Session Duration', index: 3 },
        { name: 'Upgrade Value', index: 4 }
      ]
    };
  }

  /**
   * Generate Google Analytics 4 configuration
   */
  generateGA4Config() {
    const config = `
// Google Analytics 4 Configuration
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${this.analyticsConfig.googleAnalytics.measurementId}', {
  custom_map: {
    'custom_dimension1': 'user_plan',
    'custom_dimension2': 'ai_agent',
    'custom_dimension3': 'feature_category',
    'custom_dimension4': 'user_type',
    'custom_metric1': 'conversations_per_day',
    'custom_metric2': 'features_used',
    'custom_metric3': 'session_duration',
    'custom_metric4': 'upgrade_value'
  },
  page_title: document.title,
  page_location: window.location.href
});

// Track user registration
function trackUserRegistration(userId, plan = 'free') {
  gtag('event', 'user_registration', {
    user_id: userId,
    user_plan: plan,
    value: 1
  });
}

// Track plan upgrade
function trackPlanUpgrade(userId, fromPlan, toPlan, value) {
  gtag('event', 'plan_upgrade', {
    user_id: userId,
    from_plan: fromPlan,
    to_plan: toPlan,
    value: value
  });
}

// Track AI conversation
function trackAIConversation(userId, agent, conversationType) {
  gtag('event', 'ai_conversation', {
    user_id: userId,
    ai_agent: agent,
    conversation_type: conversationType,
    value: 1
  });
}

// Track feature usage
function trackFeatureUsage(userId, feature, category) {
  gtag('event', 'feature_used', {
    user_id: userId,
    feature_name: feature,
    feature_category: category,
    value: 1
  });
}

// Track page views
function trackPageView(pageTitle, pagePath) {
  gtag('event', 'page_view', {
    page_title: pageTitle,
    page_location: pagePath
  });
}

// Track custom events
function trackCustomEvent(eventName, parameters = {}) {
  gtag('event', eventName, parameters);
}

// Export functions for use in components
window.analytics = {
  trackUserRegistration,
  trackPlanUpgrade,
  trackAIConversation,
  trackFeatureUsage,
  trackPageView,
  trackCustomEvent
};
`;

    return config;
  }

  /**
   * Generate React hook for analytics
   */
  generateAnalyticsHook() {
    const hook = `
import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export const useAnalytics = () => {
  const router = useRouter();

  // Track page views
  useEffect(() => {
    const handleRouteChange = (url: string) => {
      if (typeof window !== 'undefined' && window.analytics) {
        window.analytics.trackPageView(document.title, url);
      }
    };

    // Track initial page load
    handleRouteChange(window.location.pathname);

    // Listen for route changes
    router.events?.on('routeChangeComplete', handleRouteChange);

    return () => {
      router.events?.off('routeChangeComplete', handleRouteChange);
    };
  }, [router]);

  // Track user registration
  const trackUserRegistration = useCallback((userId: string, plan: string = 'free') => {
    if (typeof window !== 'undefined' && window.analytics) {
      window.analytics.trackUserRegistration(userId, plan);
    }
  }, []);

  // Track plan upgrade
  const trackPlanUpgrade = useCallback((userId: string, fromPlan: string, toPlan: string, value: number) => {
    if (typeof window !== 'undefined' && window.analytics) {
      window.analytics.trackPlanUpgrade(userId, fromPlan, toPlan, value);
    }
  }, []);

  // Track AI conversation
  const trackAIConversation = useCallback((userId: string, agent: string, conversationType: string) => {
    if (typeof window !== 'undefined' && window.analytics) {
      window.analytics.trackAIConversation(userId, agent, conversationType);
    }
  }, []);

  // Track feature usage
  const trackFeatureUsage = useCallback((userId: string, feature: string, category: string) => {
    if (typeof window !== 'undefined' && window.analytics) {
      window.analytics.trackFeatureUsage(userId, feature, category);
    }
  }, []);

  // Track custom events
  const trackCustomEvent = useCallback((eventName: string, parameters: Record<string, any> = {}) => {
    if (typeof window !== 'undefined' && window.analytics) {
      window.analytics.trackCustomEvent(eventName, parameters);
    }
  }, []);

  return {
    trackUserRegistration,
    trackPlanUpgrade,
    trackAIConversation,
    trackFeatureUsage,
    trackCustomEvent
  };
};
`;

    return hook;
  }

  /**
   * Generate analytics dashboard configuration
   */
  generateDashboardConfig() {
    const config = {
      metrics: [
        {
          name: 'User Registrations',
          type: 'counter',
          query: 'user_registration',
          target: 1000,
          period: '30d'
        },
        {
          name: 'Conversion Rate',
          type: 'percentage',
          query: 'plan_upgrade / user_registration',
          target: 5,
          period: '30d'
        },
        {
          name: 'Monthly Recurring Revenue',
          type: 'currency',
          query: 'sum(plan_upgrade.value)',
          target: 5000,
          period: '30d'
        },
        {
          name: 'User Retention',
          type: 'percentage',
          query: 'returning_users / total_users',
          target: 40,
          period: '7d'
        },
        {
          name: 'AI Conversations',
          type: 'counter',
          query: 'ai_conversation',
          target: 10000,
          period: '30d'
        },
        {
          name: 'Feature Adoption',
          type: 'percentage',
          query: 'feature_used / active_users',
          target: 60,
          period: '30d'
        }
      ],
      dimensions: [
        {
          name: 'User Plan',
          query: 'user_plan',
          breakdown: ['free', 'accelerator', 'dominator']
        },
        {
          name: 'AI Agent Usage',
          query: 'ai_agent',
          breakdown: ['nova', 'echo', 'atlas', 'luna', 'phoenix', 'orion', 'vega']
        },
        {
          name: 'Feature Categories',
          query: 'feature_category',
          breakdown: ['task_management', 'goal_tracking', 'file_management', 'analytics']
        },
        {
          name: 'User Types',
          query: 'user_type',
          breakdown: ['entrepreneur', 'freelancer', 'small_business']
        }
      ]
    };

    return JSON.stringify(config, null, 2);
  }

  /**
   * Generate A/B testing configuration
   */
  generateABTestingConfig() {
    const config = {
      experiments: [
        {
          name: 'pricing_page_variant',
          variants: [
            {
              name: 'control',
              weight: 50,
              description: 'Original pricing page'
            },
            {
              name: 'test',
              weight: 50,
              description: 'New pricing page with testimonials'
            }
          ],
          metrics: ['conversion_rate', 'revenue_per_user'],
          duration: '30d'
        },
        {
          name: 'landing_page_cta',
          variants: [
            {
              name: 'control',
              weight: 50,
              description: 'Original CTA button'
            },
            {
              name: 'test',
              weight: 50,
              description: 'New CTA with urgency'
            }
          ],
          metrics: ['click_through_rate', 'signup_rate'],
          duration: '14d'
        }
      ]
    };

    return JSON.stringify(config, null, 2);
  }

  /**
   * Setup all analytics files
   */
  async setupAnalytics() {
    console.log('🚀 Setting up SoloBoss AI Platform Analytics...\n');

    try {
      // Create analytics directory
      const analyticsDir = path.join(process.cwd(), 'lib', 'analytics');
      if (!fs.existsSync(analyticsDir)) {
        fs.mkdirSync(analyticsDir, { recursive: true });
      }

      // Generate GA4 configuration
      const ga4Config = this.generateGA4Config();
      fs.writeFileSync(path.join(analyticsDir, 'ga4-config.js'), ga4Config);
      console.log('✅ Generated Google Analytics 4 configuration');

      // Generate React hook
      const analyticsHook = this.generateAnalyticsHook();
      fs.writeFileSync(path.join(analyticsDir, 'use-analytics.ts'), analyticsHook);
      console.log('✅ Generated React analytics hook');

      // Generate dashboard configuration
      const dashboardConfig = this.generateDashboardConfig();
      fs.writeFileSync(path.join(analyticsDir, 'dashboard-config.json'), dashboardConfig);
      console.log('✅ Generated analytics dashboard configuration');

      // Generate A/B testing configuration
      const abTestingConfig = this.generateABTestingConfig();
      fs.writeFileSync(path.join(analyticsDir, 'ab-testing-config.json'), abTestingConfig);
      console.log('✅ Generated A/B testing configuration');

      // Generate environment variables template
      const envTemplate = `
# Analytics Configuration
GA_TRACKING_ID=G-XXXXXXXXXX
GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Conversion Tracking
CONVERSION_GOALS_ENABLED=true
AB_TESTING_ENABLED=true

# Performance Monitoring
PERFORMANCE_TRACKING_ENABLED=true
ERROR_TRACKING_ENABLED=true
`;

      fs.writeFileSync(path.join(analyticsDir, '.env.analytics.example'), envTemplate);
      console.log('✅ Generated environment variables template');

      console.log('\n📊 Analytics Setup Complete!');
      console.log('\n📋 Next Steps:');
      console.log('1. Add your Google Analytics tracking ID to .env.local');
      console.log('2. Include ga4-config.js in your _app.tsx or layout.tsx');
      console.log('3. Use the useAnalytics hook in your components');
      console.log('4. Set up conversion goals in Google Analytics');
      console.log('5. Configure A/B testing experiments');

    } catch (error) {
      console.error('❌ Error setting up analytics:', error);
      throw error;
    }
  }

  /**
   * Generate analytics documentation
   */
  generateDocumentation() {
    const docs = `# 📊 SoloBoss AI Platform - Analytics Documentation

## Overview
This document describes the analytics setup for the SoloBoss AI Platform launch.

## Tracking Events

### User Registration
- **Event:** user_registration
- **Parameters:** user_id, user_plan
- **Value:** 1

### Plan Upgrade
- **Event:** plan_upgrade
- **Parameters:** user_id, from_plan, to_plan
- **Value:** upgrade_amount

### AI Conversation
- **Event:** ai_conversation
- **Parameters:** user_id, ai_agent, conversation_type
- **Value:** 1

### Feature Usage
- **Event:** feature_used
- **Parameters:** user_id, feature_name, feature_category
- **Value:** 1

## Custom Dimensions

1. **User Plan** (custom_dimension1)
   - Values: free, accelerator, dominator

2. **AI Agent** (custom_dimension2)
   - Values: nova, echo, atlas, luna, phoenix, orion, vega

3. **Feature Category** (custom_dimension3)
   - Values: task_management, goal_tracking, file_management, analytics

4. **User Type** (custom_dimension4)
   - Values: entrepreneur, freelancer, small_business

## Custom Metrics

1. **Conversations Per Day** (custom_metric1)
2. **Features Used** (custom_metric2)
3. **Session Duration** (custom_metric3)
4. **Upgrade Value** (custom_metric4)

## Implementation

### 1. Include Analytics Script
Add the following to your layout.tsx or _app.tsx:

\`\`\`tsx
import Script from 'next/script';

export default function Layout({ children }) {
  return (
    <>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
        strategy="afterInteractive"
      />
      <Script id="ga4-config" strategy="afterInteractive">
        {ga4Config}
      </Script>
      {children}
    </>
  );
}
\`\`\`

### 2. Use Analytics Hook
\`\`\`tsx
import { useAnalytics } from '@/lib/analytics/use-analytics';

export default function MyComponent() {
  const { trackUserRegistration, trackAIConversation } = useAnalytics();

  const handleSignup = () => {
    trackUserRegistration('user123', 'free');
  };

  const handleAIChat = () => {
    trackAIConversation('user123', 'nova', 'general');
  };

  return (
    // Your component JSX
  );
}
\`\`\`

## Launch Metrics

### Success Criteria (30 Days)
- **User Registrations:** 1,000+
- **Conversion Rate:** 5%+
- **Monthly Revenue:** $5,000+
- **User Retention:** 40%+
- **AI Conversations:** 10,000+

### Key Performance Indicators
1. **User Acquisition**
   - Website traffic
   - Sign-up conversion rate
   - Cost per acquisition

2. **User Engagement**
   - Daily active users
   - Feature adoption rate
   - Session duration

3. **Revenue Metrics**
   - Monthly recurring revenue
   - Average revenue per user
   - Customer lifetime value

## A/B Testing

### Current Experiments
1. **Pricing Page Variant**
   - Control: Original pricing page
   - Test: New pricing page with testimonials

2. **Landing Page CTA**
   - Control: Original CTA button
   - Test: New CTA with urgency

## Monitoring

### Daily Monitoring
- User registration trends
- Conversion rate changes
- Error rates
- Performance metrics

### Weekly Analysis
- Feature adoption rates
- User retention patterns
- Revenue trends
- A/B test results

### Monthly Review
- Overall platform performance
- User satisfaction scores
- Competitive analysis
- Strategy adjustments
`;

    return docs;
  }
}

// Run the analytics setup
if (require.main === module) {
  const analyticsSetup = new AnalyticsSetup();
  analyticsSetup.setupAnalytics()
    .then(() => {
      // Generate documentation
      const docs = analyticsSetup.generateDocumentation();
      fs.writeFileSync('docs/analytics-setup.md', docs);
      console.log('✅ Generated analytics documentation');
      console.log('\n🎉 Analytics setup completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Analytics setup failed:', error);
      process.exit(1);
    });
}

module.exports = AnalyticsSetup;
