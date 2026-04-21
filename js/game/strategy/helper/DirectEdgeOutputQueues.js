import TransportStackingQueue from "./TransportStackingQueue.js";

const DIR_ORDER = ["top", "right", "bottom", "left"];

/**
 * One package slot per (tile, outward direction) so multi-tile buildings
 * can feed several neighbors without sharing one queue.
 */
export default class DirectEdgeOutputQueues {
  constructor() {
    this._map = new Map();
  }

  get(edgeTile, dir) {
    const k = `${edgeTile.getX()}:${edgeTile.getY()}:${dir}`;
    if (!this._map.has(k)) {
      this._map.set(k, new TransportStackingQueue(1, edgeTile));
    }
    return this._map.get(k);
  }

  reset() {
    for (const q of this._map.values()) {
      q.reset();
    }
    this._map.clear();
  }

  exportToWriter(writer) {
    const entries = [...this._map.entries()].sort(([a], [b]) => a.localeCompare(b));
    writer.writeUint16(entries.length);
    for (const [k, q] of entries) {
      const [xs, ys, d] = k.split(":");
      writer.writeUint8(Number(xs));
      writer.writeUint8(Number(ys));
      writer.writeUint8(DIR_ORDER.indexOf(d));
      q.exportToWriter(writer);
    }
  }

  importFromReaderV10(reader, factory) {
    this.reset();
    const n = reader.readUint16();
    for (let i = 0; i < n; i++) {
      const x = reader.readUint8();
      const y = reader.readUint8();
      const d = DIR_ORDER[reader.readUint8()] ?? "top";
      const tile = factory.getTile(x, y);
      if (!tile) continue;
      this.get(tile, d).importFromReader(reader);
    }
  }

  /**
   * Save format v9: four queues on main tile only (direction order top,right,bottom,left).
   */
  importLegacyV9(reader, mainTile) {
    this.reset();
    for (const d of DIR_ORDER) {
      this.get(mainTile, d).importFromReader(reader);
    }
  }
}
