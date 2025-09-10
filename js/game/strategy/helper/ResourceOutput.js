import Package from "./Package.js";

export default class ResourceOutput {
  constructor(component, handledResources, outputResourcesOrder) {
    this.component = component;
    this.handledResources = handledResources;
    this.outputResourcesOrder = outputResourcesOrder;
    this.reset();
  }

  reset() {
    this.resources = {};
    for (const resId of this.outputResourcesOrder) this.resources[resId] = 0;
    this.outResourceSelectionIndex = 0;
    this.distributeTileIndex = 0;
  }

  updateWithDescriptionData(desc) {
    desc.stock ||= [];
    const resourcesMeta = this.component.getFactory().getGame().getMeta().resourcesById;
    for (const id in this.resources) {
      desc.stock.push({
        resourceId: id,
        resourceName: resourcesMeta[id].nameShort,
        amount: this.resources[id],
        max: this.getMax(id),
      });
    }
  }

  getMax(resId) {
    const meta = this.component.getMeta();
    const bonuses = this.component
      .getFactory()
      .getUpgradesManager()
      .getComponentBonuses(meta.applyUpgradesFrom ?? meta.id);
    return this.handledResources[resId].max * bonuses.maxStorageBonus;
  }

  static getMetaOutputAmount(meta, factory) {
    return 1 + factory.getUpgradesManager().getBonuses().packageSizeBonus +
      factory.getUpgradesManager().getComponentBonuses(meta.id).packageSizeBonus;
  }

  getOutputAmount() {
    return ResourceOutput.getMetaOutputAmount(this.component.getMeta(), this.component.getFactory());
  }

  distribute() {
    const tiles = this.component.getSurroundedOutputTiles();
    for (let i = 0; i < tiles.length; i++) {
      const resourceId = this._getNextOutputResource();
      if (!resourceId) break;

      const tileInfo = tiles[this.distributeTileIndex];
      this.distributeTileIndex = (this.distributeTileIndex + 1) % tiles.length;

      const inputQueue = tileInfo.tile.getComponent().getStrategy().getInputQueue(tileInfo.oppositeDirection);
      if (!inputQueue.getFirst()) {
        const amount = this.getOutputAmount();
        inputQueue.setFirst(new Package(resourceId, amount, this.component.getFactory()));
        this.resources[resourceId] -= amount;
        this.outResourceSelectionIndex = (this.outResourceSelectionIndex + 1) % this.outputResourcesOrder.length;
      }
    }
  }

  _getNextOutputResource() {
    for (let i = 0; i < this.outputResourcesOrder.length; i++) {
      const resId = this.outputResourcesOrder[(this.outResourceSelectionIndex + i) % this.outputResourcesOrder.length];
      if (this.resources[resId] >= this.getOutputAmount()) return resId;
    }
    this.outResourceSelectionIndex = 0;
    return null;
  }

  addResource(resId, amount) {
    this.resources[resId] += amount;
  }

  getResource(resId) {
    return this.resources[resId];
  }

  toString() {
    let str = `OUT outIndex:${this.distributeTileIndex} resIndex:${this.outResourceSelectionIndex}<br />`;
    for (const resId in this.resources) str += `${resId}: ${this.resources[resId]}<br />`;
    return str;
  }

  exportToWriter(writer) {
    const count = Object.keys(this.resources).length;
    writer.writeUint8(count);
    for (const resId in this.resources) writer.writeUint32(this.resources[resId]);
    writer.writeUint8(this.outResourceSelectionIndex);
    writer.writeUint8(this.distributeTileIndex);
  }

  importFromReader(reader) {
    const count = reader.readUint8();
    const keys = Object.keys(this.resources);
    for (let i = 0; i < count; i++) {
      this.resources[keys[i]] = reader.readUint32();
    }
    this.outResourceSelectionIndex = reader.readUint8();
    this.distributeTileIndex = reader.readUint8();
  }
}
