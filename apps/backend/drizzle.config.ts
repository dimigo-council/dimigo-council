import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

// Drizzle Kit loads this file outside the Nest application and its ConfigModule.
export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema.ts',
  out: './drizzle',
  dbCredentials: { url: process.env.DATABASE_URL ?? '' },
});
