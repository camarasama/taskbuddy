const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

// Create a connection to postgres database (not the app database yet)
const setupPool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: 'postgres', // Connect to default postgres database
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
});

const dbName = process.env.DB_NAME || 'taskbuddy_db';

async function setupDatabase() {
    console.log('🚀 Starting database setup...\n');

    try {
        // Check if database exists
        const checkDb = await setupPool.query(
            `SELECT 1 FROM pg_database WHERE datname = $1`,
            [dbName]
        );

        if (checkDb.rows.length === 0) {
            // Create database
            console.log(`📦 Creating database: ${dbName}`);
            await setupPool.query(`CREATE DATABASE ${dbName}`);
            console.log('✅ Database created successfully\n');
        } else {
            console.log(`✅ Database ${dbName} already exists\n`);
        }

        // Close connection to postgres database
        await setupPool.end();

        // Connect to the new database
        const appPool = new Pool({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 5432,
            database: dbName,
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || '',
        });

        // Read and execute schema
        console.log('📋 Reading schema file...');
        const schemaPath = path.join(__dirname, '../database/schema.sql');
        const schema = await fs.readFile(schemaPath, 'utf8');

        console.log('🔧 Executing schema...');
        await appPool.query(schema);
        console.log('✅ Schema executed successfully\n');

        // Verify tables were created
        const tables = await appPool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            ORDER BY table_name
        `);

        console.log('📊 Created tables:');
        tables.rows.forEach(row => {
            console.log(`   - ${row.table_name}`);
        });

        // Verify views were created
        const views = await appPool.query(`
            SELECT table_name 
            FROM information_schema.views 
            WHERE table_schema = 'public'
            ORDER BY table_name
        `);

        if (views.rows.length > 0) {
            console.log('\n👁️  Created views:');
            views.rows.forEach(row => {
                console.log(`   - ${row.table_name}`);
            });
        }

        await appPool.end();

        console.log('\n✨ Database setup completed successfully!');
        console.log(`\n📝 Connection details:`);
        console.log(`   Host: ${process.env.DB_HOST || 'localhost'}`);
        console.log(`   Port: ${process.env.DB_PORT || 5432}`);
        console.log(`   Database: ${dbName}`);
        console.log(`   User: ${process.env.DB_USER || 'postgres'}`);

    } catch (error) {
        console.error('❌ Error during database setup:', error.message);
        console.error(error);
        process.exit(1);
    }
}

// Run setup
setupDatabase();