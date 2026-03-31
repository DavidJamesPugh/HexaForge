import Package from "./Package.js";

export default class TransportStackingQueue {
  constructor(size, tile) {
    this.queue = new Array(size).fill(undefined);
    this.tile = tile;
  }

  reset() {
    this.queue.fill(undefined);
  }

  forward() {
    for (let i = this.queue.length - 2; i >= 0; i--) {
      if (!this.queue[i + 1]) {
        this.queue[i + 1] = this.queue[i];
        this.queue[i] = undefined;
      }
    }
  }

  setFirst(item) { this.queue[0] = item; }
  unsetFirst() { this.setFirst(undefined); }
  setLast(item) { this.queue[this.queue.length - 1] = item; }
  unsetLast() { this.setLast(undefined); }
  getFirst() { return this.queue[0]; }
  getLast() { return this.queue[this.queue.length - 1]; }
  getQueue() { return this.queue; }
  get(index) { return this.queue[index]; }
  set(index, item) { this.queue[index] = item ?? undefined; }
  getLength() { return this.queue.length; }
  getFillRatio() {
    const length = this.queue.length;
    if (!length) return 0;
    let filled = 0;
    for (const item of this.queue) if (item) filled++;
    return filled / length;
  }
  toString() { return this.queue.join(","); }

  exportToWriter(writer) {
    for (const item of this.queue) {
      Package.staticExportData(item, writer);
    }
  }

  importFromReader(reader) {
    for (let i = 0; i < this.queue.length; i++) {
      this.set(i, Package.createFromExport(this.tile.getFactory(), reader));
    }
  }
}
