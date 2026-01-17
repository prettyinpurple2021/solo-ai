import { pgTable, serial, text, integer, timestamp, jsonb, boolean } from 'drizzle-orm/pg-core';

// ========================================
// USERS & AUTHENTICATION
// ========================================

export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    email: text('email').unique(),
    password: text('password'), // Hashed password
    name: text('name'), // NextAuth standard
    full_name: text('full_name'), // App specific
    username: text('username').unique(),
    image: text('image'),
    date_of_birth: timestamp('date_of_birth'),
    stackUserId: text('stack_user_id').unique(), // Stack Auth user ID (optional now)
    role: text('role').default('user'), // 'user' | 'admin'
    adminPinHash: text('admin_pin_hash'), // Hashed PIN for admin access
    xp: integer('xp').default(0),
    level: integer('level').default(1),
    totalActions: integer('total_actions').default(0),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
    // Suspension fields for Admin
    suspended: boolean('suspended').default(false),
    suspendedAt: timestamp('suspended_at'),
    suspendedReason: text('suspended_reason'),
});

// ========================================
// SUBSCRIPTIONS & BILLING
// ========================================

export const subscriptions = pgTable('subscriptions', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    stripeCustomerId: text('stripe_customer_id').unique(),
    stripeSubscriptionId: text('stripe_subscription_id').unique(),
    stripePriceId: text('stripe_price_id'),
    tier: text('tier').notNull(), // 'starter' | 'professional' | 'empire'
    status: text('status').notNull(), // 'active' | 'canceled' | 'past_due' | 'trialing'
    currentPeriodStart: timestamp('current_period_start'),
    currentPeriodEnd: timestamp('current_period_end'),
    cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false),
    trialEndsAt: timestamp('trial_ends_at'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

export const usageTracking = pgTable('usage_tracking', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    month: text('month').notNull(), // 'YYYY-MM'
    aiGenerations: integer('ai_generations').default(0),
    competitorsTracked: integer('competitors_tracked').default(0),
    businessProfiles: integer('business_profiles').default(1),
    createdAt: timestamp('created_at').defaultNow(),
});

// ========================================
// ADMIN
// ========================================

export const adminActions = pgTable('admin_actions', {
    id: serial('id').primaryKey(),
    adminUserId: integer('admin_user_id').notNull().references(() => users.id),
    action: text('action').notNull(), // 'user_suspended', 'subscription_refunded', etc.
    targetUserId: integer('target_user_id'),
    details: jsonb('details'),
    createdAt: timestamp('created_at').defaultNow(),
});

// ========================================
// CORE DATA
// ========================================

export const tasks = pgTable('tasks', {
    id: text('id').primaryKey(),
    userId: text('user_id'), // Multi-user support
    title: text('title').notNull(),
    description: text('description'),
    assignee: text('assignee').notNull(),
    priority: text('priority').notNull(),
    status: text('status').default('todo'),
    estimatedTime: text('estimated_time'),
    createdAt: timestamp('created_at').defaultNow(),
    completedAt: timestamp('completed_at'),
});

export const chatHistory = pgTable('chat_history', {
    id: serial('id').primaryKey(),
    userId: text('user_id'), // Multi-user support
    agentId: text('agent_id').notNull(),
    role: text('role').notNull(),
    text: text('text').notNull(),
    timestamp: text('timestamp').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
});

export const competitorReports = pgTable('competitor_reports', {
    id: serial('id').primaryKey(),
    userId: text('user_id'), // Multi-user support
    competitorName: text('competitor_name').notNull(),
    threatLevel: text('threat_level'),
    data: jsonb('data'),
    generatedAt: timestamp('generated_at').defaultNow(),
});

export const businessContext = pgTable('business_context', {
    id: serial('id').primaryKey(),
    userId: text('user_id'), // Multi-user support
    companyName: text('company_name'),
    founderName: text('founder_name'),
    industry: text('industry'),
    description: text('description'),
    brandDna: jsonb('brand_dna'),
    updatedAt: timestamp('updated_at').defaultNow(),
});

