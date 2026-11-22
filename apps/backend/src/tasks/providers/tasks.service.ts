import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, asc, count, eq, inArray, type SQL } from 'drizzle-orm';
import {
  PG_FOREIGN_KEY_VIOLATION,
  pgErrorCode,
} from '#/common/database-errors';
import { todayInSeoul } from '#/common/dates';
import { withIGa, withRo } from '#/common/korean';
import { offsetOf, pageOf, type Page } from '#/common/pagination';
import {
  loadDepartments,
  loadPeople,
  refOf,
  type DepartmentRef,
  type PersonRef,
} from '#/common/people';
import type { Viewer } from '#/common/viewer';
import { DatabaseService } from '#/db/database.service';
import {
  activities,
  activityHistories,
  Permission,
  taskLogs,
  tasks,
  users,
  type TaskLogKind,
  type TaskStatus,
} from '#/db/schema/index';
import type {
  CreateTaskDto,
  TaskListQuery,
  TaskLogDto,
  UpdateTaskDto,
} from '../dto/tasks.dto.ts';
import { logKindFor } from '../tasks.policy.ts';

type Db = DatabaseService['db'];
type Tx = Parameters<Parameters<Db['transaction']>[0]>[0];
type TaskRow = typeof tasks.$inferSelect;

export interface TaskLogEntry {
  id: number;
  at: Date;
  kind: TaskLogKind;
  text: string;
  status: TaskStatus | null;
}

export interface TaskSummary {
  id: number;
  title: string;
  tag: string | null;
  activity: { id: number; title: string } | null;
  assigner: PersonRef | null;
  department: DepartmentRef | null;
  assignee: PersonRef | null;
  startAt: string;
  dueAt: string;
  status: TaskStatus;
}

export interface TaskDetail extends TaskSummary {
  logs: TaskLogEntry[];
}

function displayName(viewer: Viewer): string {
  return viewer.name ?? '학생회';
}

@Injectable()
export class TasksService {
  constructor(private readonly database: DatabaseService) {}

  private get db(): Db {
    return this.database.db;
  }

