import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  and,
  asc,
  count,
  eq,
  ilike,
  isNotNull,
  or,
  sql,
  type SQL,
} from 'drizzle-orm';
import {
  PG_FOREIGN_KEY_VIOLATION,
  pgErrorCode,
} from '#/common/database-errors';
import { offsetOf, pageOf, type Page } from '#/common/pagination';
import { DatabaseService } from '#/db/database.service';
import {
  departmentMembers,
  departments,
  Permission,
  users,
  type DepartmentRole,
} from '#/db/schema/index';
import type {
  MemberListQuery,
  MembershipDto,
  UserListQuery,
} from '../dto/members.dto.ts';

/** The frontend's member permission labels. */
export type MemberPermission = '관리자' | '부서 관리' | '일반';

export interface Member {
  id: string;
  name: string | null;
  email: string;
  pictureUrl: string | null;
  grade: number | null;
  class: number | null;
  department: { id: number; name: string } | null;
  role: DepartmentRole | null;
  position: string | null;
  permission: MemberPermission;
  isAdmin: boolean;
  isStudentCouncil: boolean;
}

type MemberRow = {
  id: string;
  name: string | null;
  email: string;
  pictureUrl: string | null;
  grade: number | null;
  class: number | null;
  permissions: number;
  departmentId: number | null;
  departmentName: string | null;
  role: DepartmentRole | null;
  position: string | null;
};

export function toMember(row: MemberRow): Member {
  const isAdmin = (row.permissions & Permission.isAdmin) !== 0;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    pictureUrl: row.pictureUrl,
    grade: row.grade,
    class: row.class,
    department:
      row.departmentId != null && row.departmentName != null
        ? { id: row.departmentId, name: row.departmentName }
        : null,
    role: row.role,
    position: row.position,
    permission: isAdmin ? '관리자' : row.role === 'head' ? '부서 관리' : '일반',
    isAdmin,
    isStudentCouncil: (row.permissions & Permission.isStudentCouncil) !== 0,
  };
}

const memberColumns = {
  id: users.id,
  name: users.name,
  email: users.email,
  pictureUrl: users.pictureUrl,
  grade: users.grade,
  class: users.class,
  permissions: users.permissions,
  departmentId: departmentMembers.departmentId,
  departmentName: departments.name,
  role: departmentMembers.role,
  position: departmentMembers.position,
};

// Constants are inlined so PostgreSQL types the bit operators as integer.
const COUNCIL_BIT = sql.raw(String(Permission.isStudentCouncil));
const hasCouncilBit = sql`(${users.permissions} & ${COUNCIL_BIT}) <> 0`;
const lacksCouncilBit = sql`(${users.permissions} & ${COUNCIL_BIT}) = 0`;

@Injectable()
export class MembersService {
  constructor(private readonly database: DatabaseService) {}

  private get db(): DatabaseService['db'] {
    return this.database.db;
  }

  private async listUsers(
    where: SQL | undefined,
    query: { page: number; pageSize: number },
  ): Promise<Page<Member>> {
    const rows = await this.db
      .select(memberColumns)
      .from(users)
      .leftJoin(departmentMembers, eq(departmentMembers.userId, users.id))
      .leftJoin(departments, eq(departments.id, departmentMembers.departmentId))
      .where(where)
      .orderBy(asc(departments.id), asc(users.name), asc(users.id))
      .limit(query.pageSize)
      .offset(offsetOf(query));
    const [{ total }] = await this.db
      .select({ total: count() })
      .from(users)
      .leftJoin(departmentMembers, eq(departmentMembers.userId, users.id))
      .where(where);
    return pageOf(rows.map(toMember), total, query);
  }

  /** 학생회 구성원: users with the isStudentCouncil bit. */
  listMembers(query: MemberListQuery): Promise<Page<Member>> {
    return this.listUsers(
      and(
        hasCouncilBit,
        query.departmentId != null
          ? eq(departmentMembers.departmentId, query.departmentId)
          : undefined,
      ),
      query,
    );
  }

  /** Every onboarded user, for admins choosing whom to add to the council. */
  listAllUsers(query: UserListQuery): Promise<Page<Member>> {
    const search = query.search
      ? `%${query.search.replace(/[\\%_]/g, (match) => `\\${match}`)}%`
      : undefined;
    return this.listUsers(
      and(
        isNotNull(users.onboardingCompletedAt),
        query.council === undefined
          ? undefined
          : query.council
            ? hasCouncilBit
            : lacksCouncilBit,
        search
          ? or(ilike(users.name, search), ilike(users.email, search))
          : undefined,
      ),
      query,
    );
  }

  private async getMember(userId: string): Promise<Member> {
    const [row] = await this.db
      .select(memberColumns)
      .from(users)
      .leftJoin(departmentMembers, eq(departmentMembers.userId, users.id))
      .leftJoin(departments, eq(departments.id, departmentMembers.departmentId))
      .where(eq(users.id, userId))
      .limit(1);
    if (!row) throw new NotFoundException('User not found');
    return toMember(row);
  }

  /** Only council members can belong to a department. */
  async assignDepartment(
    userId: string,
    membership: MembershipDto,
  ): Promise<Member> {
    const member = await this.getMember(userId);
    if (!member.isStudentCouncil)
      throw new BadRequestException('User is not a student council member');
    const values = {
      departmentId: membership.departmentId,
      role: membership.role,
      position: membership.position ?? null,
    };
    try {
      await this.db
        .insert(departmentMembers)
        .values({ userId, ...values })
        .onConflictDoUpdate({ target: departmentMembers.userId, set: values });
    } catch (error) {
      if (pgErrorCode(error) === PG_FOREIGN_KEY_VIOLATION)
        throw new NotFoundException('Department not found');
      throw error;
    }
    return this.getMember(userId);
  }

  async removeFromDepartment(userId: string): Promise<Member> {
    await this.getMember(userId);
    await this.db
      .delete(departmentMembers)
      .where(eq(departmentMembers.userId, userId));
    return this.getMember(userId);
  }

  /**
   * Grants or revokes the isStudentCouncil bit. Revoking also removes the
   * department membership. The change reaches the user's access token at the
   * next refresh (up to 15 minutes later).
   */
  async setCouncil(userId: string, isStudentCouncil: boolean): Promise<Member> {
    await this.db.transaction(async (tx) => {
      const [updated] = await tx
        .update(users)
        .set({
          permissions: isStudentCouncil
            ? sql`${users.permissions} | ${COUNCIL_BIT}`
            : sql`${users.permissions} & ~${COUNCIL_BIT}`,
        })
        .where(eq(users.id, userId))
        .returning({ id: users.id });
      if (!updated) throw new NotFoundException('User not found');
      if (!isStudentCouncil)
        await tx
          .delete(departmentMembers)
          .where(eq(departmentMembers.userId, userId));
    });
    return this.getMember(userId);
  }
}
