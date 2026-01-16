const { RegistrationSessionModel } = require('../models');
require('dotenv').config();

async function cleanExpiredSessions() {
    console.log('🧹 Starting cleanup of expired registration sessions...\n');

    try {
        // Get list of expired sessions before deletion
        const expiredSessions = await RegistrationSessionModel.getExpired();
        
        if (expiredSessions.length === 0) {
            console.log('✅ No expired sessions found. Database is clean!');
            process.exit(0);
        }

        console.log(`📋 Found ${expiredSessions.length} expired session(s):`);
        expiredSessions.forEach((session, index) => {
            console.log(`   ${index + 1}. Email: ${session.email}`);
            console.log(`      Created: ${session.created_at}`);
        });

        console.log('\n🗑️  Deleting expired sessions...');
        
        // Delete expired sessions
        const deletedCount = await RegistrationSessionModel.cleanExpired();
        
        console.log(`✅ Successfully deleted ${deletedCount} expired session(s)`);
        
    } catch (error) {
        console.error('❌ Error during cleanup:', error.message);
        console.error(error);
        process.exit(1);
    }

    process.exit(0);
}

// Run cleanup
cleanExpiredSessions();