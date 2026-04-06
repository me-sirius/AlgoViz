const axios = require("axios");
// --- Configuration ---
const PISTON_API = "https://emkc.org/api/v2/piston/execute";
const PISTON_LANGUAGE_MAP = {
  javascript: { language: "javascript", version: "18.15.0" },
  typescript: { language: "typescript", version: "5.0.3" },
  python: { language: "python", version: "3.10.0" },
  java: { language: "java", version: "15.0.2" },
  "c++": { language: "c++", version: "10.2.0" },
  cpp: { language: "c++", version: "10.2.0" },
  c: { language: "c", version: "10.2.0" },
  go: { language: "go", version: "1.16.2" },
};

// --- PISTON FAST QUEUE IMPLEMENTATION  ---
// This class manages a queue of requests to Piston with controlled rate limiting and retry on 429 errors.
class PistonFastQueue {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
    this.isPaused = false;
    this.gap = 400; // GAP: 400ms = ~2.5 requests per second (Safe limit is usually 5)
    this.errorHitGap = 500; // 0.5 second pause on 429
  }

  add(language, code, input, timeLimit, memoryLimitMB) {
    console.log("code : ", code);
    return new Promise((resolve, reject) => {
      this.queue.push({
        payload: { language, code, input, timeLimit, memoryLimitMB },
        resolve,
        reject,
        attempt: 1,
      });

      if (!this.isProcessing) { // false
        this.processQueue();
      }
    });
  }

  async processQueue() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    while (this.queue.length > 0) {
      // 1. Check for Pauses (if a 429 happened recently)
      if (this.isPaused) {
        await new Promise((r) => setTimeout(r, this.gap / 4)); // Check again soon
        continue;
      }

      // 2. Get next item
      const item = this.queue.shift();

      // 3. FIRE THE REQUEST
      // ⚠️ Notice: We do NOT use 'await' here.
      // We start the axios call and immediately move to the next line.
      this.executeItem(item);

      // 4. WAIT THE GAP
      // We only wait for {gap} ms before looping back to fire the next one.
      await new Promise((r) => setTimeout(r, this.gap));
    }

    this.isProcessing = false;
  }

  async executeItem(item) {
    const languageConfig =
      PISTON_LANGUAGE_MAP[item.payload.language] ||
      PISTON_LANGUAGE_MAP["javascript"];

    const payload = {
      language: languageConfig.language,
      version: languageConfig.version,
      files: [{ content: item.payload.code }],
      stdin: item.payload.input || "",
      run_timeout: item.payload.timeLimit,
      //   run_memory_limit: item.payload.memoryLimitMB * 1024 * 1024,
      run_memory_limit: -1,
    };

    try {
      console.log("paytload : ", payload)
      const response = await axios.post(PISTON_API, payload);
      // Resolve the original promise so your Controller knows this specific test case is done
      console.log("response : ", response.data);
      item.resolve(response.data);
    } catch (error) {
      if (
        error.response &&
        error.response.status === 429 &&
        item.attempt <= 3
      ) {
        console.log(
          `🛑 429 Hit on attempt ${item.attempt}. Pausing Queue for ${this.errorHitGap}...`
        );

        // PAUSE NEW REQUESTS
        this.isPaused = true;

        // Retry this item later (put back at front)
        item.attempt++;
        this.queue.unshift(item);

        // Resume after errorHitGap seconds
        setTimeout(() => {
          console.log("🟢 Resuming queue...");
          this.isPaused = false;
        }, this.errorHitGap);
      } else {
        item.reject(error);
      }
    }
  }
}
// Global Instance
const pistonQueue = new PistonFastQueue();
module.exports = pistonQueue;
