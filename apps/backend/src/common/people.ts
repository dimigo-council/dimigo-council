import { inArray } from 'drizzle-orm';
import type { DatabaseService } from '#/db/database.service';
import { departments, users } from '#/db/schema/index';

export interface PersonRef {
  id: string;
  name: string | null;
}
export interface DepartmentRef {
  id: number;
  name: string;
}

type Db = Pick<DatabaseService['db'], 'select'>;

/** Loads display names for council members shown on activities, tasks and surveys. */
export async function loadPeople(
  db: Db,
  ids: Iterable<string | null | undefined>,
): Promise<Map<string, PersonRef>> {
  const unique = [...new Set([...ids].filter((id): id is string => !!id))];
  if (unique.length === 0) return new Map();
  const rows = await db
    .select({ id: users.id, name: users.name })
    .from(users)
    .where(inArray(users.id, unique));
  return new Map(rows.map((row) => [row.id, row]));
}

export async function loadDepartments(
  db: Db,
  ids: Iterable<number | null | undefined>,
): Promise<Map<number, DepartmentRef>> {
  const unique = [
    ...new Set([...ids].filter((id): id is number => id != null)),
  ];
  if (unique.length === 0) return new Map();
  const rows = await db
    .select({ id: departments.id, name: departments.name })
    .from(departments)
    .where(inArray(departments.id, unique));
  return new Map(rows.map((row) => [row.id, row]));
}

export function refOf<K, V>(
  map: Map<K, V>,
  id: K | null | undefined,
): V | null {
  return id == null ? null : (map.get(id) ?? null);
}
