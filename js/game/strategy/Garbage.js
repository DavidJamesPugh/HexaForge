import DelayedAction from "./helper/DelayedAction.js";

export default class Garbage {
  constructor(component, meta) {
    this.component = component;
    this.meta = meta;
    this.game = component.getFactory().getGame();
    this.noOfItems = 0;
    this.inputTileIndex = 0;
    this.removeAmount = 0;
    this.producer = new DelayedAction(meta.interval);
    this.producer.canStart = this.canRemove.bind(this);
    this.producer.start = this.startRemoval.bind(this);
    this.producer.finished = this.finishRemoval.bind(this);
  }

  clearContents() {
    this.noOfItems = 0;
    this.inputTileIndex = 0;
    this.removeAmount = 0;
    this.producer.reset();
  }

  getMax() {
    return Garbage.getMetaMax(this.component.getMeta(), this.component.getFactory());
  }

  static getMetaMax(meta, factory) {
    return meta.strategy.max * factory.getUpgradesManager().getComponentBonuses(meta.id).maxStorageBonus;
  }

  getRemoveAmount() {
    return Garbage.getMetaRemoveAmount(this.component.getMeta(), this.component.getFactory());
  }

  static getMetaRemoveAmount(meta, factory) {
    return meta.strategy.removeAmount * factory.getUpgradesManager().getComponentBonuses(meta.id).removeAmountBonus;
  }

  takeIn() {
    const tiles = this.component.getSurroundedInputTiles();
    let index = this.inputTileIndex;

    for (let i = 0; i < tiles.length; i++) {
      const t = tiles[(index + i) % tiles.length];
      const q = t.tile.getComponent().getStrategy().getOutputQueue(t.direction);
      if (q.getLast() && this.noOfItems < this.getMax()) {
        q.unsetLast();
        index = (index + i + 1) % tiles.length;
        this.noOfItems++;
      }
      q.forward();
    }

    this.inputTileIndex = index;
  }

  canRemove() {
    return this.noOfItems >= this.getRemoveAmount();
  }

  startRemoval() {
    this.removeAmount = Math.min(this.noOfItems, this.getRemoveAmount());
  }

  finishRemoval() {
    this.noOfItems -= this.removeAmount;
    this.removeAmount = 0;
  }

  calculateInputTick() {
    this.takeIn();
    if (!this.component.isPaused()) {
      this.producer.calculate();
    }
  }

  getDescriptionData() {
    const data = Garbage.getMetaDescriptionData(this.component.getMeta(), this.component.getFactory(), this);
    data.noOfItems = this.noOfItems;
    this.producer.updateWithDescriptionData(data);
    return data;
  }

  static getMetaDescriptionData(meta, factory, instance) {
    return {
      interval: meta.strategy.interval,
      removeAmount: Garbage.getMetaRemoveAmount(meta, factory),
      max: instance ? instance.getMax() : Garbage.getMetaMax(meta, factory)
    };
  }

  toString() {
    let str = `No of items: ${this.noOfItems}<br />${this.producer.toString()}`;
    if (this.removeAmount > 0) str += `Removing ${this.removeAmount} items`;
    return str + "<br />";
  }

  exportToWriter(writer) {
    writer.writeUint32(this.noOfItems);
    writer.writeUint8(this.inputTileIndex);
    writer.writeUint32(this.removeAmount);
    this.producer.exportToWriter(writer);
  }

  importFromReader(reader) {
    this.noOfItems = reader.readUint32();
    this.inputTileIndex = reader.readUint8();
    this.removeAmount = reader.readUint32();
    this.producer.importFromReader(reader);
  }
}
