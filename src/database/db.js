import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

const sql = neon('postgresql://neondb_owner:npg_c0Hp2RPtiCQl@ep-aged-field-adkvoj6h-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require');

export const db = drizzle({client: sql});