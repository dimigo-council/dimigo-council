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
  gt,
  inArray,
  isNotNull,
  isNull,
  lte,
  or,
  sql,
  type SQL,
} from 'drizzle-orm';
import {
  PG_FOREIGN_KEY_VIOLATION,
  pgErrorCode,
} from '#/common/database-errors';
import { daysUntil } from '#/common/dates';
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
  departmentMembers,
  surveyParticipants,
  surveyResponses,
  surveys,
  users,
  type SurveyAnswers,
  type SurveyQuestion,
} from '#/db/schema/index';
import type {
  SurveyDraftDto,
  SurveyListQuery,
  SurveyResponseDto,
} from '../dto/surveys.dto.ts';
import {
  audienceLabel,
  checkAnswers,
  isEligible,
  participationRate,
  publishProblems,
  summarizeQuestions,
  surveyStageLabel,
  surveyStatus,
  targetCount,
  type QuestionResult,
  type SurveyStatus,
} from '../surveys.policy.ts';

type Db = DatabaseService['db'];
type SurveyRow = typeof surveys.$inferSelect;
type TargetGroups = {
  grade: number | null;
  hasClass: boolean;
  total: number;
}[];

export interface SurveySummary {
  id: number;
  title: string;
  intro: string;
  department: DepartmentRef | null;
  /** Shown to council members only. */
  owner: PersonRef | null;
  grades: number[];
  audience: string;
  collectsClass: boolean;
  /** Hidden from students when the activity is 학생회 only. */
  activity: { id: number; title: string } | null;
  opensAt: Date | null;
  /** When responses stop: the early close time, or the deadline. */
  closesAt: Date | null;
  stage: 'draft' | 'scheduled' | 'published';
  status: SurveyStatus;
  isClosed: boolean;
  questionCount: number;
  responses: number;
  target: number;
  participationRate: number;
  myStatus: 'none' | 'submitted';
  canRespond: boolean;
  reviewRequested: boolean;
  savedAt: Date;
}

export interface SurveyDetail extends SurveySummary {
  questions: SurveyQuestion[];
  /** The deadline set when publishing, even after an early close. Council only. */
  deadline: Date | null;
}

export interface SurveyResults {
  survey: SurveySummary;
  questionCount: number;
  /** Responses counted in the analysis (not excluded). */
  respondents: number;
  excluded: number;
  target: number;
  participationRate: number;
  daysLeft: number | null;
  questions: QuestionResult[];
}

/** An anonymous response for the 개별 보기 list. No user is linked to it. */
export interface SurveyResponseView {
  id: string;
  submittedAt: Date;
  durationSeconds: number | null;
  grade: number | null;
  classNumber: number | null;
  answers: SurveyAnswers;
  excluded: boolean;
}

@Injectable()
export class SurveysService {
  constructor(private readonly database: DatabaseService) {}

  private get db(): Db {
    return this.database.db;
  }

  /** Students see published surveys from their 시작일 on. */
  private visibility(viewer: Viewer): SQL | undefined {
    if (isCouncil(viewer)) return undefined;
    return and(
      eq(surveys.stage, 'published'),
      lte(surveys.opensAt, new Date()),
    );
  }

  private statusFilter(status: SurveyListQuery['status']): SQL | undefined {
    const now = new Date();
    switch (status) {
      case '작성 중':
        return eq(surveys.stage, 'draft');
      case '예정':
        return and(eq(surveys.stage, 'published'), gt(surveys.opensAt, now));
      case '진행 중':
        return and(
          eq(surveys.stage, 'published'),
          lte(surveys.opensAt, now),
          isNull(surveys.closedAt),
          gt(surveys.closesAt, now),
        );
      case '마감':
        return and(
          eq(surveys.stage, 'published'),
          lte(surveys.opensAt, now),
          or(isNotNull(surveys.closedAt), lte(surveys.closesAt, now)),
        );
      default:
        return undefined;
    }
  }

  /** Onboarded users grouped for 응답 대상 인원. */
  private targetGroups(): Promise<TargetGroups> {
    return this.db
      .select({
        grade: users.grade,
        hasClass: sql<boolean>`${users.class} IS NOT NULL`,
        total: count(),
      })
      .from(users)
      .where(isNotNull(users.onboardingCompletedAt))
      .groupBy(users.grade, sql`${users.class} IS NOT NULL`);
  }

