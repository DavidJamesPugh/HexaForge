/**
 * Grid footprint for multi-tile components. When `occupiedCells` is omitted,
 * a full rectangle of `width` × `height` is used (legacy behavior).
 *
 * `occupiedCells` is an array of [dx, dy] or { dx, dy } relative to the
 * placement anchor (top-left of the bounding box). Example L (3 cells):
 *   occupiedCells: [[0, 0], [1, 0], [1, 1]]
 * A "donut" is any set of cells with holes — omit inner coordinates.
 */
const CARDINAL = ["top", "right", "bottom", "left"];

const DELTA = {
  top: [0, -1],
  right: [1, 0],
  bottom: [0, 1],
  left: [-1, 0],
};

export default class ComponentFootprint {
  static CARDINAL = CARDINAL;
  static DELTA = DELTA;

  static ensurePrepared(meta) {
    if (meta._footprintPrepared) return meta;

    let cells = meta.occupiedCells;
    if (!cells || !Array.isArray(cells) || cells.length === 0) {
      cells = [];
      const w = meta.width ?? 1;
      const h = meta.height ?? 1;
      for (let dx = 0; dx < w; dx++) {
        for (let dy = 0; dy < h; dy++) {
          cells.push({ dx, dy });
        }
      }
    } else {
      cells = cells.map((o) =>
        Array.isArray(o) ? { dx: o[0], dy: o[1] } : { dx: o.dx, dy: o.dy }
      );
    }

    meta.occupiedCells = cells;
    let maxDx = 0;
    let maxDy = 0;
    for (const { dx, dy } of cells) {
      maxDx = Math.max(maxDx, dx);
      maxDy = Math.max(maxDy, dy);
    }
    meta.footprintWidth = maxDx + 1;
    meta.footprintHeight = maxDy + 1;
    meta._footprintPrepared = true;
    return meta;
  }

  static eachOccupied(anchorX, anchorY, meta, fn) {
    ComponentFootprint.ensurePrepared(meta);
    for (const { dx, dy } of meta.occupiedCells) {
      fn(anchorX + dx, anchorY + dy, dx, dy);
    }
  }

  /** True if world cell (gx, gy) is part of this component at anchor. */
  static containsCell(anchorX, anchorY, meta, gx, gy) {
    ComponentFootprint.ensurePrepared(meta);
    const dx = gx - anchorX;
    const dy = gy - anchorY;
    return meta.occupiedCells.some((c) => c.dx === dx && c.dy === dy);
  }
}
