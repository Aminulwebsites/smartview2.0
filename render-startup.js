#!/usr/bin/env node
import { execSync, spawn } from 'child_process';

console.log('=== SmartView2.0 Render Startup ===');
console.log('Environment:', process.env.NODE_ENV);
console.log('Port:', process.env.PORT || '5000');
console.log('Database URL available:', !!process.env.DATABASE_URL);

// Function to test database connection
async function testDatabase() {
  try {
    console.log('Testing database connection...');
    // Import and test database connection
    const { db } = await import('./dist/db.js');
    const { foodItems } = await import('./dist/schema.js');
    
    // Try to query food items (this will fail if tables don't exist)
    await db.select().from(foodItems).limit(1);
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('Tables may not exist or database is not properly initialized');
    return false;
  }
}

// Start the process
async function start() {
  try {
    // Test database connection (tables should already exist from build step)
    const dbSuccess = await testDatabase();
    
    if (!dbSuccess) {
      console.log('⚠️ Database test failed, but continuing startup...');
      console.log('Note: Database schema should have been created during build step');
    }
    
    // Start the main application
    console.log('🚀 Starting SmartView2.0 server...');
    
    const server = spawn('node', ['dist/index.js'], {
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'production' }
    });
    
    server.on('exit', (code) => {
      console.log(`Server exited with code ${code}`);
      process.exit(code);
    });
    
    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      console.log('Received SIGTERM, shutting down gracefully...');
      server.kill('SIGTERM');
    });
    
  } catch (error) {
    console.error('❌ Startup failed:', error.message);
    process.exit(1);
  }
}

start();