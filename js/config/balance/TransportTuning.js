const DEFAULTS = {
  transport: {
    // Base number of internal transport iterations accumulated per tick.
    baseStepsPerTick: 1,
    // Minimum slowdown multiplier applied to conveyor movement.
    minSlowdown: 1,
    // Maximum slowdown multiplier allowed (higher values mean slower conveyors).
    maxSlowdown: 6,
    // Additional slowdown per extra conveyor tile detected in the line (beyond the first).
    lengthPenalty: 0.12,
    // Additional slowdown per branch (split) that the line makes.
    branchPenalty: 0.4,
    // Additional slowdown scaled by the current queue occupancy ratio (0..1).
    queuePenalty: 1.2,
    // Maximum number of conveyors we will scan outwards from the source.
    maxTraversal: 160,
    // Number of ticks between automatic topology recalculations.
    recalcInterval: 8,
    // Maximum number of movement iterations permitted inside a single tick.
    maxStepsPerTick: 3
  },

  buyer: {
    // Highest possible throughput multiplier (1 keeps the original amount).
    maxFactor: 1,
    // Lower bound for throughput multiplier, ensuring buyers still deliver something.
    minFactor: 0.2,
    // Each extra conveyor tile reduces throughput using: factor / (1 + lengthPenalty * (length - 1)).
    lengthPenalty: 0.18,
    // Additional reduction contributed by how full the immediate queues are.
    queuePenalty: 0.35
  },

  distribution: {
    // Weight assigned to queue occupancy when prioritising outputs.
    occupancyWeight: 0.35,
    // Weight assigned to conveyor length when prioritising outputs.
    lengthWeight: 0.65,
    // Length scaling constant to keep the normalised length in a 0..1 range.
    lengthScale: 14,
    // Negative score applied to completely empty queues to favour them strongly.
    emptyQueueBonus: 0.2
  }
};

export default DEFAULTS;
