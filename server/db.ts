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

// Create stable connection pool optimized for Neon
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 2,
  min: 0,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 60000,
  maxUses: 7500,
  allowExitOnIdle: true,
  application_name: 'medily_app'
});

// Enhanced error handling with reconnection
pool.on('error', (err) => {
  console.error('Database pool error:', err.message);
  // Don't exit process on connection errors
});

pool.on('connect', (client) => {
  console.log('Database client connected successfully');
});

pool.on('acquire', () => {
  console.log('Database client acquired from pool');
});

pool.on('release', () => {
  console.log('Database client released back to pool');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down database pool...');
  await pool.end();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down database pool...');
  await pool.end();
  process.exit(0);
});

export const db = drizzle({ client: pool, schema });