  private async summaries(
    viewer: Viewer,
    rows: SurveyRow[],
  ): Promise<SurveySummary[]> {
    if (rows.length === 0) return [];
    const ids = rows.map((row) => row.id);
    const activityIds = rows.flatMap((row) =>
      row.activityId ? [row.activityId] : [],
    );
    const council = isCouncil(viewer);
    const [people, departmentRefs, linked, counts, mine, groups] =
      await Promise.all([
        council
          ? loadPeople(
              this.db,
              rows.map((row) => row.ownerId),
            )
          : Promise.resolve(new Map<string, PersonRef>()),
        loadDepartments(
          this.db,
          rows.map((row) => row.departmentId),
        ),
        activityIds.length
          ? this.db
              .select({
                id: activities.id,
                title: activities.title,
                scope: activities.scope,
              })
              .from(activities)
              .where(inArray(activities.id, activityIds))
          : Promise.resolve([]),
        this.db
          .select({ surveyId: surveyResponses.surveyId, total: count() })
          .from(surveyResponses)
          .where(inArray(surveyResponses.surveyId, ids))
          .groupBy(surveyResponses.surveyId),
        this.db
          .select({ surveyId: surveyParticipants.surveyId })
          .from(surveyParticipants)
          .where(
            and(
              inArray(surveyParticipants.surveyId, ids),
              eq(surveyParticipants.userId, viewer.id),
            ),
          ),
        this.targetGroups(),
      ]);
    const activityRefs = new Map(linked.map((item) => [item.id, item]));
    const responseCounts = new Map(
      counts.map((item) => [item.surveyId, item.total]),
    );
    const answered = new Set(mine.map((item) => item.surveyId));
    const now = new Date();
    return rows.map((row) => {
      const activity = refOf(activityRefs, row.activityId);
      const status = surveyStatus(row, now);
      const responses = responseCounts.get(row.id) ?? 0;
      const target = targetCount(groups, row);
      const submitted = answered.has(row.id);
      return {
        id: row.id,
        title: row.title,
        intro: row.intro,
        department: refOf(departmentRefs, row.departmentId),
        owner: council ? refOf(people, row.ownerId) : null,
        grades: row.grades,
        audience: audienceLabel(row.grades),
        collectsClass: row.collectsClass,
        activity:
          activity && (council || activity.scope === '전체 공개')
            ? { id: activity.id, title: activity.title }
            : null,
        opensAt: row.opensAt,
        closesAt: row.closedAt ?? row.closesAt,
        stage: surveyStageLabel(row, now),
        status,
        isClosed: status === '마감',
        questionCount: row.questions.length,
        responses,
        target,
        participationRate: participationRate(responses, target),
        myStatus: submitted ? 'submitted' : 'none',
        canRespond:
          status === '진행 중' && !submitted && isEligible(viewer, row),
        reviewRequested: row.reviewRequested,
        savedAt: row.savedAt,
      };
    });
  }

  /** SRV-R1. Open surveys come first, closest deadline first (HOM-03 마감 임박). */
  async list(
    viewer: Viewer,
    query: SurveyListQuery,
  ): Promise<Page<SurveySummary>> {
    const where = and(this.visibility(viewer), this.statusFilter(query.status));
    const rows = await this.db
      .select()
      .from(surveys)
      .where(where)
      .orderBy(
        sql`coalesce(${surveys.closedAt}, ${surveys.closesAt}) <= now() ASC`,
        sql`coalesce(${surveys.closedAt}, ${surveys.closesAt}) ASC NULLS LAST`,
        desc(surveys.id),
      )
      .limit(query.pageSize)
      .offset(offsetOf(query));
    const [{ total }] = await this.db
      .select({ total: count() })
      .from(surveys)
      .where(where);
    return pageOf(await this.summaries(viewer, rows), total, query);
  }

  private async findRow(id: number): Promise<SurveyRow> {
    const [row] = await this.db
      .select()
      .from(surveys)
      .where(eq(surveys.id, id))
      .limit(1);
    if (!row) throw new NotFoundException('Survey not found');
    return row;
  }

  private async findVisible(viewer: Viewer, id: number): Promise<SurveyRow> {
    const [row] = await this.db
      .select()
      .from(surveys)
      .where(and(eq(surveys.id, id), this.visibility(viewer)))
      .limit(1);
    if (!row) throw new NotFoundException('Survey not found');
    return row;
  }

  async get(viewer: Viewer, id: number): Promise<SurveyDetail> {
    const row = await this.findVisible(viewer, id);
    const [summary] = await this.summaries(viewer, [row]);
    return {
      ...summary,
      questions: row.questions,
      deadline: isCouncil(viewer) ? row.closesAt : null,
    };
  }

