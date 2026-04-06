/**
 * Migration Script: Update testCasesUrl to use correct Oracle endpoint
 * Endpoint format: http://140.245.240.6:3000/questions/:id/testcases
 * 
 * Run: node scripts/migrateTestCasesToUrl.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URL = process.env.MONGO_URL;
const ORACLE_STORAGE_URL = process.env.ORACLE_STORAGE_URL || 'http://140.245.240.6:3000';

async function migrateTestCases() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URL);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;
    const questionsCollection = db.collection('questions');

    const questions = await questionsCollection.find({}).toArray();
    console.log(`📋 Found ${questions.length} questions to migrate\n`);

    let migratedCount = 0;

    for (const question of questions) {
      const questionId = question._id.toString();
      
      console.log(`🔄 Migrating: "${question.title}"`);

      // Correct endpoint: /questions/:id/testcases
      const testCasesUrl = `${ORACLE_STORAGE_URL}/questions/${questionId}/testcases`;

      await questionsCollection.updateOne(
        { _id: question._id },
        { 
          $set: { testCasesUrl: testCasesUrl },
          $unset: { testCases: "" }
        }
      );

      console.log(`   ✅ testCasesUrl: ${testCasesUrl}`);
      migratedCount++;
    }

    console.log('\n========================================');
    console.log('📊 MIGRATION COMPLETE');
    console.log('========================================');
    console.log(`✅ Migrated: ${migratedCount} questions`);
    console.log(`📁 Format: ${ORACLE_STORAGE_URL}/questions/<id>/testcases`);
    console.log('========================================\n');

  } catch (error) {
    console.error('❌ Migration Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

migrateTestCases();
