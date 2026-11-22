import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, count, desc, eq, or, sql, type SQL } from 'drizzle-orm';
import { ActivitiesService } from '#/activities/providers/activities.service';
import {
  PG_FOREIGN_KEY_VIOLATION,
  pgErrorCode,
} from '#/common/database-errors';
import { offsetOf, pageOf, type Page } from '#/common/pagination';
import { loadDepartments, refOf, type DepartmentRef } from '#/common/people';
import { isCouncil, type Viewer } from '#/common/viewer';
import { DatabaseService } from '#/db/database.service';
import {
  activities,
  inquiries,
  inquiryLikes,
  users,
  type ActivityScope,
  type InquiryScope,
  type InquiryStatus,
} from '#/db/schema/index';
import type {
  ActivityFromInquiryDto,
  AnswerInquiryDto,
  CreateInquiryDto,
  InquiryListQuery,
  InquiryScopeDto,
} from '../dto/inquiries.dto.ts';
import {
  canLikeInquiry,
  canSeeAnswer,
  canSeeAuthor,
  canTransitionInquiry,
  canViewInquiry,
} from '../inquiries.policy.ts';

type Db = DatabaseService['db'];

/** A row as loaded for one viewer. Author columns are already blank when the viewer may not see them. */
export interface InquiryRow {
  id: number;
  title: string;
  body: string;
  scope: InquiryScope;
  anonymous: boolean;
  authorId: string;
  authorName: string | null;
  authorGrade: number | null;
  authorClass: number | null;
  status: InquiryStatus;
  departmentId: number | null;
  answerBody: string | null;
  answerDepartmentId: number | null;
  answeredAt: Date | null;
  rejectReason: string | null;
  rejectedAt: Date | null;
  completedAt: Date | null;
  activityId: number | null;
  activityTitle: string | null;
  activityScope: ActivityScope | null;
  createdAt: Date;
  likes: number;
  liked: boolean;
}

export interface InquiryView {
  id: number;
  title: string;
  body: string;
  scope: InquiryScope;
  anonymous: boolean;
  /** Blank for anonymous inquiries unless the viewer wrote it. */
  author: string | null;
  /** 예: 2학년 5반. Blank for anonymous inquiries unless the viewer wrote it. */
  authorClass: string | null;
  status: InquiryStatus;
  department: DepartmentRef | null;
  /** Only the author and the council see the answer and the rejection reason. */
  answer: { department: DepartmentRef | null; body: string; at: Date } | null;
  rejectReason: string | null;
  statusDates: Partial<Record<InquiryStatus, Date>>;
  submittedAt: Date;
  likes: number;
  liked: boolean;
  mine: boolean;
  activity: { id: number; title: string } | null;
}

function classLabel(grade: number | null, klass: number | null): string | null {
  if (grade == null) return null;
  return klass == null ? `${grade}학년` : `${grade}학년 ${klass}반`;
}

/**
 * Builds what the viewer may see. The SQL already blanks anonymous authors;
 * this checks again so a query change cannot leak them.
 */
export function toInquiryView(
  row: InquiryRow,
  viewer: Pick<Viewer, 'id' | 'permissions'>,
  departmentRefs: Map<number, DepartmentRef>,
): InquiryView {
  const showAuthor = canSeeAuthor(viewer, row);
  const showAnswer = canSeeAnswer(viewer, row);
  const showActivity =
    row.activityId != null &&
    row.activityTitle != null &&
    (isCouncil(viewer) || row.activityScope === '전체 공개');
  const statusDates: Partial<Record<InquiryStatus, Date>> = {
    접수: row.createdAt,
  };
  if (row.answeredAt) statusDates['답변 완료'] = row.answeredAt;
  if (row.completedAt) statusDates['처리 완료'] = row.completedAt;
  if (row.rejectedAt) statusDates['반려'] = row.rejectedAt;
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    scope: row.scope,
    anonymous: row.anonymous,
    author: showAuthor ? row.authorName : null,
    authorClass: showAuthor
      ? classLabel(row.authorGrade, row.authorClass)
      : null,
    status: row.status,
    department: refOf(departmentRefs, row.departmentId),
    answer:
      showAnswer && row.answerBody && row.answeredAt
        ? {
            department: refOf(departmentRefs, row.answerDepartmentId),
            body: row.answerBody,
            at: row.answeredAt,
          }
        : null,
    rejectReason: showAnswer ? row.rejectReason : null,
    statusDates,
    submittedAt: row.createdAt,
    likes: row.scope === '전체 공개' ? row.likes : 0,
    liked: row.liked,
    mine: row.authorId === viewer.id,
    activity: showActivity
      ? { id: row.activityId!, title: row.activityTitle! }
      : null,
  };
}

@Injectable()
export class InquiriesService {
  constructor(
    private readonly database: DatabaseService,
    private readonly activities: ActivitiesService,
  ) {}

  private get db(): Db {
    return this.database.db;
  }

  private visibility(viewer: Viewer): SQL | undefined {
    if (isCouncil(viewer)) return undefined;
    return or(
      eq(inquiries.scope, '전체 공개'),
      eq(inquiries.authorId, viewer.id),
    );
  }