  /** SRV-C2 불러오기: the viewer's most recently saved draft. */
  async latestDraft(viewer: Viewer): Promise<SurveyDetail | null> {
    const [row] = await this.db
      .select()
      .from(surveys)
      .where(and(eq(surveys.stage, 'draft'), eq(surveys.ownerId, viewer.id)))
      .orderBy(desc(surveys.savedAt), desc(surveys.id))
      .limit(1);
    return row ? this.get(viewer, row.id) : null;
  }

  private draftValues(
    dto: SurveyDraftDto,
  ): Partial<typeof surveys.$inferInsert> {
    const { opensAt, closesAt, ...rest } = dto;
    return {
      ...rest,
      ...(opensAt !== undefined && {
        opensAt: opensAt ? new Date(opensAt) : null,
      }),
      ...(closesAt !== undefined && {
        closesAt: closesAt ? new Date(closesAt) : null,
      }),
    };
  }

  private mapError(error: unknown) {
    return pgErrorCode(error) === PG_FOREIGN_KEY_VIOLATION
      ? new BadRequestException('Linked activity or department not found')
      : error;
  }

  /** SRV-C1, SRV-C2: every new survey starts as a draft. The department defaults to the creator's. */
  async create(viewer: Viewer, dto: SurveyDraftDto): Promise<SurveyDetail> {
    let departmentId = dto.departmentId;
    if (departmentId === undefined) {
      const [membership] = await this.db
        .select({ departmentId: departmentMembers.departmentId })
        .from(departmentMembers)
        .where(eq(departmentMembers.userId, viewer.id))
        .limit(1);
      departmentId = membership?.departmentId ?? null;
    }
    let created: { id: number };
    try {
      [created] = await this.db
        .insert(surveys)
        .values({
          questions: [],
          ...this.draftValues(dto),
          departmentId,
          ownerId: viewer.id,
          stage: 'draft',
        })
        .returning({ id: surveys.id });
    } catch (error) {
      throw this.mapError(error);
    }
    return this.get(viewer, created.id);
  }

  private async findDraft(id: number): Promise<SurveyRow> {
    const row = await this.findRow(id);
    if (row.stage !== 'draft')
      throw new ConflictException('Published surveys cannot be edited');
    return row;
  }

  /** Autosave. Only drafts can change, so answers always match their questions. */
  async update(
    viewer: Viewer,
    id: number,
    dto: SurveyDraftDto,
  ): Promise<SurveyDetail> {
    await this.findDraft(id);
    try {
      await this.db
        .update(surveys)
        .set({ ...this.draftValues(dto), savedAt: new Date() })
        .where(and(eq(surveys.id, id), eq(surveys.stage, 'draft')));
    } catch (error) {
      throw this.mapError(error);
    }
    return this.get(viewer, id);
  }

  /** 부서장 검토 요청 */
  async requestReview(viewer: Viewer, id: number): Promise<SurveyDetail> {
    await this.findDraft(id);
    await this.db
      .update(surveys)
      .set({ reviewRequested: true })
      .where(eq(surveys.id, id));
    return this.get(viewer, id);
  }

  /** SRV-C1 게시. Without a 시작일 the survey opens now; a later 시작일 schedules it. */
  async publish(viewer: Viewer, id: number): Promise<SurveyDetail> {
    const row = await this.findDraft(id);
    const problems = publishProblems(row);
    if (problems.length > 0) throw new BadRequestException(problems);
    try {
      await this.db
        .update(surveys)
        .set({ stage: 'published', opensAt: row.opensAt ?? new Date() })
        .where(and(eq(surveys.id, id), eq(surveys.stage, 'draft')));
    } catch (error) {
      throw this.mapError(error);
    }
    return this.get(viewer, id);
  }

  /** Cancels a scheduled survey before it opens. */
  async unpublish(viewer: Viewer, id: number): Promise<SurveyDetail> {
    const row = await this.findRow(id);
    if (surveyStageLabel(row) !== 'scheduled')
      throw new ConflictException('Only scheduled surveys can be unpublished');
    await this.db
      .update(surveys)
      .set({ stage: 'draft' })
      .where(eq(surveys.id, id));
    return this.get(viewer, id);
  }

  /** 마감 early, or reopen before the deadline. */
  async setAccepting(
    viewer: Viewer,
    id: number,
    accepting: boolean,
  ): Promise<SurveyDetail> {
    const row = await this.findRow(id);
    if (row.stage !== 'published')
      throw new ConflictException('Survey is not published');
    if (accepting && row.closesAt && row.closesAt <= new Date())
      throw new ConflictException('A survey past its deadline cannot reopen');
    await this.db
      .update(surveys)
      .set({ closedAt: accepting ? null : (row.closedAt ?? new Date()) })
      .where(eq(surveys.id, id));
    return this.get(viewer, id);
  }

