
import { integer, pgTable, varchar, text, timestamp, boolean, jsonb, decimal, index, uniqueIndex, foreignKey, primaryKey, pgEnum } from 'drizzle-orm/pg-core';
import { v4 as uuidv4 } from 'uuid';
import { relations } from 'drizzle-orm';
import { type AdapterAccount } from "next-auth/adapters" // Assuming this is needed if strictly typing, but Drizzle usually infers.

// Users table - NextAuth compatible
export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => uuidv4()),
  name: text('name'),
  email: text('email').notNull().unique(),
  stackUserId: text('stack_user_id').unique(),
  emailVerified: timestamp('emailVerified', { mode: 'date' }),
  image: text('image'),
  password: text('password'), // For Credentials provider
  username: text('username'),
  full_name: text('full_name'),
  bio: text('bio'),
  role: text('role').notNull().default('user'),
  xp: integer('xp').default(0),
  level: integer('level').default(1),
  total_actions: integer('total_actions').default(0),
  suspended: boolean('suspended').default(false),
  admin_pin_hash: text('admin_pin_hash'),
  suspended_at: timestamp('suspended_at'),
  suspended_reason: text('suspended_reason'),
  stripe_customer_id: text('stripe_customer_id'),
  subscription_tier: text('subscription_tier').notNull().default('free'),
  subscription_status: text('subscription_status').default('active'),
  stripe_subscription_id: text('stripe_subscription_id'),
  current_period_start: timestamp('current_period_start'),
  current_period_end: timestamp('current_period_end'),
  cancel_at_period_end: boolean('cancel_at_period_end').default(false),
  date_of_birth: timestamp('date_of_birth'),
  is_verified: boolean('is_verified').default(false),
  onboarding_completed: boolean('onboarding_completed').notNull().default(false),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccount["type"]>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
)

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
})

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
)

export const authenticators = pgTable(
  "authenticator",
  {
    credentialID: text("credentialID").notNull().unique(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    providerAccountId: text("providerAccountId").notNull(),
    credentialPublicKey: text("credentialPublicKey").notNull(),
    counter: integer("counter").notNull(),
    credentialDeviceType: text("credentialDeviceType").notNull(),
    credentialBackedUp: boolean("credentialBackedUp").notNull(),
    transports: text("transports"),
  },
  (authenticator) => ({
    compositePK: primaryKey({
      columns: [authenticator.userId, authenticator.credentialID],
    }),
  })
)

// Password reset tokens table
export const passwordResetTokens = pgTable('password_reset_tokens', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: varchar('token', { length: 255 }).notNull().unique(),
  expires_at: timestamp('expires_at').notNull(),
  used_at: timestamp('used_at'),
  ip_address: varchar('ip_address', { length: 45 }),
  user_agent: text('user_agent'),
  created_at: timestamp('created_at').defaultNow(),
}, (table) => ({
  userIdIdx: index('password_reset_tokens_user_id_idx').on(table.user_id),
  tokenIdx: index('password_reset_tokens_token_idx').on(table.token),
  expiresAtIdx: index('password_reset_tokens_expires_at_idx').on(table.expires_at),
  usedAtIdx: index('password_reset_tokens_used_at_idx').on(table.used_at),
}));

// User 2FA/MFA settings table
export const userMfaSettings = pgTable('user_mfa_settings', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
  totp_secret: varchar('totp_secret', { length: 255 }),
  totp_enabled: boolean('totp_enabled').default(false),
  totp_backup_codes: jsonb('totp_backup_codes').default('[]'),
  webauthn_enabled: boolean('webauthn_enabled').default(false),
  webauthn_credentials: jsonb('webauthn_credentials').default('[]'),
  recovery_codes: jsonb('recovery_codes').default('[]'),
  mfa_required: boolean('mfa_required').default(false),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
}, (table) => ({
  userIdIdx: index('user_mfa_settings_user_id_idx').on(table.user_id),
  totpEnabledIdx: index('user_mfa_settings_totp_enabled_idx').on(table.totp_enabled),
  webauthnEnabledIdx: index('user_mfa_settings_webauthn_enabled_idx').on(table.webauthn_enabled),
}));

