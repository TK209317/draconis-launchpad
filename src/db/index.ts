import "server-only";
import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Create a Neon serverless connection pool
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Export the drizzle instance with schema
export const db = drizzle({ client: pool, schema });
