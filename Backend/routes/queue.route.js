const express = require('express');
const router = express.Router();
const { getJobStatus, getQueueStats } = require('../utils/submissionQueue');

/**
 * GET /api/queue/status/:jobId
 * Check the status of a queued submission job
 */
router.get('/status/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const status = await getJobStatus(jobId);
    
    res.json({ success: true, ...status });
  } catch (error) {
    console.error('[Queue API] Error getting job status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get job status',
      error: error.message 
    });
  }
});

/**
 * GET /api/queue/stats
 * Get overall queue statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await getQueueStats();
    
    res.json({ success: true, ...stats });
  } catch (error) {
    console.error('[Queue API] Error getting queue stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get queue stats',
      error: error.message 
    });
  }
});

module.exports = router;