  /** Author columns come back NULL for anonymous inquiries the viewer did not write. */
  private select(viewer: Viewer) {
    const hidden = sql`${inquiries.anonymous} AND ${inquiries.authorId} <> ${viewer.id}`;
    return this.db
      .select({
        id: inquiries.id,
        title: inquiries.title,
        body: inquiries.body,
        scope: inquiries.scope,
        anonymous: inquiries.anonymous,
        authorId: inquiries.authorId,
        authorName: sql<
          string | null
        >`CASE WHEN ${hidden} THEN NULL ELSE ${users.name} END`,
        authorGrade: sql<
          number | null
        >`CASE WHEN ${hidden} THEN NULL ELSE ${users.grade} END`,
        authorClass: sql<
          number | null
        >`CASE WHEN ${hidden} THEN NULL ELSE ${users.class} END`,
        status: inquiries.status,
        departmentId: inquiries.departmentId,
        answerBody: inquiries.answerBody,
        answerDepartmentId: inquiries.answerDepartmentId,
        answeredAt: inquiries.answeredAt,
        rejectReason: inquiries.rejectReason,
        rejectedAt: inquiries.rejectedAt,
        completedAt: inquiries.completedAt,
        activityId: inquiries.activityId,
        activityTitle: activities.title,
        activityScope: activities.scope,
        createdAt: inquiries.createdAt,
        likes: sql<number>`(SELECT count(*)::int FROM ${inquiryLikes} WHERE ${inquiryLikes.inquiryId} = ${inquiries.id})`,
        liked: sql<boolean>`EXISTS (SELECT 1 FROM ${inquiryLikes} WHERE ${inquiryLikes.inquiryId} = ${inquiries.id} AND ${inquiryLikes.userId} = ${viewer.id})`,
      })
      .from(inquiries)
      .innerJoin(users, eq(users.id, inquiries.authorId))
      .leftJoin(activities, eq(activities.id, inquiries.activityId));
  }

  private async views(
    viewer: Viewer,
    rows: InquiryRow[],
  ): Promise<InquiryView[]> {
    const departmentRefs = await loadDepartments(
      this.db,
      rows.flatMap((row) => [row.departmentId, row.answerDepartmentId]),
    );
    return rows.map((row) => toInquiryView(row, viewer, departmentRefs));
  }

  /** SGT-R1, SGT-R2 (students), SGT-R3 (council) */
  async list(
    viewer: Viewer,
    query: InquiryListQuery,
  ): Promise<Page<InquiryView>> {
    const where = and(
      this.visibility(viewer),
      query.status ? eq(inquiries.status, query.status) : undefined,
      query.mine ? eq(inquiries.authorId, viewer.id) : undefined,
      query.departmentId != null
        ? eq(inquiries.departmentId, query.departmentId)
        : undefined,
    );
    const rows = await this.select(viewer)
      .where(where)
      .orderBy(desc(inquiries.id))
      .limit(query.pageSize)
      .offset(offsetOf(query));
    const [{ total }] = await this.db
      .select({ total: count() })
      .from(inquiries)
      .where(where);
    return pageOf(await this.views(viewer, rows), total, query);
  }

  private async findRow(viewer: Viewer, id: number): Promise<InquiryRow> {
    const [row] = await this.select(viewer)
      .where(eq(inquiries.id, id))
      .limit(1);
    if (!row || !canViewInquiry(viewer, row))
      throw new NotFoundException('Inquiry not found');
    return row;
  }

  async get(viewer: Viewer, id: number): Promise<InquiryView> {
    const [view] = await this.views(viewer, [await this.findRow(viewer, id)]);
    return view;
  }

  /** SGT-C1. 익명 needs 전체 공개; the DTO and a CHECK constraint both enforce it. */
  async create(viewer: Viewer, dto: CreateInquiryDto): Promise<InquiryView> {
    const [created] = await this.db
      .insert(inquiries)
      .values({
        title: dto.title,
        body: dto.body,
        scope: dto.scope,
        anonymous: dto.scope === '전체 공개' && dto.anonymous,
        authorId: viewer.id,
      })
      .returning({ id: inquiries.id });
    return this.get(viewer, created.id);
  }

  /**
   * 2장: only the author sets and changes the 공개 범위. Moving to 학생회만
   * clears 익명, because 익명 is only offered with 전체 공개.
   */
  async setScope(
    viewer: Viewer,
    id: number,
    dto: InquiryScopeDto,
  ): Promise<InquiryView> {
    const row = await this.findRow(viewer, id);
    if (row.authorId !== viewer.id)
      throw new ForbiddenException('Only the author can change the scope');
    await this.db
      .update(inquiries)
      .set({
        scope: dto.scope,
        anonymous: dto.scope === '전체 공개' && dto.anonymous,
      })
      .where(eq(inquiries.id, id));
    return this.get(viewer, id);
  }

