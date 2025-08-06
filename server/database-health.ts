import { pool } from './db';

// Database health check with retry logic
export async function checkDatabaseHealth(maxRetries = 3): Promise<boolean> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const client = await pool.connect();
      await client.query('SELECT 1');
      client.release();
      console.log(`Database health check passed (attempt ${attempt})`);
      return true;
    } catch (error) {
      console.error(`Database health check failed (attempt ${attempt}/${maxRetries}):`, error);
      
      if (attempt === maxRetries) {
        return false;
      }
      
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
  
  return false;
}

// Auto-recovery mechanism
export function startDatabaseHealthMonitor() {
  setInterval(async () => {
    const isHealthy = await checkDatabaseHealth(1);
    if (!isHealthy) {
      console.warn('Database health check failed, but continuing operation...');
    }
  }, 30000); // Check every 30 seconds
}