import { relations, sql, type AnyColumn } from 'drizzle-orm';
import {
  boolean,
  check,
  date,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import {
  activityHistoryKinds,
  activityScopes,
  activityStatuses,
  departmentRoles,
  inquiryScopes,
  inquiryStatuses,
  surveyStages,
  taskLogKinds,
  taskStatuses,
  type ActivityPlan,
  type SurveyAnswers,
  type SurveyQuestion,
} from './values.ts';

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

/** Builds `column IN ('a', 'b')` for a CHECK constraint from a list of allowed values. */
function oneOf(column: AnyColumn, values: readonly string[]) {
  return sql`${column} IN (${sql.join(
    values.map((value) => sql.raw(`'${value.replaceAll("'", "''")}'`)),
    sql`, `,
  )})`;
}

const createdAt = () =>
  timestamp('created_at', { withTimezone: true }).notNull().defaultNow();
const updatedAt = () =>
  timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date());

/** 학생회 부서 (회장단, 총무부, …). 활동·업무·질의·설문의 담당 부서로 쓴다. */
export const departments = pgTable('departments', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  name: text('name').notNull().unique(),
  createdAt: createdAt(),
});

/**
 * 부서 소속. 한 사람은 한 부서에만 속한다 (프론트엔드 구성원 화면과 같다).
 * role `head`는 부서장(부서 관리 권한), `member`는 부원이다. position은 회장·부장 같은 표시용 직책이다.
 */
export const departmentMembers = pgTable(
  'department_members',
  {
    userId: uuid('user_id')
      .primaryKey()
      .references(() => users.id, { onDelete: 'cascade' }),
    departmentId: integer('department_id')
      .notNull()
      .references(() => departments.id, { onDelete: 'cascade' }),
    role: text('role', { enum: departmentRoles }).notNull().default('member'),
    position: text('position'),
    createdAt: createdAt(),
  },
  (table) => [
    check('department_members_role', oneOf(table.role, departmentRoles)),
    index('department_members_department_idx').on(table.departmentId),
  ],
);

/** 활동 (기능 명세서 5.1) */
export const activities = pgTable(
  'activities',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    title: text('title').notNull(),
    description: text('description').notNull().default(''),
    status: text('status', { enum: activityStatuses })
      .notNull()
      .default('검토 중'),
    scope: text('scope', { enum: activityScopes }).notNull().default('학생회'),
    departmentId: integer('department_id').references(() => departments.id, {
      onDelete: 'set null',
    }),
    ownerId: uuid('owner_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    createdById: uuid('created_by_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    plan: jsonb('plan').$type<ActivityPlan>(),
    /** 상태가 완료로 바뀐 시각. 홈의 "이번 달 완료"에 쓴다. */
    completedAt: timestamp('completed_at', { withTimezone: true }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    check('activities_status', oneOf(table.status, activityStatuses)),
    check('activities_scope', oneOf(table.scope, activityScopes)),
    index('activities_created_at_idx').on(table.createdAt),
  ],
);

/** 활동 등록 임시 저장 (AGD-C2). 사용자마다 하나다. */
export const activityDrafts = pgTable('activity_drafts', {
  userId: uuid('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  data: jsonb('data').$type<Record<string, unknown>>().notNull(),
  savedAt: timestamp('saved_at', { withTimezone: true }).notNull().defaultNow(),
});

/** 업무 (기능 명세서 5.2). 업무 자체에는 공개 범위가 없다. */
export const tasks = pgTable(
  'tasks',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    title: text('title').notNull(),
    tag: text('tag'),
    activityId: integer('activity_id').references(() => activities.id, {
      onDelete: 'set null',
    }),
    assignerId: uuid('assigner_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    departmentId: integer('department_id').references(() => departments.id, {
      onDelete: 'set null',
    }),
    assigneeId: uuid('assignee_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    startAt: date('start_at', { mode: 'string' }).notNull(),
    dueAt: date('due_at', { mode: 'string' }).notNull(),
    status: text('status', { enum: taskStatuses }).notNull().default('예정됨'),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    check('tasks_status', oneOf(table.status, taskStatuses)),
    check('tasks_due_after_start', sql`${table.dueAt} >= ${table.startAt}`),
    index('tasks_activity_idx').on(table.activityId),
    index('tasks_assignee_idx').on(table.assigneeId),
  ],
);

/** 업무 진행 기록 (TSK-C2). status가 있으면 그 기록이 바꾼 뒤의 상태다. */
export const taskLogs = pgTable(
  'task_logs',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    taskId: integer('task_id')
      .notNull()
      .references(() => tasks.id, { onDelete: 'cascade' }),
    kind: text('kind', { enum: taskLogKinds }).notNull(),
    text: text('text').notNull(),
    status: text('status', { enum: taskStatuses }),
    createdById: uuid('created_by_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    at: timestamp('at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    check('task_logs_kind', oneOf(table.kind, taskLogKinds)),
    check(
      'task_logs_status',
      sql`${table.status} IS NULL OR ${oneOf(table.status, taskStatuses)}`,
    ),
    index('task_logs_task_idx').on(table.taskId),
  ],
);

/**
 * 활동 추진 이력. at이 없으면 예정된 이력이다.
 * taskId가 있으면 연결된 업무의 진행 기록이 옮겨진 이력이다 (기능 명세서 6장).
 */
export const activityHistories = pgTable(
  'activity_histories',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    activityId: integer('activity_id')
      .notNull()
      .references(() => activities.id, { onDelete: 'cascade' }),
    kind: text('kind', { enum: activityHistoryKinds }).notNull(),
    title: text('title').notNull(),
    body: text('body'),
    at: timestamp('at', { withTimezone: true }),
    linkLabel: text('link_label'),
    linkUrl: text('link_url'),
    taskId: integer('task_id').references(() => tasks.id, {
      onDelete: 'set null',
    }),
    createdById: uuid('created_by_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    createdAt: createdAt(),
  },
  (table) => [
    check('activity_histories_kind', oneOf(table.kind, activityHistoryKinds)),
    check(
      'activity_histories_link_pair',
      sql`(${table.linkLabel} IS NULL) = (${table.linkUrl} IS NULL)`,
    ),
    index('activity_histories_activity_idx').on(table.activityId),
  ],
);

/** 질문과 건의 (기능 명세서 5.4) */
export const inquiries = pgTable(
  'inquiries',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    title: text('title').notNull(),
    body: text('body').notNull(),
    scope: text('scope', { enum: inquiryScopes }).notNull(),
    anonymous: boolean('anonymous').notNull().default(false),
    authorId: uuid('author_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    status: text('status', { enum: inquiryStatuses }).notNull().default('접수'),
    departmentId: integer('department_id').references(() => departments.id, {
      onDelete: 'set null',
    }),
    answerBody: text('answer_body'),
    answerDepartmentId: integer('answer_department_id').references(
      () => departments.id,
      { onDelete: 'set null' },
    ),
    answeredAt: timestamp('answered_at', { withTimezone: true }),
    rejectReason: text('reject_reason'),
    rejectedAt: timestamp('rejected_at', { withTimezone: true }),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    activityId: integer('activity_id').references(() => activities.id, {
      onDelete: 'set null',
    }),
    createdAt: createdAt(),
  },
  (table) => [
    check('inquiries_status', oneOf(table.status, inquiryStatuses)),
    check('inquiries_scope', oneOf(table.scope, inquiryScopes)),
    check('inquiries_body_length', sql`char_length(${table.body}) <= 1000`),
    check(
      'inquiries_anonymous_requires_public',
      sql`NOT ${table.anonymous} OR ${table.scope} = '전체 공개'`,
    ),
    index('inquiries_author_idx').on(table.authorId),
    index('inquiries_activity_idx').on(table.activityId),
    index('inquiries_created_at_idx').on(table.createdAt),
  ],
);

/** 질의 공감. 한 사람이 한 질의에 한 번만 공감한다. */
export const inquiryLikes = pgTable(
  'inquiry_likes',
  {
    inquiryId: integer('inquiry_id')
      .notNull()
      .references(() => inquiries.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
  },
  (table) => [primaryKey({ columns: [table.inquiryId, table.userId] })],
);

/**
 * 설문 (기능 명세서 5.3). stage가 draft면 임시 저장, published면 게시된 설문이다.
 * 게시된 설문의 진행 중·마감은 opensAt, closesAt, closedAt으로 정해진다.
 */
export const surveys = pgTable(
  'surveys',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    title: text('title').notNull().default(''),
    intro: text('intro').notNull().default(''),
    activityId: integer('activity_id').references(() => activities.id, {
      onDelete: 'set null',
    }),
    departmentId: integer('department_id').references(() => departments.id, {
      onDelete: 'set null',
    }),
    ownerId: uuid('owner_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    /** 응답할 수 있는 학년. 세 학년 모두면 학년 제한이 없다. */
    grades: integer('grades')
      .array()
      .notNull()
      .default(sql`'{1,2,3}'`),
    collectsClass: boolean('collects_class').notNull().default(false),
    questions: jsonb('questions').$type<SurveyQuestion[]>().notNull(),
    stage: text('stage', { enum: surveyStages }).notNull().default('draft'),
    opensAt: timestamp('opens_at', { withTimezone: true }),
    closesAt: timestamp('closes_at', { withTimezone: true }),
    /** 마감일 전에 응답 받기를 끈 시각 */
    closedAt: timestamp('closed_at', { withTimezone: true }),
    reviewRequested: boolean('review_requested').notNull().default(false),
    createdAt: createdAt(),
    savedAt: timestamp('saved_at', { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    check('surveys_stage', oneOf(table.stage, surveyStages)),
    check(
      'surveys_grades',
      sql`cardinality(${table.grades}) > 0 AND ${table.grades} <@ ARRAY[1, 2, 3]`,
    ),
    check(
      'surveys_published_fields',
      sql`${table.stage} = 'draft' OR (${table.activityId} IS NOT NULL AND ${table.opensAt} IS NOT NULL AND ${table.closesAt} IS NOT NULL)`,
    ),
  ],
);

/**
 * 설문 응답. 응답자를 알 수 있는 값(사용자 id 등)을 두지 않는다.
 * grade와 classNumber는 학년/반을 수집하는 설문에서만 채운다.
 */
export const surveyResponses = pgTable(
  'survey_responses',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    surveyId: integer('survey_id')
      .notNull()
      .references(() => surveys.id, { onDelete: 'cascade' }),
    answers: jsonb('answers').$type<SurveyAnswers>().notNull(),
    grade: integer('grade'),
    classNumber: integer('class_number'),
    durationSeconds: integer('duration_seconds'),
    excluded: boolean('excluded').notNull().default(false),
    submittedAt: timestamp('submitted_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index('survey_responses_survey_idx').on(table.surveyId)],
);

/**
 * 설문 참여 여부. 중복 응답을 막는 데만 쓴다.
 * 응답과 연결할 수 없도록 응답 id도 시각도 저장하지 않으며, 결과 조회에서 이 표를 조인하지 않는다.
 */
export const surveyParticipants = pgTable(
  'survey_participants',
  {
    surveyId: integer('survey_id')
      .notNull()
      .references(() => surveys.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
  },
  (table) => [primaryKey({ columns: [table.surveyId, table.userId] })],
);

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));