// Device approvals table
export const deviceApprovals = pgTable('device_approvals', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  device_fingerprint: varchar('device_fingerprint', { length: 255 }).notNull(),
  device_name: varchar('device_name', { length: 255 }),
  device_type: varchar('device_type', { length: 50 }),
  ip_address: varchar('ip_address', { length: 45 }),
  user_agent: text('user_agent'),
  is_approved: boolean('is_approved').default(false),
  approved_at: timestamp('approved_at'),
  approved_by: varchar('approved_by', { length: 255 }).references(() => users.id),
  expires_at: timestamp('expires_at'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
}, (table) => ({
  userIdIdx: index('device_approvals_user_id_idx').on(table.user_id),
  deviceFingerprintIdx: index('device_approvals_device_fingerprint_idx').on(table.device_fingerprint),
  isApprovedIdx: index('device_approvals_is_approved_idx').on(table.is_approved),
  expiresAtIdx: index('device_approvals_expires_at_idx').on(table.expires_at),
}));

// User Sessions table for cookie-based auth
export const userSessions = pgTable('user_sessions', {
  id: varchar('id', { length: 255 }).primaryKey(),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  refresh_token: varchar('refresh_token', { length: 500 }).notNull().unique(),
  device_fingerprint: varchar('device_fingerprint', { length: 255 }).notNull(),
  device_name: varchar('device_name', { length: 255 }),
  device_type: varchar('device_type', { length: 50 }),
  ip_address: varchar('ip_address', { length: 45 }),
  user_agent: text('user_agent'),
  is_remember_me: boolean('is_remember_me').default(false),
  remember_me_expires_at: timestamp('remember_me_expires_at'),
  last_activity: timestamp('last_activity').defaultNow(),
  expires_at: timestamp('expires_at').notNull(),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
}, (table) => ({
  userIdIdx: index('user_sessions_user_id_idx').on(table.user_id),
  refreshTokenIdx: index('user_sessions_refresh_token_idx').on(table.refresh_token),
  deviceFingerprintIdx: index('user_sessions_device_fingerprint_idx').on(table.device_fingerprint),
  expiresAtIdx: index('user_sessions_expires_at_idx').on(table.expires_at),
  lastActivityIdx: index('user_sessions_last_activity_idx').on(table.last_activity),
}));

// User API Keys table
export const userApiKeys = pgTable('user_api_keys', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  service: varchar('service', { length: 100 }).notNull(), 
  key_value: text('key_value').notNull(), 
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
}, (table) => ({
  userIdIdx: index('user_api_keys_user_id_idx').on(table.user_id),
  serviceIdx: index('user_api_keys_service_idx').on(table.service),
  userServiceIdx: index('user_api_keys_user_service_idx').on(table.user_id, table.service),
}));

// Notifications
export const notifications = pgTable("notifications", {
  id: text("id").primaryKey().$defaultFn(() => uuidv4()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: varchar("type", { length: 50 }).notNull(), // alert, reminder, achievement, system
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  priority: varchar("priority", { length: 20 }).default('medium'),
  actionUrl: text("action_url"),
  isRead: boolean("is_read").default(false),
  metadata: jsonb("metadata").default({}),
  sentAt: timestamp("sent_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("notifications_user_id_idx").on(table.userId),
}));

// Notification Preferences
export const notificationPreferences = pgTable("notification_preferences", {
  id: text("id").primaryKey().$defaultFn(() => uuidv4()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  email: boolean("email").default(true),
  push: boolean("push").default(true),
  inApp: boolean("push_in_app").default(true),
  categories: jsonb("categories").default({
    alerts: true,
    reminders: true,
    achievements: true,
    marketing: false
  }),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("notification_prefs_user_id_idx").on(table.userId),
  uniqueUser: uniqueIndex("notification_prefs_user_unique_idx").on(table.userId),
}));

// Admin Actions
export const adminActions = pgTable("admin_actions", {
  id: text("id").primaryKey().$defaultFn(() => uuidv4()),
  adminId: text("admin_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  action: varchar("action", { length: 100 }).notNull(),
  targetUserId: text("target_user_id").references(() => users.id, { onDelete: 'set null' }),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  adminIdIdx: index("admin_actions_admin_id_idx").on(table.adminId),
}));
