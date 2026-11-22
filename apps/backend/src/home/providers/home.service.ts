import { Injectable } from '@nestjs/common';
import {
  and,
  count,
  eq,
  gt,
  gte,
  isNull,
  lte,
  ne,
  notExists,
} from 'drizzle-orm';
import { addDays, startOfSeoulMonth, todayInSeoul } from '#/common/dates';
import type { Viewer } from '#/common/viewer';
import { DatabaseService } from '#/db/database.service';
import {
  activities,
  inquiries,
  surveyParticipants,
  surveys,
  tasks,
} from '#/db/schema/index';
import { isEligible } from '#/surveys/surveys.policy';

const DAY_MS = 86_400_000;

/**
 * 홈 (기능 명세서 4장) counts. The lists on the home screens come from the list
 * endpoints with filters (for example `GET /activities?hideOnHold=true`).
 */
@Injectable()
export class HomeService {
  constructor(private readonly database: DatabaseService) {}

  private get db(): DatabaseService['db'] {
    return this.database.db;
  }

  private openSurveys(now: Date) {
    return and(
      eq(surveys.stage, 'published'),
      lte(surveys.opensAt, now),
      isNull(surveys.closedAt),
      gt(surveys.closesAt, now),
    );
  }

  /** HOM-01: surveys the viewer can still answer, and their inquiries that got an answer. */
  async student(viewer: Viewer) {
    const now = new Date();
    const [candidates, [{ answered }]] = await Promise.all([
      this.db
        .select({
          grades: surveys.grades,
          collectsClass: surveys.collectsClass,
        })
        .from(surveys)
        .where(
          and(
            this.openSurveys(now),
            notExists(
              this.db
                .select({ surveyId: surveyParticipants.surveyId })
                .from(surveyParticipants)
                .where(
                  and(
                    eq(surveyParticipants.surveyId, surveys.id),
                    eq(surveyParticipants.userId, viewer.id),
                  ),
                ),
            ),
          ),
        ),
      this.db
        .select({ answered: count() })
        .from(inquiries)
        .where(
          and(
            eq(inquiries.authorId, viewer.id),
            eq(inquiries.status, '답변 완료'),
          ),
        ),
    ]);
    return {
      name: viewer.name,
      openSurveyCount: candidates.filter((survey) => isEligible(viewer, survey))
        .length,
      answeredInquiryCount: answered,
    };
  }

  /** HOM-05, HOM-06 */
  async council(viewer: Viewer) {
    const now = new Date();
    const today = todayInSeoul(now);
    const weekAgo = new Date(now.getTime() - 7 * DAY_MS);
    const myOpenTasks = and(
      eq(tasks.assigneeId, viewer.id),
      ne(tasks.status, '완료'),
    );
    const total = async (query: Promise<{ total: number }[]>) =>
      (await query)[0].total;
    const [
      checkToday,
      dueToday,
      myTasks,
      pendingInquiries,
      newInquiries,
      openSurveys,
      startedThisWeek,
      activeActivities,
      completedThisMonth,
    ] = await Promise.all([
      // 오늘 확인할 업무: open tasks due within three days, overdue included (frontend rule).
      total(
        this.db
          .select({ total: count() })
          .from(tasks)
          .where(and(myOpenTasks, lte(tasks.dueAt, addDays(today, 3)))),
      ),
      total(
        this.db
          .select({ total: count() })
          .from(tasks)
          .where(and(myOpenTasks, eq(tasks.dueAt, today))),
      ),
      total(this.db.select({ total: count() }).from(tasks).where(myOpenTasks)),
      total(
        this.db
          .select({ total: count() })
          .from(inquiries)
          .where(eq(inquiries.status, '접수')),
      ),
      total(
        this.db
          .select({ total: count() })
          .from(inquiries)
          .where(
            and(
              eq(inquiries.status, '접수'),
              gte(inquiries.createdAt, weekAgo),
            ),
          ),
      ),
      total(
        this.db
          .select({ total: count() })
          .from(surveys)
          .where(this.openSurveys(now)),
      ),
      total(
        this.db
          .select({ total: count() })
          .from(surveys)
          .where(and(this.openSurveys(now), gte(surveys.opensAt, weekAgo))),
      ),
      total(
        this.db
          .select({ total: count() })
          .from(activities)
          .where(eq(activities.status, '추진 중')),
      ),
      total(
        this.db
          .select({ total: count() })
          .from(activities)
          .where(
            and(
              eq(activities.status, '완료'),
              gte(activities.completedAt, startOfSeoulMonth(now)),
            ),
          ),
      ),
    ]);
    return {
      name: viewer.name,
      summary: { checkToday, newInquiries },
      metrics: {
        openSurveys: { value: openSurveys, startedThisWeek },
        pendingInquiries: {
          value: pendingInquiries,
          receivedLast7Days: newInquiries,
        },
        activeActivities: { value: activeActivities, completedThisMonth },
        myTasks: { value: myTasks, dueToday },
      },
    };
  }
}
