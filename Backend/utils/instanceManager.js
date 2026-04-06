/**
 * Instance Manager - Manages multiple HuggingFace code execution instances
 * Provides round-robin load balancing with health tracking
 */

const axios = require("axios");

// Instance configuration - loaded from environment or defaults
const HF_INSTANCES = [
  {
    url: process.env.HF_INSTANCE_1 || "https://ratankumar10-code-execution.hf.space",
    name: "instance1",
    healthy: true,
    lastCheck: Date.now(),
    activeJobs: 0,
  },
  {
    url: process.env.HF_INSTANCE_2 || "https://instance2-code-execution.hf.space",
    name: "instance2",
    healthy: true,
    lastCheck: Date.now(),
    activeJobs: 0,
  },
  {
    url: process.env.HF_INSTANCE_3 || "https://instance3-code-execution.hf.space",
    name: "instance3",
    healthy: true,
    lastCheck: Date.now(),
    activeJobs: 0,
  },
  {
    url: process.env.HF_INSTANCE_4 || "https://instance4-code-execution.hf.space",
    name: "instance4",
    healthy: true,
    lastCheck: Date.now(),
    activeJobs: 0,
  },
  {
    url: process.env.HF_INSTANCE_5 || "https://instance5-code-execution.hf.space",
    name: "instance5",
    healthy: true,
    lastCheck: Date.now(),
    activeJobs: 0,
  },
];

// Round-robin counter
let currentIndex = 0;

// Health check interval (5 minutes)
const HEALTH_CHECK_INTERVAL = 5 * 60 * 1000;

// Unhealthy cooldown (2 minutes before retry)
const UNHEALTHY_COOLDOWN = 2 * 60 * 1000;

/**
 * Get the next healthy instance using round-robin
 * Falls back to least loaded if all are busy
 */
const getNextInstance = () => {
  const healthyInstances = HF_INSTANCES.filter((i) => i.healthy);

  if (healthyInstances.length === 0) {
    // All unhealthy - try the one with oldest lastCheck (might have recovered)
    const sorted = [...HF_INSTANCES].sort((a, b) => a.lastCheck - b.lastCheck);
    console.warn("[InstanceManager] All instances unhealthy, trying oldest:", sorted[0].name);
    return sorted[0];
  }

  // Round-robin through healthy instances
  currentIndex = (currentIndex + 1) % healthyInstances.length;
  const selected = healthyInstances[currentIndex];
  
  console.log(`[InstanceManager] Selected: ${selected.name} (${selected.activeJobs} active jobs)`);
  return selected;
};

/**
 * Get instance with least active jobs (for better distribution)
 */
const getLeastLoadedInstance = () => {
  const healthyInstances = HF_INSTANCES.filter((i) => i.healthy);
  
  if (healthyInstances.length === 0) {
    return getNextInstance(); // Fallback
  }

  const sorted = healthyInstances.sort((a, b) => a.activeJobs - b.activeJobs);
  console.log(`[InstanceManager] Least loaded: ${sorted[0].name} (${sorted[0].activeJobs} jobs)`);
  return sorted[0];
};

/**
 * Mark an instance as unhealthy
 */
const markUnhealthy = (instanceName) => {
  const instance = HF_INSTANCES.find((i) => i.name === instanceName);
  if (instance) {
    instance.healthy = false;
    instance.lastCheck = Date.now();
    console.warn(`[InstanceManager] Marked ${instanceName} as UNHEALTHY`);
  }
};

/**
 * Mark an instance as healthy
 */
const markHealthy = (instanceName) => {
  const instance = HF_INSTANCES.find((i) => i.name === instanceName);
  if (instance) {
    instance.healthy = true;
    instance.lastCheck = Date.now();
    console.log(`[InstanceManager] Marked ${instanceName} as HEALTHY`);
  }
};

/**
 * Increment active job count for an instance
 */
const incrementJobs = (instanceName) => {
  const instance = HF_INSTANCES.find((i) => i.name === instanceName);
  if (instance) {
    instance.activeJobs++;
  }
};

/**
 * Decrement active job count for an instance
 */
const decrementJobs = (instanceName) => {
  const instance = HF_INSTANCES.find((i) => i.name === instanceName);
  if (instance && instance.activeJobs > 0) {
    instance.activeJobs--;
  }
};

/**
 * Check health of all instances
 */
const healthCheckAll = async () => {
  console.log("[InstanceManager] Running health check on all instances...");

  const checks = HF_INSTANCES.map(async (instance) => {
    // Skip recently checked healthy instances
    if (instance.healthy && Date.now() - instance.lastCheck < HEALTH_CHECK_INTERVAL) {
      return;
    }

    // Skip recently marked unhealthy (cooldown period)
    if (!instance.healthy && Date.now() - instance.lastCheck < UNHEALTHY_COOLDOWN) {
      return;
    }

    try {
      const response = await axios.get(`${instance.url}/health`, {
        timeout: 10000,
      });

      if (response.status === 200) {
        markHealthy(instance.name);
      } else {
        markUnhealthy(instance.name);
      }
    } catch (error) {
      markUnhealthy(instance.name);
    }
  });

  await Promise.allSettled(checks);
};

/**
 * Get current queue/instance statistics
 */
const getInstanceStats = () => {
  const healthy = HF_INSTANCES.filter((i) => i.healthy).length;
  const total = HF_INSTANCES.length;
  const totalActiveJobs = HF_INSTANCES.reduce((sum, i) => sum + i.activeJobs, 0);
  const maxConcurrency = healthy * 3; // 3 jobs per instance

  return {
    healthyInstances: healthy,
    totalInstances: total,
    activeJobs: totalActiveJobs,
    maxConcurrency,
    isBusy: totalActiveJobs >= maxConcurrency,
    instances: HF_INSTANCES.map((i) => ({
      name: i.name,
      healthy: i.healthy,
      activeJobs: i.activeJobs,
    })),
  };
};

/**
 * Get all instances (for debugging/monitoring)
 */
const getAllInstances = () => HF_INSTANCES;

// Start periodic health checks (but don't block startup)
setInterval(healthCheckAll, HEALTH_CHECK_INTERVAL);

// Log the configured instances on startup (no blocking health check)
console.log("[InstanceManager] Configured instances:");
HF_INSTANCES.forEach(i => console.log(`  - ${i.name}: ${i.url}`));
console.log("[InstanceManager] Instances start HEALTHY, will mark unhealthy on execution failures");

module.exports = {
  getNextInstance,
  getLeastLoadedInstance,
  markUnhealthy,
  markHealthy,
  incrementJobs,
  decrementJobs,
  healthCheckAll,
  getInstanceStats,
  getAllInstances,
};
