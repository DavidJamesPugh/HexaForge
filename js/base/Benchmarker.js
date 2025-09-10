// Benchmarker.js
import logger from "./Logger.js";

export default class Benchmarker {
    name;
    timeSpent = 0;
    count = 0;
    weightSum = 0;
    lastStartTime = null;
    firstStartTime = null;
    interval = null;
    intervalValue = 2000; // 2 seconds

    constructor(name) {
        this.name = name;
    }

    init() {
        this.firstStartTime = Date.now();
        this.interval = setInterval(() => {
            const now = Date.now();
            const elapsed = now - this.firstStartTime;
            const avgRunTime = this.weightSum ? Math.round((this.timeSpent / this.weightSum) * 10) / 10 : 0;
            const cpuUsage = Math.round((100 * this.timeSpent / elapsed) * 100) / 100;

            logger.info(
                `Bench:${this.name}`,
                `AVG: ${this.timeSpent}ms / ${elapsed}ms (Runs: ${this.weightSum}, Avg run time: ${avgRunTime}ms) CPU time spent: ${cpuUsage}%`
            );

            // reset counters
            this.timeSpent = 0;
            this.count = 0;
            this.weightSum = 0;
            this.firstStartTime = Date.now();
        }, this.intervalValue);
    }

    destroy() {
        if (this.interval) clearInterval(this.interval);
    }

    start() {
        this.lastStartTime = Date.now();
    }

    stop(weight = 1) {
        if (!this.lastStartTime) return;
        this.timeSpent += Date.now() - this.lastStartTime;
        this.count++;
        this.weightSum += weight;
    }
}
