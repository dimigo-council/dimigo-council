import { getTableName, type Table } from 'drizzle-orm';
import type { DatabaseService } from '../src/db/database.service.ts';

type Operation = 'select' | 'insert' | 'update' | 'delete';

export interface RecordedQuery {
  operation: Operation;
  table: string;
  /** Method name → arguments, in call order (values, set, where, …). */
  calls: [string, unknown[]][];
  /** Arguments of the first call to a method, such as `values` or `set`. */
  arg(method: string): unknown;
}

/**
 * A Drizzle stand-in for service unit tests. Each awaited query takes the next
 * result queued for its operation and table, so tests do not depend on the
 * order of queries run with Promise.all.
 */
export function mockDatabase() {
  const queued = new Map<string, unknown[]>();
  const recorded: RecordedQuery[] = [];

  function chain(operation: Operation, table?: Table, args: unknown[] = []) {
    const query: RecordedQuery = {
      operation,
      table: table ? getTableName(table) : '',
      calls: [[operation, args]],
      arg(method) {
        return this.calls.find(([name]) => name === method)?.[1][0];
      },
    };
    recorded.push(query);
    const proxy: object = new Proxy(
      {},
      {
        get(_target, property) {
          if (property === 'then')
            return (
              resolve: (value: unknown) => void,
              reject: (error: unknown) => void,
            ) => {
              const key = `${operation} ${query.table}`;
              const results = queued.get(key);
              if (!results?.length)
                return reject(new Error(`No mock result for ${key}`));
              const result = results.shift();
              return result instanceof Error ? reject(result) : resolve(result);
            };
          return (...args: unknown[]) => {
            if (property === 'from' && operation === 'select')
              query.table = getTableName(args[0] as Table);
            query.calls.push([String(property), args]);
            return proxy;
          };
        },
      },
    );
    return proxy;
  }

  const db = {
    select: (...args: unknown[]) => chain('select', undefined, args),
    insert: (table: Table) => chain('insert', table),
    update: (table: Table) => chain('update', table),
    delete: (table: Table) => chain('delete', table),
    transaction: async <T>(run: (tx: unknown) => Promise<T>) => run(db),
  };

  return {
    database: { db } as unknown as DatabaseService,
    /** Queues the result of the next `operation` on `table`. */
    on(operation: Operation, table: string, result: unknown) {
      const key = `${operation} ${table}`;
      queued.set(key, [...(queued.get(key) ?? []), result]);
      return this;
    },
    queries(operation?: Operation, table?: string) {
      return recorded.filter(
        (query) =>
          (!operation || query.operation === operation) &&
          (!table || query.table === table),
      );
    },
  };
}
