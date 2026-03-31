import Config from "/js/config/config.js";

const DEFAULT_TUNING = Config.meta.transportTuning.transport;

export default class TransportSpeedModel {
  constructor(strategy, meta) {
    this.strategy = strategy;
    this.meta = meta;
    this.factory = strategy.component.getFactory();
    this.config = DEFAULT_TUNING;
    this.progress = 0;
    this.cachedSlowdown = 1;
    this.recalcCountdown = 0;
    this.topology = {
      networkLength: 1,
      branches: 0,
    };
  }

  reset() {
    this.progress = 0;
    this.cachedSlowdown = 1;
    this.recalcCountdown = 0;
    this.topology = {
      networkLength: 1,
      branches: 0,
    };
  }

  getSlowdownFactor() {
    if (this.recalcCountdown <= 0) {
      this.topology = this._scanTopology();
      this.recalcCountdown = this.config.recalcInterval;
    }
    this.recalcCountdown--;

    const queueRatio = this._getAverageQueueFill();
    const lengthPenalty = this.config.lengthPenalty * (Math.max(1, this.topology.networkLength) - 1);
    const branchPenalty = this.config.branchPenalty * this.topology.branches;
    const queuePenalty = this.config.queuePenalty * queueRatio;

    let slowdown = this.config.minSlowdown + lengthPenalty + branchPenalty + queuePenalty;
    if (slowdown > this.config.maxSlowdown) slowdown = this.config.maxSlowdown;

    this.cachedSlowdown = slowdown;
    return slowdown;
  }

  consumeProgress(slowdown) {
    const stepsPerTick = this.config.baseStepsPerTick;
    this.progress += stepsPerTick / slowdown;
    const steps = Math.floor(Math.min(this.progress, this.config.maxStepsPerTick));
    this.progress -= steps;
    return steps;
  }

  afterTick() {
    if (this.progress > this.config.maxStepsPerTick) {
      this.progress = this.config.maxStepsPerTick;
    }
  }

  _getAverageQueueFill() {
    const queues = Object.values(this.strategy.inputQueues);
    if (!queues.length) return 0;
    let total = 0;
    for (const queue of queues) {
      total += queue.getFillRatio();
    }
    return total / queues.length;
  }

  _scanTopology() {
    const visited = new Set();
    const queue = [];
    const startTile = this.strategy.tile;
    queue.push({ tile: startTile, fromDir: null, depth: 0 });

    let maxLength = 1;
    let branches = 0;

    const maxTraversal = this.config.maxTraversal;

    while (queue.length) {
      const { tile, depth, fromDir } = queue.shift();
      const key = tile.getId();
      if (visited.has(key)) continue;
      visited.add(key);

      if (depth > maxLength) maxLength = depth;

      const component = tile.getComponent();
      if (!component || component.getMeta().strategy.type !== "transport") continue;

      const io = tile.getInputOutputManager();
      const possibleDirs = ["top", "right", "bottom", "left"];
      let branchCount = 0;

      for (const dir of possibleDirs) {
        const neighbor = io.getOutputsByDirection()[dir];
        if (!neighbor) continue;
        const neighborComp = neighbor.getComponent();
        if (!neighborComp || neighborComp.getMeta().strategy.type !== "transport") continue;

        if (fromDir && dir === fromDir) continue;

        queue.push({ tile: neighbor, fromDir: this._opposite(dir), depth: depth + 1 });
        branchCount++;
        if (queue.length > maxTraversal) break;
      }

      if (branchCount > 1) branches += branchCount - 1;
      if (queue.length > maxTraversal) break;
    }

    return {
      networkLength: Math.min(maxLength, maxTraversal),
      branches,
    };
  }

  _opposite(dir) {
    switch (dir) {
      case "top": return "bottom";
      case "bottom": return "top";
      case "left": return "right";
      case "right": return "left";
      default: return null;
    }
  }
}

