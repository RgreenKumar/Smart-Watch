const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function initDatabase() {
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'media',
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  });

  try {
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await pool.query(schema);
    console.log('Database initialized successfully!');
  } catch (err) {
    if (err.code === '3D000') {
      // Database does not exist, create it
      console.log('Database "media" does not exist. Creating...');
      const adminPool = new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: 'postgres',
        user: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
      });
      await adminPool.query('CREATE DATABASE media');
      await adminPool.end();
      console.log('Database "media" created. Re-running schema...');
      await initDatabase();
    } else {
      console.error('Error initializing database:', err.message);
      process.exit(1);
    }
  } finally {
    await pool.end();
  }
}

initDatabase();