// ========================================
// UNIVERSAL SEARCH
// ========================================

export const searchIndex = pgTable('search_index', {
    id: serial('id').primaryKey(),
    userId: text('user_id').notNull(),
    entityType: text('entity_type').notNull(), // 'task' | 'chat' | 'warroom' | 'contact' | 'report'
    entityId: text('entity_id').notNull(),
    title: text('title').notNull(),
    content: text('content').notNull(), // Full searchable content
    tags: text('tags').array(), // For filtering
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

// ========================================
// NOTIFICATIONS
// ========================================

export const notifications = pgTable('notifications', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').notNull(), // 'email' | 'sms' | 'in_app'
    category: text('category').notNull(), // 'deadline' | 'financial' | 'competitive' | 'system'
    title: text('title').notNull(),
    message: text('message').notNull(),
    priority: text('priority').notNull(), // 'low' | 'medium' | 'high' | 'critical'
    read: boolean('read').default(false),
    actionUrl: text('action_url'), // Where to navigate when clicked
    sentAt: timestamp('sent_at'),
    createdAt: timestamp('created_at').defaultNow(),
});

export const notificationPreferences = pgTable('notification_preferences', {
    userId: integer('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
    emailEnabled: boolean('email_enabled').default(true),
    smsEnabled: boolean('sms_enabled').default(false),
    inAppEnabled: boolean('in_app_enabled').default(true),
    taskDeadlines: boolean('task_deadlines').default(true),
    financialAlerts: boolean('financial_alerts').default(true),
    competitorAlerts: boolean('competitor_alerts').default(true),
    dailyDigest: boolean('daily_digest').default(true),
    digestTime: text('digest_time').default('08:00'), // HH:MM format
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

// ========================================
// DAILY INTELLIGENCE
// ========================================

export const dailyIntelligence = pgTable('daily_intelligence', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    date: text('date').notNull(), // YYYY-MM-DD
    priorityActions: jsonb('priority_actions'), // Array of priority action objects
    alerts: jsonb('alerts'), // Array of alert objects
    insights: jsonb('insights'), // Array of insight objects
    motivationalMessage: text('motivational_message'),
    generatedAt: timestamp('generated_at').defaultNow(),
});

// ========================================
// RESOURCES & CRM
// ========================================

export const pitchDecks = pgTable('pitch_decks', {
    id: text('id').primaryKey(),
    userId: integer('user_id').notNull(),
    title: text('title').notNull(),
    content: jsonb('content'),
    slides: jsonb('slides'),
    status: text('status').default('draft'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

export const contacts = pgTable('contacts', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').notNull(),
    name: text('name').notNull(),
    email: text('email'),
    phone: text('phone'),
    company: text('company'),
    role: text('role'),
    notes: text('notes'),
    linkedinUrl: text('linkedin_url'),
    tags: text('tags').array(),
    lastContact: timestamp('last_contact'),
    relationship: text('relationship'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

export const sops = pgTable('sops', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').notNull(),
    taskName: text('task_name'),
    goal: text('goal'),
    content: jsonb('content'),
    generatedAt: timestamp('generated_at').defaultNow(),
});

export const jobDescriptions = pgTable('job_descriptions', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').notNull(),
    roleTitle: text('role_title'),
    content: jsonb('content'),
    generatedAt: timestamp('generated_at').defaultNow(),
});

export const interviewGuides = pgTable('interview_guides', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').notNull(),
    roleTitle: text('role_title'),
    content: jsonb('content'),
    generatedAt: timestamp('generated_at').defaultNow(),
});

export const productSpecs = pgTable('product_specs', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').notNull(),
    title: text('title'),
    content: jsonb('content'),
    generatedAt: timestamp('generated_at').defaultNow(),
});

export const pivotAnalyses = pgTable('pivot_analyses', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').notNull(),
    gaps: jsonb('gaps'),
    content: jsonb('content'),
    generatedAt: timestamp('generated_at').defaultNow(),
});

export const legalDocs = pgTable('legal_docs', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').notNull(),
    title: text('title'),
    content: text('content'),
    generatedAt: timestamp('generated_at').defaultNow(),
});

export const trainingHistory = pgTable('training_history', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').notNull(),
    title: text('title'),
    content: jsonb('content'),
    timestamp: timestamp('timestamp').defaultNow(),
});

export const simulations = pgTable('simulations', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').notNull(),
    scenario: text('scenario'),
    results: jsonb('results'),
    timestamp: timestamp('timestamp').defaultNow(),
});

