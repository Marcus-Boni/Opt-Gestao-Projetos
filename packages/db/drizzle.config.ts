import { defineConfig } from 'drizzle-kit';

const url = process.env['DATABASE_URL'];
if (!url) throw new Error('DATABASE_URL não definida. Crie packages/db/.env com DATABASE_URL=...');

export default defineConfig({
  schema: './src/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: { url },
});
