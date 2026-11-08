export * from './schema.ts';

import type { users } from './schema.ts';

export type Users = typeof users.$inferSelect;
