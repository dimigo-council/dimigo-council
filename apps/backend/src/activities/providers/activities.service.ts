import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  inArray,
  lte,
  ne,
  or,
  sql,
  type SQL,
} from 'drizzle-orm';
import {
  PG_FOREIGN_KEY_VIOLATION,
  pgErrorCode,
} from '#/common/database-errors';
import { offsetOf, pageOf, type Page } from '#/common/pagination';
import {
  loadDepartments,
  loadPeople,
  refOf,
  type DepartmentRef,
  type PersonRef,
} from '#/common/people';
import { isCouncil, type Viewer } from '#/common/viewer';
import { DatabaseService } from '#/db/database.service';
import {
  activities,
  activityDrafts,
  activityHistories,
  inquiries,
  Permission,
  surveys,
  tasks,
  users,
  type ActivityHistoryKind,
  type ActivityPlan,
  type ActivityScope,
  type ActivityStatus,
  type InquiryStatus,
  type TaskStatus,
} from '#/db/schema/index';
import {
  canChangeActivityScope,
  canViewActivity,
  completedAtFor,
} from '../activities.policy.ts';
import type {
  ActivityDraftDto,
  ActivityListQuery,
  CreateActivityDto,
  HistoryDto,
  LandingQuery,
  UpdateActivityDto,
} from '../dto/activities.dto.ts';

type Db = DatabaseService['db'];
type Tx = Parameters<Parameters<Db['transaction']>[0]>[0];
type ActivityRow = typeof activities.$inferSelect;

export interface ActivitySummary {
  id: number;
  title: string;
  description: string;
  status: ActivityStatus;
  scope: ActivityScope;
  department: DepartmentRef | null;
  /** 담당자. Left out on the landing page for signed-out visitors. */
  owner: PersonRef | null;
  registeredAt: Date;
  /** Linked inquiries the viewer may see. */
  inquiryIds: number[];
  /** Linked surveys the viewer may see. */
  surveyIds: number[];
}

export interface ActivityHistoryEntry {
  id: number;
  kind: ActivityHistoryKind;
  at: Date | null;
  title: string;
  body: string | null;
  link: { label: string; url: string } | null;
  taskId: number | null;
}

export interface ActivityDetail extends ActivitySummary {
  plan: ActivityPlan | null;
  history: ActivityHistoryEntry[];
  inquiries: { id: number; title: string; status: InquiryStatus }[];
  surveys: { id: number; title: string; closesAt: Date | null }[];
  /** 5.2: tasks linked to an activity are shown with it. */
  tasks: {
    id: number;
    title: string;
    status: TaskStatus;
    dueAt: string;
    department: DepartmentRef | null;
  }[];
  canChangeScope: boolean;
}

/** `null` stands for a signed-out visitor on the landing page. */
type MaybeViewer = Viewer | null;

@Injectable()
export class ActivitiesService {
  constructor(private readonly database: DatabaseService) {}

  private get db(): Db {
    return this.database.db;
  }

  /** SQL filter for linked inquiries the viewer may see. */
  private inquiryVisibility(viewer: MaybeViewer): SQL | undefined {
    if (viewer && isCouncil(viewer)) return undefined;
    return viewer
      ? or(eq(inquiries.scope, '전체 공개'), eq(inquiries.authorId, viewer.id))
      : eq(inquiries.scope, '전체 공개');
  }

  /** Drafts and scheduled surveys stay hidden from students. */
  private surveyVisibility(viewer: MaybeViewer): SQL | undefined {
    if (viewer && isCouncil(viewer)) return undefined;
    return and(
      eq(surveys.stage, 'published'),
      lte(surveys.opensAt, new Date()),
    );
  }

