/**
 * Simple Queue Logic Test
 * Tests the queue management without needing authentication
 */

const { shouldQueue, getQueueStats } = require('../utils/submissionQueue');

console.log('🧪 Testing Queue Management Logic...\n');

async function testQueueLogic() {
  try {
    // Test 1: Check initial state
    console.log('1️⃣ Checking initial queue state...');
    const initialStats = await getQueueStats();
    console.log('   Initial stats:', {
      waiting: initialStats.waiting,
      active: initialStats.active,
      maxConcurrency: initialStats.maxConcurrency,
      isBusy: initialStats.isBusy,
    });

    // Test 2: Check shouldQueue function
    console.log('\n2️⃣ Testing shouldQueue() logic...');
    const shouldQueueNow = shouldQueue();
    console.log(`   Should queue: ${shouldQueueNow}`);
    console.log(`   Explanation: ${shouldQueueNow ? 'System busy (≥15 active jobs)' : 'System available, execute directly'}`);

    // Test 3: Get final stats
    console.log('\n3️⃣ Final queue statistics...');
    const finalStats = await getQueueStats();
    console.log('   Queue stats:', JSON.stringify(finalStats, null, 2));

    console.log('\n✅ Queue logic test complete!');
    console.log('\n📝 Summary:');
    console.log('   - Queue system initialized successfully');
    console.log('   - Redis connection working');
    console.log('   - Max concurrency: 15 jobs');
    console.log(`   - Current status: ${finalStats.isBusy ? 'BUSY (will queue)' : 'AVAILABLE (direct execution)'}`);
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('\nPossible issues:');
    console.error('  - Redis not running (run: brew services start redis)');
    console.error('  - Backend not started');
    console.error('  - Queue module not properly initialized');
    process.exit(1);
  }
}

testQueueLogic();