  private async summaries(rows: TaskRow[]): Promise<TaskSummary[]> {
    if (rows.length === 0) return [];
    const activityIds = [
      ...new Set(
        rows.flatMap((row) => (row.activityId ? [row.activityId] : [])),
      ),
    ];
    const [people, departmentRefs, linked] = await Promise.all([
      loadPeople(
        this.db,
        rows.flatMap((row) => [row.assignerId, row.assigneeId]),
      ),
      loadDepartments(
        this.db,
        rows.map((row) => row.departmentId),
      ),
      activityIds.length
        ? this.db
            .select({ id: activities.id, title: activities.title })
            .from(activities)
            .where(inArray(activities.id, activityIds))
        : Promise.resolve([]),
    ]);
    const activityRefs = new Map(linked.map((item) => [item.id, item]));
    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      tag: row.tag,
      activity: refOf(activityRefs, row.activityId),
      assigner: refOf(people, row.assignerId),
      department: refOf(departmentRefs, row.departmentId),
      assignee: refOf(people, row.assigneeId),
      startAt: row.startAt,
      dueAt: row.dueAt,
      status: row.status,
    }));
  }

  /** TSK-R1 업무 보드 and HOM-09 나의 업무, ordered by due date. */
  async list(viewer: Viewer, query: TaskListQuery): Promise<Page<TaskSummary>> {
    const where: SQL | undefined = and(
      query.status ? eq(tasks.status, query.status) : undefined,
      query.activityId != null
        ? eq(tasks.activityId, query.activityId)
        : undefined,
      query.departmentId != null
        ? eq(tasks.departmentId, query.departmentId)
        : undefined,
      query.mine ? eq(tasks.assigneeId, viewer.id) : undefined,
    );
    const rows = await this.db
      .select()
      .from(tasks)
      .where(where)
      .orderBy(asc(tasks.dueAt), asc(tasks.id))
      .limit(query.pageSize)
      .offset(offsetOf(query));
    const [{ total }] = await this.db
      .select({ total: count() })
      .from(tasks)
      .where(where);
    return pageOf(await this.summaries(rows), total, query);
  }

  private async findRow(id: number, db: Db | Tx = this.db): Promise<TaskRow> {
    const [row] = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, id))
      .limit(1);
    if (!row) throw new NotFoundException('Task not found');
    return row;
  }

  /** TSK-R2 */
  async get(id: number): Promise<TaskDetail> {
    const row = await this.findRow(id);
    const [[summary], logs] = await Promise.all([
      this.summaries([row]),
      this.db
        .select({
          id: taskLogs.id,
          at: taskLogs.at,
          kind: taskLogs.kind,
          text: taskLogs.text,
          status: taskLogs.status,
        })
        .from(taskLogs)
        .where(eq(taskLogs.taskId, id))
        .orderBy(asc(taskLogs.at), asc(taskLogs.id)),
    ]);
    return { ...summary, logs };
  }

  private async assigneeName(db: Db | Tx, userId: string): Promise<string> {
    const [user] = await db
      .select({ name: users.name, permissions: users.permissions })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    if (!user || (user.permissions & Permission.isStudentCouncil) === 0)
      throw new BadRequestException('담당자 must be a student council member');
    return user.name ?? '학생회';
  }

  /**
   * Adds a 진행 기록, makes its status the task's current status (TSK-C2), and
   * copies it to the linked activity's 추진 이력 (기능 명세서 6장).
   */
  private async log(
    db: Tx,
    viewer: Viewer,
    task: Pick<TaskRow, 'id' | 'title' | 'activityId'>,
    entry: { kind: TaskLogKind; text: string; status?: TaskStatus },
  ): Promise<void> {
    const at = new Date();
    await db.insert(taskLogs).values({
      taskId: task.id,
      kind: entry.kind,
      text: entry.text,
      status: entry.status ?? null,
      createdById: viewer.id,
      at,
    });
    if (entry.status)
      await db
        .update(tasks)
        .set({ status: entry.status })
        .where(eq(tasks.id, task.id));
    if (task.activityId)
      await db.insert(activityHistories).values({
        activityId: task.activityId,
        kind: '추진',
        title: `업무 ‘${task.title}’ ${entry.kind}`,
        body: entry.text,
        at,
        taskId: task.id,
        createdById: viewer.id,
      });
  }

  private mapError(error: unknown) {
    return pgErrorCode(error) === PG_FOREIGN_KEY_VIOLATION
      ? new BadRequestException('Linked activity or department not found')
      : error;
  }

  /** TSK-C1. 시작일 defaults to today in Seoul. */
  async create(viewer: Viewer, dto: CreateTaskDto): Promise<TaskDetail> {
    const startAt = dto.startAt ?? todayInSeoul();
    if (dto.dueAt < startAt)
      throw new BadRequestException('마감일 must not be before 시작일');
    const id = await this.db
      .transaction(async (tx) => {
        const assigneeId =
          dto.assigneeId === undefined ? viewer.id : dto.assigneeId;
        const assignee = assigneeId
          ? await this.assigneeName(tx, assigneeId)
          : null;
        const [created] = await tx
          .insert(tasks)
          .values({
            title: dto.title,
            tag: dto.tag ?? null,
            activityId: dto.activityId ?? null,
            assignerId: viewer.id,
            departmentId: dto.departmentId ?? null,
            assigneeId,
            startAt,
            dueAt: dto.dueAt,
            status: dto.status,
          })
          .returning();
        const assigner = displayName(viewer);
        await this.log(tx, viewer, created, {
          kind: '배정',
          text:
            !assignee || assigneeId === viewer.id
              ? `${withIGa(assigner)} 업무를 만들었어요.`
              : `${withIGa(assigner)} ${assignee}에게 업무를 배정했어요.`,
          status: dto.status,
        });
        return created.id;
      })
      .catch((error: unknown) => {
        throw this.mapError(error);
      });
    return this.get(id);
  }

  /** TSK-C2 */
  async addLog(
    viewer: Viewer,
    id: number,
    dto: TaskLogDto,
  ): Promise<TaskDetail> {
    await this.db.transaction(async (tx) => {
      const task = await this.findRow(id, tx);
      await this.log(tx, viewer, task, {
        kind: logKindFor(dto.status),
        text: dto.text,
        status: dto.status,
      });
    });
    return this.get(id);
  }

  /** TSK-U1. Every change is written to the 진행 기록 as a 수정 entry. */
  async update(
    viewer: Viewer,
    id: number,
    dto: UpdateTaskDto,
  ): Promise<TaskDetail> {
    await this.db
      .transaction(async (tx) => {
        const task = await this.findRow(id, tx);
        const startAt = dto.startAt ?? task.startAt;
        const dueAt = dto.dueAt ?? task.dueAt;
        if (dueAt < startAt)
          throw new BadRequestException('마감일 must not be before 시작일');
        const changes: string[] = [];
        if (dto.title !== undefined && dto.title !== task.title)
          changes.push('제목을');
        if (dto.tag !== undefined && dto.tag !== task.tag)
          changes.push('태그를');
        if (dto.activityId !== undefined && dto.activityId !== task.activityId)
          changes.push('연결된 활동을');
        if (
          dto.departmentId !== undefined &&
          dto.departmentId !== task.departmentId
        )
          changes.push('담당 부서를');
        if (
          dto.assigneeId !== undefined &&
          dto.assigneeId !== task.assigneeId
        ) {
          const before = task.assigneeId
            ? (await loadPeople(tx, [task.assigneeId])).get(task.assigneeId)
                ?.name
            : null;
          const after = dto.assigneeId
            ? await this.assigneeName(tx, dto.assigneeId)
            : null;
          changes.push(
            before && after
              ? `담당자를 ${before}에서 ${withRo(after)}`
              : '담당자를',
          );
        }
        if (startAt !== task.startAt)
          changes.push(`시작일을 ${task.startAt}에서 ${withRo(startAt)}`);
        if (dueAt !== task.dueAt)
          changes.push(`마감일을 ${task.dueAt}에서 ${withRo(dueAt)}`);
        if (changes.length === 0) return;
        await tx.update(tasks).set(dto).where(eq(tasks.id, id));
        await this.log(
          tx,
          viewer,
          { ...task, ...dto },
          {
            kind: '수정',
            text: `${withIGa(displayName(viewer))} ${changes.join(', ')} 바꿨어요.`,
          },
        );
      })
      .catch((error: unknown) => {
        throw this.mapError(error);
      });
    return this.get(id);
  }

  async remove(id: number): Promise<void> {
    const deleted = await this.db
      .delete(tasks)
      .where(eq(tasks.id, id))
      .returning({ id: tasks.id });
    if (deleted.length === 0) throw new NotFoundException('Task not found');
  }
}