  /** SGT-R2 공감 on and off. Returns the new state. */
  async toggleLike(viewer: Viewer, id: number) {
    const row = await this.findRow(viewer, id);
    if (!canLikeInquiry(viewer, row))
      throw new BadRequestException('Only 전체 공개 inquiries take 공감');
    const removed = await this.db
      .delete(inquiryLikes)
      .where(
        and(eq(inquiryLikes.inquiryId, id), eq(inquiryLikes.userId, viewer.id)),
      )
      .returning({ inquiryId: inquiryLikes.inquiryId });
    if (removed.length === 0)
      await this.db
        .insert(inquiryLikes)
        .values({ inquiryId: id, userId: viewer.id })
        .onConflictDoNothing();
    const [{ likes }] = await this.db
      .select({ likes: count() })
      .from(inquiryLikes)
      .where(eq(inquiryLikes.inquiryId, id));
    return { liked: removed.length === 0, likes };
  }

  /** SGT-U1 담당 부서 */
  async setDepartment(
    viewer: Viewer,
    id: number,
    departmentId: number | null,
  ): Promise<InquiryView> {
    await this.findRow(viewer, id);
    try {
      await this.db
        .update(inquiries)
        .set({ departmentId })
        .where(eq(inquiries.id, id));
    } catch (error) {
      if (pgErrorCode(error) === PG_FOREIGN_KEY_VIOLATION)
        throw new BadRequestException('Department not found');
      throw error;
    }
    return this.get(viewer, id);
  }

  /**
   * SGT-U1 처리. 답변 완료 needs an answer; 처리 완료 needs one sent now or
   * earlier; 반려 needs a reason. Final states do not change.
   */
  async answer(
    viewer: Viewer,
    id: number,
    dto: AnswerInquiryDto,
  ): Promise<InquiryView> {
    const row = await this.findRow(viewer, id);
    if (!canTransitionInquiry(row.status, dto.status))
      throw new ConflictException(
        `Cannot change an inquiry from ${row.status} to ${dto.status}`,
      );
    const now = new Date();
    const departmentId = dto.departmentId ?? row.departmentId;
    const changes: Partial<typeof inquiries.$inferInsert> = {
      status: dto.status,
      departmentId,
    };
    if (dto.status === '반려') {
      if (!dto.body) throw new BadRequestException('반려 needs a reason');
      changes.rejectReason = dto.body;
      changes.rejectedAt = now;
    } else {
      if (dto.body) {
        changes.answerBody = dto.body;
        changes.answerDepartmentId = departmentId;
        changes.answeredAt = row.answeredAt ?? now;
      } else if (dto.status === '답변 완료' || !row.answerBody)
        throw new BadRequestException('Write an answer first');
      if (dto.status === '처리 완료') changes.completedAt = now;
    }
    let updated: { id: number }[];
    try {
      // Matching the status read above keeps two council members from racing past the transition rules.
      updated = await this.db
        .update(inquiries)
        .set(changes)
        .where(and(eq(inquiries.id, id), eq(inquiries.status, row.status)))
        .returning({ id: inquiries.id });
    } catch (error) {
      if (pgErrorCode(error) === PG_FOREIGN_KEY_VIOLATION)
        throw new BadRequestException('Department not found');
      throw error;
    }
    if (updated.length === 0)
      throw new ConflictException('The inquiry changed; reload and try again');
    return this.get(viewer, id);
  }

  /** SGT-U2 기존 활동에 연결 */
  async linkActivity(
    viewer: Viewer,
    id: number,
    activityId: number,
  ): Promise<InquiryView> {
    await this.findRow(viewer, id);
    await this.db.transaction(async (tx) => {
      const [activity] = await tx
        .select({ id: activities.id })
        .from(activities)
        .where(eq(activities.id, activityId))
        .limit(1);
      if (!activity) throw new NotFoundException('Activity not found');
      await this.activities.linkInquiry(tx, viewer, activityId, id);
    });
    return this.get(viewer, id);
  }

  /**
   * SGT-U2 제안을 활동으로 등록. The new activity is 학생회 only unless chosen
   * otherwise, and copies the inquiry's text only from 전체 공개 inquiries so a
   * 학생회만 inquiry is not exposed if the activity is later made public.
   */
  async createActivity(
    viewer: Viewer,
    id: number,
    dto: ActivityFromInquiryDto,
  ): Promise<InquiryView> {
    const row = await this.findRow(viewer, id);
    const isPublic = row.scope === '전체 공개';
    const title = dto.title ?? (isPublic ? row.title : undefined);
    if (!title) throw new BadRequestException('Give the activity a title');
    await this.db.transaction((tx) =>
      this.activities.create(
        viewer,
        {
          ...dto,
          title,
          description: dto.description || (isPublic ? row.body : ''),
          scope: dto.scope ?? '학생회',
          inquiryIds: [id],
        },
        { tx, clearDraft: false },
      ),
    );
    return this.get(viewer, id);
  }

  async unlinkActivity(viewer: Viewer, id: number): Promise<InquiryView> {
    await this.findRow(viewer, id);
    await this.db
      .update(inquiries)
      .set({ activityId: null })
      .where(eq(inquiries.id, id));
    return this.get(viewer, id);
  }
}
