const { pool } = require('../config/database');
require('dotenv').config();

async function testDatabaseConnection() {
    console.log('🔍 Testing database connection...\n');

    try {
        // Test basic connection
        console.log('1️⃣  Testing basic connection...');
        const result = await pool.query('SELECT NOW() as current_time, version() as version');
        console.log(`   ✅ Connected successfully!`);
        console.log(`   📅 Server time: ${result.rows[0].current_time}`);
        console.log(`   📦 PostgreSQL version: ${result.rows[0].version.split(',')[0]}\n`);

        // Count tables
        console.log('2️⃣  Checking database tables...');
        const tables = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            ORDER BY table_name
        `);
        console.log(`   ✅ Found ${tables.rows.length} tables:`);
        tables.rows.forEach((row, index) => {
            console.log(`      ${index + 1}. ${row.table_name}`);
        });

        // Count views
        console.log('\n3️⃣  Checking database views...');
        const views = await pool.query(`
            SELECT table_name 
            FROM information_schema.views 
            WHERE table_schema = 'public'
            ORDER BY table_name
        `);
        console.log(`   ✅ Found ${views.rows.length} views:`);
        views.rows.forEach((row, index) => {
            console.log(`      ${index + 1}. ${row.table_name}`);
        });

        // Test a simple query on each main table
        console.log('\n4️⃣  Testing table accessibility...');
        const testTables = [
            'families',
            'users',
            'registration_sessions',
            'tasks',
            'task_assignments',
            'rewards',
            'notifications'
        ];

        for (const table of testTables) {
            try {
                await pool.query(`SELECT COUNT(*) FROM ${table}`);
                console.log(`   ✅ ${table} - accessible`);
            } catch (error) {
                console.log(`   ❌ ${table} - error: ${error.message}`);
            }
        }

        console.log('\n✨ Database connection test completed successfully!\n');

        // Display connection info
        console.log('📝 Connection Details:');
        console.log(`   Host: ${process.env.DB_HOST || 'localhost'}`);
        console.log(`   Port: ${process.env.DB_PORT || 5432}`);
        console.log(`   Database: ${process.env.DB_NAME || 'taskbuddy_db'}`);
        console.log(`   User: ${process.env.DB_USER || 'postgres'}`);

    } catch (error) {
        console.error('\n❌ Database connection test failed!');
        console.error('Error:', error.message);
        console.error('\nPlease check:');
        console.error('  1. PostgreSQL is running');
        console.error('  2. Database credentials in .env file are correct');
        console.error('  3. Database has been created (run: npm run setup-db)');
        process.exit(1);
    } finally {
        await pool.end();
    }
}

// Run test
testDatabaseConnection();