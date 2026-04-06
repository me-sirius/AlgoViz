/**
 * Simulate Queue Load Test
 * Simulates multiple jobs being added to queue to test queue management
 */

const { addSubmissionJob, getQueueStats, shouldQueue } = require('../utils/submissionQueue');

console.log('🚀 Starting Queue Load Simulation...\n');

// Simulate a submission execution (mock function)
function mockSubmissionExecution(requestId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        finalStatus: 'Accepted',
        passedCount: 15,
        totalCases: 15,
        totalTime: 2500,
        maxMemory: 50,
        allResults: [],
        submissionId: `mock-${requestId}`,
        remainingCredits: 100,
        streak: 5,
        maxStreak: 10,
      });
    }, 3000); // Simulate 3s execution time
  });
}

async function simulateLoad() {
  const NUM_REQUESTS = 25; // Start with 25 requests
  const results = { direct: 0, queued: 0, failed: 0 };

  console.log(`📊 Simulating ${NUM_REQUESTS} concurrent submissions...\n`);

  const promises = Array.from({ length: NUM_REQUESTS }, async (_, i) => {
    const requestId = i + 1;
    
    try {
      // Check if should queue
      const willQueue = shouldQueue();
      
      if (willQueue) {
        // Add to queue
        const {jobId, position, estimatedWait } = await addSubmissionJob({
          userId: 'test-user',
          questionId: 'test-question',
          code: 'test code',
          language: 'cpp',
          executeSubmission: async () => mockSubmissionExecution(requestId),
        });
        
        console.log(`[Request ${requestId}] ✋ QUEUED - Position: ${position}, Est. wait: ${estimatedWait}s, JobID: ${jobId}`);
        results.queued++;
      } else {
        // Direct execution simulation
        console.log(`[Request ${requestId}] ⚡ DIRECT EXECUTION`);
        await mockSubmissionExecution(requestId);
        results.direct++;
      }
    } catch (error) {
      console.error(`[Request ${requestId}] ❌ FAILED:`, error.message);
      results.failed++;
    }
  });

  await Promise.all(promises);

  // Get final stats
  console.log('\n' + '='.repeat(60));
  console.log('📊 SIMULATION RESULTS');
  console.log('='.repeat(60));
  console.log(`⚡ Direct Execution: ${results.direct} requests`);
  console.log(`✋ Queued: ${results.queued} requests`);
  console.log(`❌ Failed: ${results.failed} requests`);
  
  const stats = await getQueueStats();
  console.log('\n📋 Current Queue Status:');
  console.log(`   Waiting: ${stats.waiting}`);
  console.log(`   Active: ${stats.active}`);
  console.log(`   Completed: ${stats.completed}`);
  console.log(`   Max Concurrency: ${stats.maxConcurrency}`);
  console.log(`   Is Busy: ${stats.isBusy ? 'YES' : 'NO'}`);
  
  console.log('\n✅ Load simulation complete!');
  console.log('\n💡 Note: Jobs are being processed in background by workers.');
  console.log('   Use Redis CLI to monitor: redis-cli KEYS "bull:code-submissions:*"');
  
  // Wait a bit for jobs to start processing
  console.log('\n⏳ Waiting 5s to check job processing...');
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  const finalStats = await getQueueStats();
  console.log('\n📋 After 5s:');
  console.log(`   Waiting: ${finalStats.waiting}`);
  console.log(`   Active: ${finalStats.active}`);
  console.log(`   Completed: ${finalStats.completed}`);
  
  // Don't exit, let workers continue
  console.log('\n⚠️  Workers are still processing jobs. Press Ctrl+C to exit.');
}

simulateLoad().catch(error => {
  console.error('❌ Simulation failed:', error);
  process.exit(1);
});
