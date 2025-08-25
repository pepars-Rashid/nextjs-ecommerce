import { configDotenv } from 'dotenv';
import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

configDotenv({ path: '.env.local' });

export default defineConfig({
  out: './drizzle',
  schema: "./src/database/schema.js",
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
