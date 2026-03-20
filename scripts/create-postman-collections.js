const fs = require('fs');
const path = require('path');

// Helper to create directory recursively
function mkdirp(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Helper to write YAML file
function writeYaml(filePath, content) {
  mkdirp(path.dirname(filePath));
  fs.writeFileSync(filePath, content);
  console.log(`Created: ${filePath}`);
}

const basePath = 'postman/collections';

// ============================================
// SoloSuccess - Core Features
// ============================================
const coreFeatures = {
  base: `${basePath}/solosuccess-core-features`,
  folders: {
    competitors: {
      order: 1000,
      description: 'Competitor tracking and analysis',
      requests: [
        {
          name: 'List Competitors',
          file: 'list-competitors',
          method: 'GET',
          url: '{{baseUrl}}/api/competitors',
          order: 1000
        },
        {
          name: 'Create Competitor',
          file: 'create-competitor',
          method: 'POST',
          url: '{{baseUrl}}/api/competitors',
          order: 2000,
          body: {
            name: 'Acme Corp',
            website: 'https://acme.com',
            description: 'Main competitor in the market',
            industry: 'Technology'
          }
        },
        {
          name: 'Get Competitor',
          file: 'get-competitor',
          method: 'GET',
          url: '{{baseUrl}}/api/competitors/{{competitorId}}',
          order: 3000,
          pathVars: [{ key: 'competitorId', value: '' }]
        },
        {
          name: 'Update Competitor',
          file: 'update-competitor',
          method: 'PATCH',
          url: '{{baseUrl}}/api/competitors/{{competitorId}}',
          order: 4000,
          pathVars: [{ key: 'competitorId', value: '' }],
          body: {
            name: 'Acme Corporation',
            notes: 'Updated competitor information'
          }
        },
        {
          name: 'Delete Competitor',
          file: 'delete-competitor',
          method: 'DELETE',
          url: '{{baseUrl}}/api/competitors/{{competitorId}}',
          order: 5000,
          pathVars: [{ key: 'competitorId', value: '' }]
        },
        {
          name: 'Analyze Competitor',
          file: 'analyze-competitor',
          method: 'POST',
          url: '{{baseUrl}}/api/competitors/{{competitorId}}/analyze',
          order: 6000,
          pathVars: [{ key: 'competitorId', value: '' }],
          body: {
            analysisType: 'full',
            includeInsights: true
          }
        }
      ]
    },
    goals: {
      order: 2000,
      description: 'Goal setting and tracking',
      requests: [
        {
          name: 'List Goals',
          file: 'list-goals',
          method: 'GET',
          url: '{{baseUrl}}/api/goals',
          order: 1000
        },
        {
          name: 'Create Goal',
          file: 'create-goal',
          method: 'POST',
          url: '{{baseUrl}}/api/goals',
          order: 2000,
          body: {
            title: 'Increase Revenue',
            description: 'Increase monthly revenue by 20%',
            targetDate: '2025-12-31',
            category: 'financial',
            milestones: []
          }
        },
        {
          name: 'Get Goal',
          file: 'get-goal',
          method: 'GET',
          url: '{{baseUrl}}/api/goals/{{goalId}}',
          order: 3000,
          pathVars: [{ key: 'goalId', value: '' }]
        },
        {
          name: 'Update Goal',
          file: 'update-goal',
          method: 'PATCH',
          url: '{{baseUrl}}/api/goals/{{goalId}}',
          order: 4000,
          pathVars: [{ key: 'goalId', value: '' }],
          body: {
            progress: 50,
            status: 'in_progress'
          }
        },
        {
          name: 'Delete Goal',
          file: 'delete-goal',
          method: 'DELETE',
          url: '{{baseUrl}}/api/goals/{{goalId}}',
          order: 5000,
          pathVars: [{ key: 'goalId', value: '' }]
        }
      ]
    },
    tasks: {
      order: 3000,
      description: 'Task management',
      requests: [
        {
          name: 'List Tasks',
          file: 'list-tasks',
          method: 'GET',
          url: '{{baseUrl}}/api/tasks',
          order: 1000
        },
        {
          name: 'Create Task',
          file: 'create-task',
          method: 'POST',
          url: '{{baseUrl}}/api/tasks',
          order: 2000,
          body: {
            title: 'Review competitor analysis',
            description: 'Review the latest competitor analysis report',
            priority: 'high',
            dueDate: '2025-01-15',
            goalId: null
          }
        },
        {
          name: 'Get Task',
          file: 'get-task',
          method: 'GET',
          url: '{{baseUrl}}/api/tasks/{{taskId}}',
          order: 3000,
          pathVars: [{ key: 'taskId', value: '' }]
        },
        {
          name: 'Update Task',
          file: 'update-task',
          method: 'PATCH',
          url: '{{baseUrl}}/api/tasks/{{taskId}}',
          order: 4000,
          pathVars: [{ key: 'taskId', value: '' }],
          body: {
            status: 'completed',
            completedAt: '2025-01-10T10:00:00Z'
          }
        },
        {
          name: 'Delete Task',
          file: 'delete-task',
          method: 'DELETE',
          url: '{{baseUrl}}/api/tasks/{{taskId}}',
          order: 5000,
          pathVars: [{ key: 'taskId', value: '' }]
        }
      ]
    },
    workspace: {
      order: 4000,
      description: 'Workspace management',
      requests: [
        {
          name: 'Get Workspace',
          file: 'get-workspace',
          method: 'GET',
          url: '{{baseUrl}}/api/workspace',
          order: 1000
        },
        {
          name: 'Update Workspace',
          file: 'update-workspace',
          method: 'PATCH',
          url: '{{baseUrl}}/api/workspace',
          order: 2000,
          body: {
            name: 'My Business Workspace',
            settings: {
              defaultView: 'dashboard',
              theme: 'dark'
            }
          }
        }
      ]
    },
    dashboard: {
      order: 5000,
      description: 'Dashboard and analytics',
      requests: [
        {
          name: 'Get Dashboard',
          file: 'get-dashboard',
          method: 'GET',
          url: '{{baseUrl}}/api/dashboard',
          order: 1000
        },
        {
          name: 'Get Dashboard Stats',
          file: 'get-dashboard-stats',
          method: 'GET',
          url: '{{baseUrl}}/api/dashboard/stats',
          order: 2000
        }
      ]
    },
    search: {
      order: 6000,
      description: 'Search functionality',
      requests: [
        {
          name: 'Search',
          file: 'search',
          method: 'GET',
          url: '{{baseUrl}}/api/search',
          order: 1000,
          queryParams: [
            { key: 'q', value: 'competitor' },
            { key: 'type', value: 'all' },
            { key: 'limit', value: '20' }
          ]
        }
      ]
    }
  }
};

// ============================================
// SoloSuccess - AI & Intelligence
// ============================================
const aiIntelligence = {
  base: `${basePath}/solosuccess-ai-intelligence`,
  folders: {
    chat: {
      order: 1000,
      description: 'AI chat and conversation management',
      requests: [
        {
          name: 'List Chats',
          file: 'list-chats',
          method: 'GET',
          url: '{{baseUrl}}/api/chat',
          order: 1000
        },
        {
          name: 'Create Chat',
          file: 'create-chat',
          method: 'POST',
          url: '{{baseUrl}}/api/chat',
          order: 2000,
          body: {
            title: 'Business Strategy Discussion',
            context: 'competitor_analysis'
          }
        },
        {
          name: 'Get Chat',
          file: 'get-chat',
          method: 'GET',
          url: '{{baseUrl}}/api/chat/{{chatId}}',
          order: 3000,
          pathVars: [{ key: 'chatId', value: '' }]
        },
        {
          name: 'Send Message',
          file: 'send-message',
          method: 'POST',
          url: '{{baseUrl}}/api/chat/{{chatId}}/messages',
          order: 4000,
          pathVars: [{ key: 'chatId', value: '' }],
          body: {
            content: 'Analyze my top competitor and suggest strategies',
            attachments: []
          }
        },
        {
          name: 'Delete Chat',
          file: 'delete-chat',
          method: 'DELETE',
          url: '{{baseUrl}}/api/chat/{{chatId}}',
          order: 5000,
          pathVars: [{ key: 'chatId', value: '' }]
        }
      ]
    },
    content: {
      order: 2000,
      description: 'AI content generation',
      requests: [
        {
          name: 'Generate Content',
          file: 'generate-content',
          method: 'POST',
          url: '{{baseUrl}}/api/content/generate',
          order: 1000,
          body: {
            type: 'blog_post',
            topic: 'Industry trends for 2025',
            tone: 'professional',
            length: 'medium',
            keywords: ['innovation', 'technology', 'growth']
          }
        },
        {
          name: 'List Generated Content',
          file: 'list-content',
          method: 'GET',
          url: '{{baseUrl}}/api/content',
          order: 2000
        },
        {
          name: 'Get Content',
          file: 'get-content',
          method: 'GET',
          url: '{{baseUrl}}/api/content/{{contentId}}',
          order: 3000,
          pathVars: [{ key: 'contentId', value: '' }]
        }
      ]
    },
    insights: {
      order: 3000,
      description: 'AI-powered business insights',
      requests: [
        {
          name: 'Get Insights',
          file: 'get-insights',
          method: 'GET',
          url: '{{baseUrl}}/api/insights',
          order: 1000
        },
        {
          name: 'Generate Insights',
          file: 'generate-insights',
          method: 'POST',
          url: '{{baseUrl}}/api/insights/generate',
          order: 2000,
          body: {
            scope: 'competitors',
            timeframe: 'last_30_days',
            includeRecommendations: true
          }
        },
        {
          name: 'Get Insight Detail',
          file: 'get-insight-detail',
          method: 'GET',
          url: '{{baseUrl}}/api/insights/{{insightId}}',
          order: 3000,
          pathVars: [{ key: 'insightId', value: '' }]
        }
      ]
    },
    intelligence: {
      order: 4000,
      description: 'Business intelligence features',
      requests: [
        {
          name: 'Get Intelligence Report',
          file: 'get-intelligence-report',
          method: 'GET',
          url: '{{baseUrl}}/api/intelligence/report',
          order: 1000
        },
        {
          name: 'Generate Intelligence Report',
          file: 'generate-intelligence-report',
          method: 'POST',
          url: '{{baseUrl}}/api/intelligence/report',
          order: 2000,
          body: {
            reportType: 'competitive_analysis',
            competitors: [],
            metrics: ['market_share', 'pricing', 'features']
          }
        }
      ]
    },
    suggestions: {
      order: 5000,
      description: 'AI suggestions and recommendations',
      requests: [
        {
          name: 'Get Suggestions',
          file: 'get-suggestions',
          method: 'GET',
          url: '{{baseUrl}}/api/suggestions',
          order: 1000
        },
        {
          name: 'Dismiss Suggestion',
          file: 'dismiss-suggestion',
          method: 'POST',
          url: '{{baseUrl}}/api/suggestions/{{suggestionId}}/dismiss',
          order: 2000,
          pathVars: [{ key: 'suggestionId', value: '' }]
        }
      ]
    }
  }
};

// ============================================
// SoloSuccess - Briefcase & Files
// ============================================
const briefcaseFiles = {
  base: `${basePath}/solosuccess-briefcase-files`,
  folders: {
    briefcase: {
      order: 1000,
      description: 'Briefcase document management',
      requests: [
        {
          name: 'List Briefcase Items',
          file: 'list-briefcase',
          method: 'GET',
          url: '{{baseUrl}}/api/briefcase',
          order: 1000
        },
        {
          name: 'Create Briefcase Item',
          file: 'create-briefcase-item',
          method: 'POST',
          url: '{{baseUrl}}/api/briefcase',
          order: 2000,
          body: {
            title: 'Q4 Strategy Document',
            type: 'document',
            content: 'Strategic planning document for Q4',
            tags: ['strategy', 'planning']
          }
        },
        {
          name: 'Get Briefcase Item',
          file: 'get-briefcase-item',
          method: 'GET',
          url: '{{baseUrl}}/api/briefcase/{{itemId}}',
          order: 3000,
          pathVars: [{ key: 'itemId', value: '' }]
        },
        {
          name: 'Update Briefcase Item',
          file: 'update-briefcase-item',
          method: 'PATCH',
          url: '{{baseUrl}}/api/briefcase/{{itemId}}',
          order: 4000,
          pathVars: [{ key: 'itemId', value: '' }],
          body: {
            title: 'Updated Q4 Strategy Document',
            tags: ['strategy', 'planning', 'updated']
          }
        },
        {
          name: 'Delete Briefcase Item',
          file: 'delete-briefcase-item',
          method: 'DELETE',
          url: '{{baseUrl}}/api/briefcase/{{itemId}}',
          order: 5000,
          pathVars: [{ key: 'itemId', value: '' }]
        }
      ]
    },
    files: {
      order: 2000,
      description: 'File upload and management',
      requests: [
        {
          name: 'List Files',
          file: 'list-files',
          method: 'GET',
          url: '{{baseUrl}}/api/files',
          order: 1000
        },
        {
          name: 'Upload File',
          file: 'upload-file',
          method: 'POST',
          url: '{{baseUrl}}/api/files/upload',
          order: 2000,
          formData: [
            { key: 'file', type: 'file', value: '' },
            { key: 'folder', type: 'text', value: 'documents' }
          ]
        },
        {
          name: 'Get File',
          file: 'get-file',
          method: 'GET',
          url: '{{baseUrl}}/api/files/{{fileId}}',
          order: 3000,
          pathVars: [{ key: 'fileId', value: '' }]
        },
        {
          name: 'Delete File',
          file: 'delete-file',
          method: 'DELETE',
          url: '{{baseUrl}}/api/files/{{fileId}}',
          order: 4000,
          pathVars: [{ key: 'fileId', value: '' }]
        }
      ]
    },
    folders: {
      order: 3000,
      description: 'Folder organization',
      requests: [
        {
          name: 'List Folders',
          file: 'list-folders',
          method: 'GET',
          url: '{{baseUrl}}/api/folders',
          order: 1000
        },
        {
          name: 'Create Folder',
          file: 'create-folder',
          method: 'POST',
          url: '{{baseUrl}}/api/folders',
          order: 2000,
          body: {
            name: 'Project Documents',
            parentId: null
          }
        },
        {
          name: 'Get Folder',
          file: 'get-folder',
          method: 'GET',
          url: '{{baseUrl}}/api/folders/{{folderId}}',
          order: 3000,
          pathVars: [{ key: 'folderId', value: '' }]
        },
        {
          name: 'Update Folder',
          file: 'update-folder',
          method: 'PATCH',
          url: '{{baseUrl}}/api/folders/{{folderId}}',
          order: 4000,
          pathVars: [{ key: 'folderId', value: '' }],
          body: {
            name: 'Renamed Folder'
          }
        },
        {
          name: 'Delete Folder',
          file: 'delete-folder',
          method: 'DELETE',
          url: '{{baseUrl}}/api/folders/{{folderId}}',
          order: 5000,
          pathVars: [{ key: 'folderId', value: '' }]
        }
      ]
    }
  }
};

// ============================================
// SoloSuccess - Alerts & Monitoring
// ============================================
const alertsMonitoring = {
  base: `${basePath}/solosuccess-alerts-monitoring`,
  folders: {
    alerts: {
      order: 1000,
      description: 'Alert configuration and management',
      requests: [
        {
          name: 'List Alerts',
          file: 'list-alerts',
          method: 'GET',
          url: '{{baseUrl}}/api/alerts',
          order: 1000
        },
        {
          name: 'Create Alert',
          file: 'create-alert',
          method: 'POST',
          url: '{{baseUrl}}/api/alerts',
          order: 2000,
          body: {
            name: 'Competitor Price Change',
            type: 'competitor_update',
            competitorId: null,
            conditions: {
              field: 'pricing',
              operator: 'changed'
            },
            channels: ['email', 'push']
          }
        },
        {
          name: 'Get Alert',
          file: 'get-alert',
          method: 'GET',
          url: '{{baseUrl}}/api/alerts/{{alertId}}',
          order: 3000,
          pathVars: [{ key: 'alertId', value: '' }]
        },
        {
          name: 'Update Alert',
          file: 'update-alert',
          method: 'PATCH',
          url: '{{baseUrl}}/api/alerts/{{alertId}}',
          order: 4000,
          pathVars: [{ key: 'alertId', value: '' }],
          body: {
            enabled: true,
            channels: ['email']
          }
        },
        {
          name: 'Delete Alert',
          file: 'delete-alert',
          method: 'DELETE',
          url: '{{baseUrl}}/api/alerts/{{alertId}}',
          order: 5000,
          pathVars: [{ key: 'alertId', value: '' }]
        },
        {
          name: 'Test Alert',
          file: 'test-alert',
          method: 'POST',
          url: '{{baseUrl}}/api/alerts/{{alertId}}/test',
          order: 6000,
          pathVars: [{ key: 'alertId', value: '' }]
        }
      ]
    },
    notifications: {
      order: 2000,
      description: 'Notification management',
      requests: [
        {
          name: 'List Notifications',
          file: 'list-notifications',
          method: 'GET',
          url: '{{baseUrl}}/api/notifications',
          order: 1000
        },
        {
          name: 'Mark Notification Read',
          file: 'mark-notification-read',
          method: 'PATCH',
          url: '{{baseUrl}}/api/notifications/{{notificationId}}',
          order: 2000,
          pathVars: [{ key: 'notificationId', value: '' }],
          body: {
            read: true
          }
        },
        {
          name: 'Mark All Read',
          file: 'mark-all-read',
          method: 'POST',
          url: '{{baseUrl}}/api/notifications/mark-all-read',
          order: 3000
        },
        {
          name: 'Delete Notification',
          file: 'delete-notification',
          method: 'DELETE',
          url: '{{baseUrl}}/api/notifications/{{notificationId}}',
          order: 4000,
          pathVars: [{ key: 'notificationId', value: '' }]
        }
      ]
    },
    monitoring: {
      order: 3000,
      description: 'Monitoring and tracking',
      requests: [
        {
          name: 'Get Monitoring Status',
          file: 'get-monitoring-status',
          method: 'GET',
          url: '{{baseUrl}}/api/monitoring/status',
          order: 1000
        },
        {
          name: 'Get Monitoring History',
          file: 'get-monitoring-history',
          method: 'GET',
          url: '{{baseUrl}}/api/monitoring/history',
          order: 2000,
          queryParams: [
            { key: 'startDate', value: '2025-01-01' },
            { key: 'endDate', value: '2025-01-31' }
          ]
        }
      ]
    }
  }
};

// ============================================
// SoloSuccess - Community & Billing
// ============================================
const communityBilling = {
  base: `${basePath}/solosuccess-community-billing`,
  folders: {
    community: {
      order: 1000,
      description: 'Community features and social interactions',
      requests: [
        {
          name: 'List Community Posts',
          file: 'list-posts',
          method: 'GET',
          url: '{{baseUrl}}/api/community/posts',
          order: 1000
        },
        {
          name: 'Create Post',
          file: 'create-post',
          method: 'POST',
          url: '{{baseUrl}}/api/community/posts',
          order: 2000,
          body: {
            title: 'Tips for competitor analysis',
            content: 'Here are my top tips for effective competitor analysis...',
            tags: ['tips', 'competitor-analysis']
          }
        },
        {
          name: 'Get Post',
          file: 'get-post',
          method: 'GET',
          url: '{{baseUrl}}/api/community/posts/{{postId}}',
          order: 3000,
          pathVars: [{ key: 'postId', value: '' }]
        },
        {
          name: 'Update Post',
          file: 'update-post',
          method: 'PATCH',
          url: '{{baseUrl}}/api/community/posts/{{postId}}',
          order: 4000,
          pathVars: [{ key: 'postId', value: '' }],
          body: {
            content: 'Updated content...'
          }
        },
        {
          name: 'Delete Post',
          file: 'delete-post',
          method: 'DELETE',
          url: '{{baseUrl}}/api/community/posts/{{postId}}',
          order: 5000,
          pathVars: [{ key: 'postId', value: '' }]
        },
        {
          name: 'Like Post',
          file: 'like-post',
          method: 'POST',
          url: '{{baseUrl}}/api/community/posts/{{postId}}/like',
          order: 6000,
          pathVars: [{ key: 'postId', value: '' }]
        }
      ]
    },
    billing: {
      order: 2000,
      description: 'Billing and payment management',
      requests: [
        {
          name: 'Get Billing Info',
          file: 'get-billing-info',
          method: 'GET',
          url: '{{baseUrl}}/api/billing',
          order: 1000
        },
        {
          name: 'Update Billing Info',
          file: 'update-billing-info',
          method: 'PATCH',
          url: '{{baseUrl}}/api/billing',
          order: 2000,
          body: {
            billingEmail: 'billing@example.com',
            address: {
              line1: '123 Main St',
              city: 'San Francisco',
              state: 'CA',
              postalCode: '94102',
              country: 'US'
            }
          }
        },
        {
          name: 'Get Invoices',
          file: 'get-invoices',
          method: 'GET',
          url: '{{baseUrl}}/api/billing/invoices',
          order: 3000
        },
        {
          name: 'Get Invoice',
          file: 'get-invoice',
          method: 'GET',
          url: '{{baseUrl}}/api/billing/invoices/{{invoiceId}}',
          order: 4000,
          pathVars: [{ key: 'invoiceId', value: '' }]
        }
      ]
    },
    subscription: {
      order: 3000,
      description: 'Subscription management',
      requests: [
        {
          name: 'Get Subscription',
          file: 'get-subscription',
          method: 'GET',
          url: '{{baseUrl}}/api/subscription',
          order: 1000
        },
        {
          name: 'Get Plans',
          file: 'get-plans',
          method: 'GET',
          url: '{{baseUrl}}/api/subscription/plans',
          order: 2000
        },
        {
          name: 'Create Subscription',
          file: 'create-subscription',
          method: 'POST',
          url: '{{baseUrl}}/api/subscription',
          order: 3000,
          body: {
            planId: 'pro_monthly',
            paymentMethodId: ''
          }
        },
        {
          name: 'Update Subscription',
          file: 'update-subscription',
          method: 'PATCH',
          url: '{{baseUrl}}/api/subscription',
          order: 4000,
          body: {
            planId: 'pro_annual'
          }
        },
        {
          name: 'Cancel Subscription',
          file: 'cancel-subscription',
          method: 'DELETE',
          url: '{{baseUrl}}/api/subscription',
          order: 5000
        }
      ]
    },
    stripe: {
      order: 4000,
      description: 'Stripe payment integration',
      requests: [
        {
          name: 'Create Checkout Session',
          file: 'create-checkout-session',
          method: 'POST',
          url: '{{baseUrl}}/api/stripe/checkout',
          order: 1000,
          body: {
            priceId: 'price_xxx',
            successUrl: '{{baseUrl}}/billing/success',
            cancelUrl: '{{baseUrl}}/billing/cancel'
          }
        },
        {
          name: 'Create Portal Session',
          file: 'create-portal-session',
          method: 'POST',
          url: '{{baseUrl}}/api/stripe/portal',
          order: 2000,
          body: {
            returnUrl: '{{baseUrl}}/billing'
          }
        },
        {
          name: 'Stripe Webhook',
          file: 'stripe-webhook',
          method: 'POST',
          url: '{{baseUrl}}/api/stripe/webhook',
          order: 3000,
          description: 'Webhook endpoint for Stripe events (called by Stripe)'
        }
      ]
    }
  }
};

// Function to generate request YAML
function generateRequestYaml(req) {
  let yaml = `$kind: http-request
name: ${req.name}
method: ${req.method}
url: '${req.url}'
order: ${req.order}
headers:
  - key: Content-Type
    value: application/json`;

  if (req.description) {
    yaml = `$kind: http-request
name: ${req.name}
description: ${req.description}
method: ${req.method}
url: '${req.url}'
order: ${req.order}
headers:
  - key: Content-Type
    value: application/json`;
  }

  if (req.pathVars && req.pathVars.length > 0) {
    yaml += `\npathVariables:`;
    req.pathVars.forEach(pv => {
      yaml += `\n  - key: ${pv.key}\n    value: '${pv.value}'`;
    });
  }

  if (req.queryParams && req.queryParams.length > 0) {
    yaml += `\nqueryParams:`;
    req.queryParams.forEach(qp => {
      yaml += `\n  - key: ${qp.key}\n    value: '${qp.value}'`;
    });
  }

  if (req.body) {
    yaml += `\nbody:
  type: json
  content: |-
    ${JSON.stringify(req.body, null, 2).split('\n').join('\n    ')}`;
  }

  if (req.formData) {
    yaml += `\nbody:
  type: formdata
  content:`;
    req.formData.forEach(fd => {
      yaml += `\n    - key: ${fd.key}\n      type: ${fd.type}\n      value: '${fd.value}'`;
    });
  }

  return yaml;
}

// Function to generate folder definition YAML
function generateFolderYaml(name, description, order) {
  return `$kind: collection
name: ${name.charAt(0).toUpperCase() + name.slice(1)}
description: ${description}
order: ${order}`;
}

// Process all collections
const collections = [coreFeatures, aiIntelligence, briefcaseFiles, alertsMonitoring, communityBilling];

collections.forEach(collection => {
  Object.entries(collection.folders).forEach(([folderName, folder]) => {
    // Create folder definition
    const folderPath = `${collection.base}/${folderName}/.resources/definition.yaml`;
    writeYaml(folderPath, generateFolderYaml(folderName, folder.description, folder.order));

    // Create requests
    folder.requests.forEach(req => {
      const requestPath = `${collection.base}/${folderName}/${req.file}.request.yaml`;
      writeYaml(requestPath, generateRequestYaml(req));
    });
  });
});

console.log('\nAll collections created successfully!');
