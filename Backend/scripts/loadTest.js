/**
 * Load Testing Script for Queue Management System
 * 
 * This script simulates 50 concurrent users submitting code simultaneously
 * to test the queue management system under heavy load.
 * 
 * Usage: node scripts/loadTest.js
 */

const axios = require('axios');

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:4000';
const NUM_CONCURRENT_REQUESTS = 50;
const TEST_QUESTION_ID = process.env.TEST_QUESTION_ID || '679569ea1fcc9f4e02f3edcc'; // Replace with real question ID
const TEST_USER_TOKEN = process.env.TEST_USER_TOKEN || ''; // Add a test user token

// Sample test code (simple valid C++ program)
const TEST_CODE = `
#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    cout << n * 2 << endl;
    return 0;
}
`;

// Track results
const results = {
  directExecution: [],
  queued: [],
  failed: [],
  totalStartTime: null,
  totalEndTime: null,
};

/**
 * Submit a single code execution request
 */
async function submitCode(requestId) {
  const startTime = Date.now();
  
  try {
    console.log(`[Request ${requestId}] Submitting...`);
    
    const response = await axios.post(
      `${API_BASE_URL}/code/submit-code`,
      {
        code: TEST_CODE,
        language: 'cpp',
        questionId: TEST_QUESTION_ID,
      },
      {
        headers: {
          'Authorization': `Bearer ${TEST_USER_TOKEN}`,
          'Content-Type': 'application/json',
        },
        timeout: 150000, // 150s timeout
      }
    );

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    if (response.data.queued) {
      //Queued response
      console.log(
        `[Request ${requestId}] ✋ QUEUED - Position: ${response.data.position}, Est. wait: ${response.data.estimatedWait}s`
      );
      
      results.queued.push({
        requestId,
        position: response.data.position,
        estimatedWait: response.data.estimatedWait,
        jobId: response.data.jobId,
        responseTime,
      });

      // Poll for result
      const finalResult = await pollForResult(response.data.jobId, requestId);
      const totalTime = Date.now() - startTime;
      
      results.queued[results.queued.length - 1].finalStatus = finalResult.status;
      results.queued[results.queued.length - 1].totalTime = totalTime;
      
      console.log(
        `[Request ${requestId}] ✅ COMPLETED (queued) - Total time: ${totalTime}ms, Status: ${finalResult.status}`
      );
    } else {
      // Direct execution
      console.log(
        `[Request ${requestId}] ⚡ DIRECT EXECUTION - Response time: ${responseTime}ms, Status: ${response.data.status}`
      );
      
      results.directExecution.push({
        requestId,
        status: response.data.status,
        passed: response.data.passed,
        total: response.data.total,
        responseTime,
      });
    }

    return { success: true, requestId, responseTime };
  } catch (error) {
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    console.error(
      `[Request ${requestId}] ❌ FAILED - ${error.message} (${responseTime}ms)`
    );
    
    results.failed.push({
      requestId,
      error: error.message,
      responseTime,
    });

    return { success: false, requestId, error: error.message };
  }
}

/**
 * Poll for queued job result
 */
async function pollForResult(jobId, requestId) {
  const maxPolls = 60; // Poll for max 2 minutes (60 * 2s = 120s)
  let polls = 0;

  while (polls < maxPolls) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/queue/status/${jobId}`,
        {
          headers: {
            'Authorization': `Bearer ${TEST_USER_TOKEN}`,
          },
        }
      );

      if (response.data.status === 'completed') {
        return {
          status: response.data.result.finalStatus,
          passed: response.data.result.passedCount,
          total: response.data.result.totalCases,
        };
      } else if (response.data.status === 'failed') {
        return {
          status: 'Error',
          error: response.data.error,
        };
      }

      // Still waiting, poll again
      polls++;
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`[Request ${requestId}] Poll error:`, error.message);
      polls++;
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  return {
    status: 'Timeout',
    error: 'Polling timed out',
  };
}

/**
 * Print test results summary
 */
function printSummary() {
  console.log('\n' + '='.repeat(80));
  console.log('📊 LOAD TEST RESULTS SUMMARY');
  console.log('='.repeat(80));
  
  console.log(`\n⚡ Direct Execution: ${results.directExecution.length} requests`);
  if (results.directExecution.length > 0) {
    const avgResponseTime =
      results.directExecution.reduce((sum, r) => sum + r.responseTime, 0) /
      results.directExecution.length;
    console.log(`   Average response time: ${avgResponseTime.toFixed(0)}ms`);
  }

  console.log(`\n✋ Queued: ${results.queued.length} requests`);
  if (results.queued.length > 0) {
    const avgTotalTime =
      results.queued.reduce((sum, r) => sum + (r.totalTime || 0), 0) /
      results.queued.length;
    const avgPosition =
      results.queued.reduce((sum, r) => sum + r.position, 0) /
      results.queued.length;
    console.log(`   Average queue position: ${avgPosition.toFixed(1)}`);
    console.log(`   Average total time (queue + execution): ${avgTotalTime.toFixed(0)}ms`);
  }

  console.log(`\n❌ Failed: ${results.failed.length} requests`);

  const totalTime = results.totalEndTime - results.totalStartTime;
  console.log(`\n⏱️  Total test duration: ${(totalTime / 1000).toFixed(2)}s`);
  console.log(`\n✅ Success Rate: ${((NUM_CONCURRENT_REQUESTS - results.failed.length) / NUM_CONCURRENT_REQUESTS * 100).toFixed(1)}%`);
  
  console.log('\n' + '='.repeat(80));
}

/**
 * Main test execution
 */
async function runLoadTest() {
  console.log('🚀 Starting Load Test...');
  console.log(`   Concurrent requests: ${NUM_CONCURRENT_REQUESTS}`);
  console.log(`   API endpoint: ${API_BASE_URL}`);
  console.log(`   Question ID: ${TEST_QUESTION_ID}`);
  console.log('');

  if (!TEST_USER_TOKEN) {
    console.error('❌ Error: TEST_USER_TOKEN environment variable not set!');
    console.log('\nUsage: TEST_USER_TOKEN="your-jwt-token" node scripts/loadTest.js');
    process.exit(1);
  }

  results.totalStartTime = Date.now();

  // Fire all requests concurrently
  const promises = Array.from({ length: NUM_CONCURRENT_REQUESTS }, (_, i) =>
    submitCode(i + 1)
  );

  await Promise.all(promises);

  results.totalEndTime = Date.now();

  // Print summary
  printSummary();
}

// Run the test
runLoadTest().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