  private async summaries(
    rows: ActivityRow[],
    viewer: MaybeViewer,
  ): Promise<ActivitySummary[]> {
    if (rows.length === 0) return [];
    const ids = rows.map((row) => row.id);
    const [people, departmentRefs, linkedInquiries, linkedSurveys] =
      await Promise.all([
        viewer
          ? loadPeople(
              this.db,
              rows.map((row) => row.ownerId),
            )
          : Promise.resolve(new Map<string, PersonRef>()),
        loadDepartments(
          this.db,
          rows.map((row) => row.departmentId),
        ),
        this.db
          .select({ id: inquiries.id, activityId: inquiries.activityId })
          .from(inquiries)
          .where(
            and(
              inArray(inquiries.activityId, ids),
              this.inquiryVisibility(viewer),
            ),
          )
          .orderBy(asc(inquiries.id)),
        this.db
          .select({ id: surveys.id, activityId: surveys.activityId })
          .from(surveys)
          .where(
            and(
              inArray(surveys.activityId, ids),
              this.surveyVisibility(viewer),
            ),
          )
          .orderBy(asc(surveys.id)),
      ]);
    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      status: row.status,
      scope: row.scope,
      department: refOf(departmentRefs, row.departmentId),
      owner: viewer ? refOf(people, row.ownerId) : null,
      registeredAt: row.createdAt,
      inquiryIds: linkedInquiries
        .filter((item) => item.activityId === row.id)
        .map((item) => item.id),
      surveyIds: linkedSurveys
        .filter((item) => item.activityId === row.id)
        .map((item) => item.id),
    }));
  }

  private async listWhere(
    where: SQL | undefined,
    query: { page: number; pageSize: number },
    viewer: MaybeViewer,
  ): Promise<Page<ActivitySummary>> {
    const rows = await this.db
      .select()
      .from(activities)
      .where(where)
      .orderBy(desc(activities.createdAt), desc(activities.id))
      .limit(query.pageSize)
      .offset(offsetOf(query));
    const [{ total }] = await this.db
      .select({ total: count() })
      .from(activities)
      .where(where);
    return pageOf(await this.summaries(rows, viewer), total, query);
  }

  /** AGD-R1. Students only get 전체 공개 activities. */
  list(viewer: Viewer, query: ActivityListQuery) {
    const search = query.search
      ? `%${query.search.replace(/[\\%_]/g, (match) => `\\${match}`)}%`
      : undefined;
    return this.listWhere(
      and(
        isCouncil(viewer) ? undefined : eq(activities.scope, '전체 공개'),
        query.scope ? eq(activities.scope, query.scope) : undefined,
        query.status ? eq(activities.status, query.status) : undefined,
        query.hideOnHold ? ne(activities.status, '보류') : undefined,
        query.departmentId != null
          ? eq(activities.departmentId, query.departmentId)
          : undefined,
        search ? ilike(activities.title, search) : undefined,
      ),
      query,
      viewer,
    );
  }

  /** LND-03: signed-out visitors see 전체 공개 activities except 보류, without 담당자 names. */
  listForLanding(query: LandingQuery) {
    return this.listWhere(
      and(
        eq(activities.scope, '전체 공개'),
        ne(activities.status, '보류'),
        query.status ? eq(activities.status, query.status) : undefined,
      ),
      query,
      null,
    );
  }

  private async findRow(id: number, db: Db | Tx = this.db) {
    const [row] = await db
      .select()
      .from(activities)
      .where(eq(activities.id, id))
      .limit(1);
    if (!row) throw new NotFoundException('Activity not found');
    return row;
  }

  /** Activities the viewer may not see are reported as missing. */
  async findVisible(viewer: MaybeViewer, id: number): Promise<ActivityRow> {
    const row = await this.findRow(id);
    if (!canViewActivity(viewer, row.scope))
      throw new NotFoundException('Activity not found');
    return row;
  }

  /** AGD-R2 */
  async get(viewer: Viewer, id: number): Promise<ActivityDetail> {
    const row = await this.findVisible(viewer, id);
    const [[summary], history, linkedInquiries, linkedSurveys, linkedTasks] =
      await Promise.all([
        this.summaries([row], viewer),
        this.db
          .select()
          .from(activityHistories)
          .where(eq(activityHistories.activityId, id))
          .orderBy(
            sql`${activityHistories.at} ASC NULLS LAST`,
            asc(activityHistories.id),
          ),
        this.db
          .select({
            id: inquiries.id,
            title: inquiries.title,
            status: inquiries.status,
          })
          .from(inquiries)
          .where(
            and(eq(inquiries.activityId, id), this.inquiryVisibility(viewer)),
          )
          .orderBy(asc(inquiries.id)),
        this.db
          .select({
            id: surveys.id,
            title: surveys.title,
            closesAt: sql<Date | null>`coalesce(${surveys.closedAt}, ${surveys.closesAt})`,
          })
          .from(surveys)
          .where(and(eq(surveys.activityId, id), this.surveyVisibility(viewer)))
          .orderBy(asc(surveys.id)),
        this.db
          .select({
            id: tasks.id,
            title: tasks.title,
            status: tasks.status,
            dueAt: tasks.dueAt,
            departmentId: tasks.departmentId,
          })
          .from(tasks)
          .where(eq(tasks.activityId, id))
          .orderBy(asc(tasks.dueAt), asc(tasks.id)),
      ]);
    const taskDepartments = await loadDepartments(
      this.db,
      linkedTasks.map((task) => task.departmentId),
    );
    return {
      ...summary,
      plan: row.plan ?? null,
      history: history.map(toHistoryEntry),
      inquiries: linkedInquiries,
      surveys: linkedSurveys.map((survey) => ({
        ...survey,
        closesAt: survey.closesAt ? new Date(survey.closesAt) : null,
      })),
      tasks: linkedTasks.map(({ departmentId, ...task }) => ({
        ...task,
        department: refOf(taskDepartments, departmentId),
      })),
      canChangeScope: canChangeActivityScope(viewer, row.ownerId),
    };
  }

  /** 담당자 must be a council member. */
  private async assertCouncilMember(db: Db | Tx, userId: string) {
    const [user] = await db
      .select({ permissions: users.permissions })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    if (!user || (user.permissions & Permission.isStudentCouncil) === 0)
      throw new BadRequestException('담당자 must be a student council member');
  }

  /** AGD-C1. Links the chosen inquiries and, by default, clears the creator's draft. */
  async create(
    viewer: Viewer,
    dto: CreateActivityDto,
    { tx, clearDraft = true }: { tx?: Tx; clearDraft?: boolean } = {},
  ): Promise<number> {
    const run = async (db: Tx) => {
      const ownerId = dto.ownerId === undefined ? viewer.id : dto.ownerId;
      if (ownerId) await this.assertCouncilMember(db, ownerId);
      const now = new Date();
      let created: { id: number } | undefined;
      try {
        [created] = await db
          .insert(activities)
          .values({
            title: dto.title,
            description: dto.description,
            scope: dto.scope,
            status: dto.status,
            completedAt: dto.status === '완료' ? now : null,
            departmentId: dto.departmentId ?? null,
            ownerId,
            createdById: viewer.id,
            plan: dto.plan ?? null,
          })
          .returning({ id: activities.id });
      } catch (error) {
        if (pgErrorCode(error) === PG_FOREIGN_KEY_VIOLATION)
          throw new BadRequestException('Department not found');
        throw error;
      }
      const id = created!.id;
      // Frontend rule: the first record is a 질의 entry when the activity starts from inquiries.
      if (dto.firstRecord)
        await db.insert(activityHistories).values({
          activityId: id,
          kind: dto.inquiryIds.length > 0 ? '질의' : '추진',
          title: dto.firstRecord,
          at: now,
          createdById: viewer.id,
        });
      for (const inquiryId of dto.inquiryIds)
        await this.linkInquiry(db, viewer, id, inquiryId);
      if (clearDraft)
        await db
          .delete(activityDrafts)
          .where(eq(activityDrafts.userId, viewer.id));
      return id;
    };
    return tx ? run(tx) : this.db.transaction(run);
  }

  /**
   * Links an inquiry and records a 질의 entry. The entry names only the inquiry
   * number, so a 전체 공개 activity does not reveal a 학생회만 inquiry's title.
   */
  async linkInquiry(
    db: Tx,
    viewer: Viewer,
    activityId: number,
    inquiryId: number,
  ): Promise<void> {
    const [inquiry] = await db
      .select({ activityId: inquiries.activityId })
      .from(inquiries)
      .where(eq(inquiries.id, inquiryId))
      .limit(1);
    if (!inquiry) throw new NotFoundException(`Inquiry ${inquiryId} not found`);
    if (inquiry.activityId === activityId) return;
    await db
      .update(inquiries)
      .set({ activityId })
      .where(eq(inquiries.id, inquiryId));
    await db.insert(activityHistories).values({
      activityId,
      kind: '질의',
      title: `학생 질의 #${inquiryId} 연결`,
      at: new Date(),
      createdById: viewer.id,
    });
  }

  async update(viewer: Viewer, id: number, dto: UpdateActivityDto) {
    await this.db.transaction(async (tx) => {
      const row = await this.findRow(id, tx);
      if (dto.ownerId) await this.assertCouncilMember(tx, dto.ownerId);
      const changes: Partial<typeof activities.$inferInsert> = { ...dto };
      if (dto.status) changes.completedAt = completedAtFor(row, dto.status);
      if (Object.keys(changes).length === 0) return;
      try {
        await tx.update(activities).set(changes).where(eq(activities.id, id));
      } catch (error) {
        if (pgErrorCode(error) === PG_FOREIGN_KEY_VIOLATION)
          throw new BadRequestException('Department not found');
        throw error;
      }
    });
    return this.get(viewer, id);
  }

  /** AGD-U1 */
  async setScope(viewer: Viewer, id: number, scope: ActivityScope) {
    const row = await this.findRow(id);
    if (!canChangeActivityScope(viewer, row.ownerId))
      throw new ForbiddenException('Only the 담당자 can change the scope');
    await this.db
      .update(activities)
      .set({ scope })
      .where(eq(activities.id, id));
    return this.get(viewer, id);
  }

  /** A published survey must keep its linked activity (SRV-C1), so those block deletion. */
  async remove(id: number): Promise<void> {
    await this.db.transaction(async (tx) => {
      await this.findRow(id, tx);
      const [{ published }] = await tx
        .select({ published: count() })
        .from(surveys)
        .where(and(eq(surveys.activityId, id), eq(surveys.stage, 'published')));
      if (published > 0)
        throw new ConflictException(
          'Activity has published surveys; unlink them first',
        );
      await tx.delete(activities).where(eq(activities.id, id));
    });
  }

  /** AGD-C4 */
  async addHistory(
    viewer: Viewer,
    activityId: number,
    dto: HistoryDto,
  ): Promise<ActivityHistoryEntry> {
    await this.findRow(activityId);
    const [created] = await this.db
      .insert(activityHistories)
      .values({
        activityId,
        kind: dto.kind,
        title: dto.title,
        body: dto.body || null,
        at: dto.at ? new Date(dto.at) : null,
        linkLabel: dto.link?.label ?? null,
        linkUrl: dto.link?.url ?? null,
        createdById: viewer.id,
      })
      .returning();
    return toHistoryEntry(created);
  }

  /** AGD-D1 */
  async deleteHistory(activityId: number, historyId: number): Promise<void> {
    const deleted = await this.db
      .delete(activityHistories)
      .where(
        and(
          eq(activityHistories.id, historyId),
          eq(activityHistories.activityId, activityId),
        ),
      )
      .returning({ id: activityHistories.id });
    if (deleted.length === 0) throw new NotFoundException('History not found');
  }

  /** AGD-C2 불러오기 */
  async getDraft(viewer: Viewer) {
    const [draft] = await this.db
      .select({ data: activityDrafts.data, savedAt: activityDrafts.savedAt })
      .from(activityDrafts)
      .where(eq(activityDrafts.userId, viewer.id))
      .limit(1);
    return draft ?? null;
  }

  async saveDraft(viewer: Viewer, data: ActivityDraftDto) {
    const savedAt = new Date();
    await this.db
      .insert(activityDrafts)
      .values({ userId: viewer.id, data, savedAt })
      .onConflictDoUpdate({
        target: activityDrafts.userId,
        set: { data, savedAt },
      });
    return { data, savedAt };
  }

  async deleteDraft(viewer: Viewer): Promise<void> {
    await this.db
      .delete(activityDrafts)
      .where(eq(activityDrafts.userId, viewer.id));
  }
}

function toHistoryEntry(
  row: typeof activityHistories.$inferSelect,
): ActivityHistoryEntry {
  return {
    id: row.id,
    kind: row.kind,
    at: row.at,
    title: row.title,
    body: row.body,
    link:
      row.linkLabel && row.linkUrl
        ? { label: row.linkLabel, url: row.linkUrl }
        : null,
    taskId: row.taskId,
  };
}
