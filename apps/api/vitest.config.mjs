import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    env: {
      DATABASE_URL: 'postgres://test:test@localhost:5432/test_db',
      NODE_ENV: 'test',
      WEB_URL: 'http://localhost:5173',
      API_URL: 'http://localhost:3333',
    },
  },
});
