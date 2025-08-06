import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Simple and stable Neon configuration
neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Create ultra-simple connection pool with minimal configuration
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 1,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
  allowExitOnIdle: false
});

// Add basic error handling
pool.on('error', (err) => {
  console.error('Database pool error (handled):', err.message);
});

export const db = drizzle({ client: pool, schema });