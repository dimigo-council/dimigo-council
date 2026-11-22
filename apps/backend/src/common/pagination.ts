import { z } from 'zod';

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export function offsetOf(query: PaginationQuery): number {
  return (query.page - 1) * query.pageSize;
}

export function pageOf<T>(
  items: T[],
  total: number,
  query: PaginationQuery,
): Page<T> {
  return { items, total, page: query.page, pageSize: query.pageSize };
}

/** Query string booleans: `true`/`1` and `false`/`0`. */
export const queryBoolean = z
  .enum(['true', 'false', '1', '0'])
  .transform((value) => value === 'true' || value === '1');
