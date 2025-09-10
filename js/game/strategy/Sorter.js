import ResourceIntake from "./helper/ResourceIntake.js";
import ResourceOutput from "./helper/ResourceOutput.js";
import DelayedAction from "./helper/DelayedAction.js";
import Package from "./helper/Package.js";

export default class Sorter {
  constructor(component, meta) {
    this.component = component;
    this.meta = meta;
    this.inputTileIndex = 0;
    this.inItem = null;
    this.inSortingItem = null;
    this.outItem = null;
    this.distributeTileIndexes = { default: 0 };
    this.sortingIndex = {};
    for (const i in this.component.getMeta().allowedOutputs) this.sortingIndex[i] = null;

    this.producer = new DelayedAction(meta.interval);
    this.producer.canStart = this.canStartSorting.bind(this);
    this.producer.start = this.startSorting.bind(this);
    this.producer.finished = this.finishedSorting.bind(this);
  }

  clearContents() {
    this.inputTileIndex = 0;
    this.inItem = null;
    this.inSortingItem = null;
    this.outItem = null;
    this.distributeTileIndexes = { default: 0 };
    for (const key in this.sortingIndex) this.sortingIndex[key] && (this.distributeTileIndexes[this.sortingIndex[key]] = 0);
    this.producer.reset();
  }

  calculateInputTick() {
    if (!this.inItem) {
      const tiles = this.component.getSurroundedInputTiles();
      let index = this.inputTileIndex;

      for (let i = 0; i < tiles.length; i++) {
        const t = tiles[(index + i) % tiles.length];
        const q = t.tile.getComponent().getStrategy().getOutputQueue(t.direction);
        const item = q.getLast();
        if (item && !this.inItem) {
          q.unsetLast();
          index = (index + i + 1) % tiles.length;
          this.inItem = item;
        }
        q.forward();
      }

      this.inputTileIndex = index;
    }
  }

  calculateOutputTick() {
    this.producer.calculate();
    this.moveItemOut();
  }

  canStartSorting() {
    return this.inItem && !this.outItem;
  }

  startSorting() {
    this.inSortingItem = this.inItem;
    this.inItem = null;
  }

  finishedSorting() {
    this.outItem = this.inSortingItem;
    this.inSortingItem = null;
    this.moveItemOut();
  }

  moveItemOut() {
    if (!this.outItem) return;
    let res = this.outItem.getResourceId();
    if (this.distributeTileIndexes[res] === undefined) res = "default";

    const tiles = this.component.getSurroundedOutputTiles();
    for (let i = 0; i < tiles.length; i++) {
      const t = tiles[this.distributeTileIndexes[res]];
      this.distributeTileIndexes[res] = (this.distributeTileIndexes[res] + 1) % tiles.length;

      const r = t.from.getX() - this.component.getX();
      const o = t.from.getY() - this.component.getY();
      const sortRule = this.sortingIndex[r + ":" + o];

      if (!((sortRule && sortRule !== this.outItem.getResourceId()) || (!sortRule && this.distributeTileIndexes[this.outItem.getResourceId()] !== undefined))) {
        const inputQ = t.tile.getComponent().getStrategy().getInputQueue(t.oppositeDirection);
        if (!inputQ.getFirst()) {
          inputQ.setFirst(this.outItem);
          this.outItem = null;
          break;
        }
      }
    }
  }

  setSortingResource(x, y, resourceId) {
    this.sortingIndex[x + ":" + y] = resourceId;
    this.clearContents();
  }

  getSortingResource(x, y) {
    return this.sortingIndex[x + ":" + y];
  }

  toString() {
    let str = `Next: ${this.inItem ? this.inItem.getResourceId() : "-"}<br />`;
    str += `Sorting: ${this.inSortingItem ? this.inSortingItem.getResourceId() : "-"}<br />`;
    str += `Out: ${this.outItem ? this.outItem.getResourceId() : "-"}<br />`;
    str += this.producer.toString() + "<br />";
    str += "Sort rules:<br />";
    for (const key in this.sortingIndex) str += `${key}: ${this.sortingIndex[key]}<br />`;
    str += `<br />Input index: ${this.inputTileIndex}<br />Out indexes:<br />`;
    for (const key in this.distributeTileIndexes) str += `${key}: ${this.distributeTileIndexes[key]}<br />`;
    return str;
  }

  exportToWriter(writer) {
    writer.writeUint8(this.inputTileIndex);
    Package.staticExportData(this.inItem, writer);
    Package.staticExportData(this.inSortingItem, writer);
    Package.staticExportData(this.outItem, writer);
    writer.writeUint8(this.distributeTileIndexes.default);

    for (const key in this.sortingIndex) {
      const res = this.sortingIndex[key];
      let r = 0, o = 0;
      if (res) {
        r = this.component.getFactory().getGame().getMeta().resourcesById[res].idNum;
        o = this.distributeTileIndexes[res];
      }
      writer.writeUint8(r);
      writer.writeUint8(o);
    }

    this.producer.exportToWriter(writer);
  }

  importFromReader(reader) {
    this.inputTileIndex = reader.readUint8();
    this.inItem = Package.createFromExport(this.component.getFactory(), reader);
    this.inSortingItem = Package.createFromExport(this.component.getFactory(), reader);
    this.outItem = Package.createFromExport(this.component.getFactory(), reader);

    this.distributeTileIndexes = { default: reader.readUint8() };

    for (const key in this.sortingIndex) {
      const r = reader.readUint8();
      this.sortingIndex[key] = r ? this.component.getFactory().getGame().getMeta().resourcesByIdNum[r].id : null;
      if (this.sortingIndex[key]) this.distributeTileIndexes[this.sortingIndex[key]] = reader.readUint8();
    }

    this.producer.importFromReader(reader);
  }
}
