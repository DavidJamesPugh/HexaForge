import StrategyFactory from "./strategy/Factory.js";
import numberFormat from "/js/base/NumberFormat.js";

export default class Component {
  constructor(factory, x, y, meta) {
    this.meta = meta;
    this.factory = factory;
    this.x = x;
    this.y = y;
    this.strategy = StrategyFactory.getForComponent(this);
    this.surroundedInputTiles = [];
    this.surroundedOutputTiles = [];
  }

  static getMetaDescriptionData(meta, factory, strategy) {
    const data = StrategyFactory.getMetaDescriptionData(meta, factory, strategy);
    this._addCommonMetaDescriptionData(data, meta, factory, strategy);
    return data;
  }

  getDescriptionData() {
    const data = this.strategy.getDescriptionData();
    Component._addCommonMetaDescriptionData(data, this.meta, this.factory, this.strategy);
    return data;
  }

  static _addCommonMetaDescriptionData(data, meta, factory, strategy) {
    data.name = meta.name;
    data["is" + meta.strategy.type.charAt(0).toUpperCase() + meta.strategy.type.slice(1)] = true;
    data.description = meta.description;
    data.priceStr = "$" + numberFormat.formatNumber(meta.price);
    if (meta.runningCostPerTick) {
      data.runningCostStr = "$" + numberFormat.formatNumber(this.getMetaRunningCostPerTick(meta, factory)) + "/tick";
    }
  }

  static getMetaRunningCostPerTick(meta, factory) {
    const bonuses = factory.getUpgradesManager().getComponentBonuses(meta.applyUpgradesFrom ?? meta.id);
    return meta.runningCostPerTick * bonuses.runningCostPerTickIncrease * bonuses.runningCostPerTickBonus * factory.getGame().getProfitMultiplier();
  }

  getRunningCostPerTick() {
    return Component.getMetaRunningCostPerTick(this.meta, this.factory);
  }

  _checkForSurroundedInputsOutputs(x, y, direction) {
    const tile = this.factory.getTile(x, y);
    const outputs = tile.getInputOutputManager().getOutputsByDirection()[direction];
    if (outputs) {
      this.surroundedOutputTiles.push({
        tile: outputs,
        from: tile,
        direction: tile.getDirection(outputs),
        oppositeDirection: outputs.getDirection(tile),
      });
    }
    const inputs = tile.getInputOutputManager().getInputsByDirection()[direction];
    if (inputs) {
      this.surroundedInputTiles.push({
        tile: inputs,
        from: tile,
        direction: inputs.getDirection(tile),
        oppositeDirection: tile.getDirection(inputs),
      });
    }
  }

  _updateSurroundedTilesCache() {
    this.surroundedInputTiles = [];
    this.surroundedOutputTiles = [];
    for (let x = this.x; x < this.x + this.meta.width; x++) this._checkForSurroundedInputsOutputs(x, this.y, "top");
    for (let y = this.y; y < this.y + this.meta.height; y++) this._checkForSurroundedInputsOutputs(this.x + this.meta.width - 1, y, "right");
    for (let x = this.x + this.meta.width - 1; x >= this.x; x--) this._checkForSurroundedInputsOutputs(x, this.y + this.meta.height - 1, "bottom");
    for (let y = this.y + this.meta.height - 1; y >= this.y; y--) this._checkForSurroundedInputsOutputs(this.x, y, "left");
  }

  outputsInputsChanged() {
    this._updateSurroundedTilesCache();
    this.getStrategy().clearContents();
    if (this.getStrategy().updateInputsOutputs) this.getStrategy().updateInputsOutputs();
  }

  getSurroundedInputTiles() {
    return this.surroundedInputTiles;
  }

  getSurroundedOutputTiles() {
    return this.surroundedOutputTiles;
  }

  calculateInputTick(e) {
    if (this.meta.runningCostPerTick > 0) e.runningCosts += this.getRunningCostPerTick();
  }

  getFactory() {
    return this.factory;
  }

  getMeta() {
    return this.meta;
  }

  getStrategy() {
    return this.strategy;
  }

  getX() {
    return this.x;
  }

  getY() {
    return this.y;
  }

  getMainTile() {
    return this.factory.getTile(this.x, this.y);
  }

  exportToWriter(writer) {
    this.strategy.exportToWriter(writer);
  }

  importFromReader(reader, version) {
    this.strategy.importFromReader(reader, version);
  }
}