export const campaigns = pgTable('campaigns', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').notNull(),
    title: text('title'),
    content: jsonb('content'),
    generatedAt: timestamp('generated_at').defaultNow(),
});

export const creativeAssets = pgTable('creative_assets', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').notNull(),
    title: text('title'),
    content: jsonb('content'), // urls or base64
    generatedAt: timestamp('generated_at').defaultNow(),
});

export const codeSnippets = pgTable('code_snippets', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').notNull(),
    title: text('title'),
    code: text('code'),
    language: text('language'),
    description: text('description'),
    generatedAt: timestamp('generated_at').defaultNow(),
});

export const launchStrategies = pgTable('launch_strategies', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').notNull(),
    productName: text('product_name'),
    launchDate: text('launch_date'),
    content: jsonb('content'),
    generatedAt: timestamp('generated_at').defaultNow(),
});

export const tribeBlueprints = pgTable('tribe_blueprints', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').notNull(),
    audience: text('audience'),
    content: jsonb('content'),
    generatedAt: timestamp('generated_at').defaultNow(),
});

export const boardReports = pgTable('board_reports', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').notNull(),
    ceoScore: integer('ceo_score'),
    consensus: text('consensus'),
    executiveSummary: text('executive_summary'),
    grades: jsonb('grades'),
    generatedAt: timestamp('generated_at').defaultNow(),
});

export const warRoomSessions = pgTable('war_room_sessions', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').notNull(),
    topic: text('topic'),
    consensus: text('consensus'),
    actionPlan: jsonb('action_plan'), // array of strings
    timestamp: timestamp('timestamp').defaultNow(),
});

export const agentInstructions = pgTable('agent_instructions', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').notNull(),
    agentId: text('agent_id'),
    instructions: text('instructions'),
    updatedAt: timestamp('updated_at').defaultNow(),
});

// ========================================
// COMMUNITY
// ========================================

export const communityPosts = pgTable('community_posts', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    content: text('content').notNull(),
    image: text('image'),
    likes: integer('likes').default(0),
    comments: integer('comments').default(0),
    shares: integer('shares').default(0),
    tags: text('tags').array(),
    createdAt: timestamp('created_at').defaultNow(),
});

export const communityComments = pgTable('community_comments', {
    id: serial('id').primaryKey(),
    postId: integer('post_id').notNull().references(() => communityPosts.id, { onDelete: 'cascade' }),
    userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    content: text('content').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
});

export const communityLikes = pgTable('community_likes', {
    id: serial('id').primaryKey(),
    postId: integer('post_id').notNull().references(() => communityPosts.id, { onDelete: 'cascade' }),
    userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow(),
});

// ========================================
// CHALLENGES & MISSIONS
// ========================================

export const challenges = pgTable('challenges', {
    id: serial('id').primaryKey(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    category: text('category').notNull(), // e.g., "Technology", "Exploration"
    difficulty: text('difficulty').notNull(), // "Easy", "Hard", "Legendary"
    rewardPoints: integer('reward_points').default(0).notNull(),
    rewardBadge: text('reward_badge'),
    deadline: timestamp('deadline'),
    createdAt: timestamp('created_at').defaultNow(),
});

export const userChallenges = pgTable('user_challenges', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    challengeId: integer('challenge_id').notNull().references(() => challenges.id, { onDelete: 'cascade' }),
    status: text('status').default('active').notNull(), // "active", "completed", "failed"
    progress: integer('progress').default(0),
    joinedAt: timestamp('joined_at').defaultNow(),
    completedAt: timestamp('completed_at'),
});