  /** Only drafts can be deleted, so collected responses are never lost by accident. */
  async remove(id: number): Promise<void> {
    await this.findDraft(id);
    await this.db.delete(surveys).where(eq(surveys.id, id));
  }

  /**
   * SRV-C3. One response per user: the participation row's primary key rejects
   * a second response, and the response row itself never stores who sent it.
   */
  async respond(viewer: Viewer, id: number, dto: SurveyResponseDto) {
    const row = await this.findVisible(viewer, id);
    if (surveyStatus(row) !== '진행 중')
      throw new ConflictException('Survey is not accepting responses');
    if (!isEligible(viewer, row))
      throw new ForbiddenException(
        row.collectsClass
          ? 'This survey needs the grade and class from sign-up'
          : 'This survey is for other grades',
      );
    const { answers, problems } = checkAnswers(row.questions, dto.answers);
    if (problems.length > 0) throw new BadRequestException(problems);
    await this.db.transaction(async (tx) => {
      const joined = await tx
        .insert(surveyParticipants)
        .values({ surveyId: id, userId: viewer.id })
        .onConflictDoNothing()
        .returning({ surveyId: surveyParticipants.surveyId });
      if (joined.length === 0)
        throw new ConflictException('You have already responded');
      await tx.insert(surveyResponses).values({
        surveyId: id,
        answers,
        grade: row.collectsClass ? viewer.grade : null,
        classNumber: row.collectsClass ? viewer.class : null,
        durationSeconds: dto.durationSeconds ?? null,
      });
    });
    return { myStatus: 'submitted' as const };
  }

  private async findPublished(id: number): Promise<SurveyRow> {
    const row = await this.findRow(id);
    if (row.stage !== 'published')
      throw new NotFoundException('Survey is not published');
    return row;
  }

  /** SRV-R2 설문 결과. Excluded responses stay stored but leave the analysis. */
  async results(viewer: Viewer, id: number): Promise<SurveyResults> {
    const row = await this.findPublished(id);
    const [[survey], responses] = await Promise.all([
      this.summaries(viewer, [row]),
      this.db
        .select({
          answers: surveyResponses.answers,
          excluded: surveyResponses.excluded,
        })
        .from(surveyResponses)
        .where(eq(surveyResponses.surveyId, id))
        .orderBy(asc(surveyResponses.submittedAt)),
    ]);
    const included = responses.filter((response) => !response.excluded);
    return {
      survey,
      questionCount: row.questions.length,
      respondents: included.length,
      excluded: responses.length - included.length,
      target: survey.target,
      participationRate: participationRate(included.length, survey.target),
      daysLeft: survey.closesAt ? daysUntil(survey.closesAt) : null,
      questions: summarizeQuestions(row.questions, included),
    };
  }

  /** 개별 응답 in submission order. */
  async listResponses(
    id: number,
    query: { page: number; pageSize: number },
  ): Promise<Page<SurveyResponseView>> {
    await this.findPublished(id);
    const rows = await this.db
      .select({
        id: surveyResponses.id,
        submittedAt: surveyResponses.submittedAt,
        durationSeconds: surveyResponses.durationSeconds,
        grade: surveyResponses.grade,
        classNumber: surveyResponses.classNumber,
        answers: surveyResponses.answers,
        excluded: surveyResponses.excluded,
      })
      .from(surveyResponses)
      .where(eq(surveyResponses.surveyId, id))
      .orderBy(asc(surveyResponses.submittedAt), asc(surveyResponses.id))
      .limit(query.pageSize)
      .offset(offsetOf(query));
    const [{ total }] = await this.db
      .select({ total: count() })
      .from(surveyResponses)
      .where(eq(surveyResponses.surveyId, id));
    return pageOf(rows, total, query);
  }

  async setExcluded(
    id: number,
    responseId: string,
    excluded: boolean,
  ): Promise<void> {
    const updated = await this.db
      .update(surveyResponses)
      .set({ excluded })
      .where(
        and(
          eq(surveyResponses.id, responseId),
          eq(surveyResponses.surveyId, id),
        ),
      )
      .returning({ id: surveyResponses.id });
    if (updated.length === 0) throw new NotFoundException('Response not found');
  }

  /** Deleting a response keeps the participation row, so the user cannot respond again. */
  async deleteResponse(id: number, responseId: string): Promise<void> {
    const deleted = await this.db
      .delete(surveyResponses)
      .where(
        and(
          eq(surveyResponses.id, responseId),
          eq(surveyResponses.surveyId, id),
        ),
      )
      .returning({ id: surveyResponses.id });
    if (deleted.length === 0) throw new NotFoundException('Response not found');
  }
}
