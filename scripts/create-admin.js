import { Pool } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function createAdminUser() {
  try {
    const email = 'admin@medily.com';
    const password = 'MedilyAdmin123!';
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const client = await pool.connect();
    
    // Check if admin user already exists
    const existingUser = await client.query('SELECT id FROM users WHERE email = $1', [email]);
    
    if (existingUser.rows.length > 0) {
      console.log('Admin user already exists!');
      console.log('Email:', email);
      console.log('You can update the password in the database if needed.');
      return;
    }
    
    // Create admin user
    const result = await client.query(`
      INSERT INTO users (email, password, "firstName", "lastName", "isAdmin", "adminRole", "isActive")
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, email, "firstName", "lastName"
    `, [
      email,
      hashedPassword,
      'Admin',
      'User',
      true,
      'super_admin',
      true
    ]);
    
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', email);
    console.log('🔐 Password:', password);
    console.log('🆔 User ID:', result.rows[0].id);
    console.log('\n🚨 IMPORTANT: Please change the default password after first login!');
    console.log('🔗 Login at: /admin-login');
    
    client.release();
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await pool.end();
  }
}

createAdminUser();