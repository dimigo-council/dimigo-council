import { relations, sql } from 'drizzle-orm';
import {
  check,
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

export const Permission = {
  isAdmin: 1 << 0,
  isTeacher: 1 << 1,
  isStudentCouncil: 1 << 2,
} as const;

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: text('email').notNull().unique(),
    googleSub: text('google_sub').unique(),
    permissions: integer('permissions').notNull().default(0),
    name: text('name'),
    pictureUrl: text('picture_url'),
    grade: integer('grade'),
    class: integer('class'),
    gender: text('gender'),
    onboardingCompletedAt: timestamp('onboarding_completed_at', {
      withTimezone: true,
    }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    check('users_permissions_range', sql`${table.permissions} BETWEEN 0 AND 7`),
    check(
      'users_grade_range',
      sql`${table.grade} BETWEEN 1 AND 3 OR ${table.grade} IS NULL`,
    ),
    check(
      'users_class_range',
      sql`${table.class} BETWEEN 1 AND 6 OR ${table.class} IS NULL`,
    ),
    check(
      'users_class_requires_grade',
      sql`${table.class} IS NULL OR ${table.grade} IS NOT NULL`,
    ),
  ],
);

export const sessions = pgTable(
  'sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tokenHash: text('token_hash').notNull().unique(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index('sessions_expires_at_idx').on(table.expiresAt)],
);

export const oauthFlows = pgTable(
  'oauth_flows',
  {
    stateHash: text('state_hash').primaryKey(),
    purpose: text('purpose', { enum: ['signup', 'login'] }).notNull(),
    redirectUri: text('redirect_uri').notNull(),
    codeVerifier: text('code_verifier').notNull(),
    nonce: text('nonce').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  },
  (table) => [index('oauth_flows_expires_at_idx').on(table.expiresAt)],
);

export const emailCodes = pgTable(
  'email_codes',
  {
    email: text('email').notNull(),
    purpose: text('purpose', { enum: ['signup', 'login'] }).notNull(),
    codeHash: text('code_hash').notNull(),
    attempts: integer('attempts').notNull().default(0),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.email, table.purpose] }),
    index('email_codes_expires_at_idx').on(table.expiresAt),
  ],
);

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));
