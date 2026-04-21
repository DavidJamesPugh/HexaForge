import StrategyFactory from "./strategy/Factory.js";
import numberFormat from "/js/base/NumberFormat.js";
import ComponentFootprint from "./ComponentFootprint.js";
import DirectNeighborTransfer from "./strategy/helper/DirectNeighborTransfer.js";

export default class Component {
  constructor(factory, x, y, meta) {
    this.meta = meta;
    this.factory = factory;
    this.x = x;
    this.y = y;
    this.strategy = StrategyFactory.getForComponent(this);
    this.surroundedInputTiles = [];
    this.surroundedOutputTiles = [];
    this._isPaused = false;
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

  _updateSurroundedTilesCache() {
    this.surroundedInputTiles = [];
    this.surroundedOutputTiles = [];
    const meta = ComponentFootprint.ensurePrepared(this.meta);
    const ax = this.x;
    const ay = this.y;
    const occRel = new Set(meta.occupiedCells.map((c) => `${c.dx},${c.dy}`));
    const isSameShapeCell = (gx, gy) => occRel.has(`${gx - ax},${gy - ay}`);

    ComponentFootprint.eachOccupied(ax, ay, meta, (wx, wy) => {
      const tile = this.factory.getTile(wx, wy);
      if (!tile) return;

      for (const dir of ComponentFootprint.CARDINAL) {
        const [dx, dy] = ComponentFootprint.DELTA[dir];
        const nx = wx + dx;
        const ny = wy + dy;
        if (isSameShapeCell(nx, ny)) continue;

        const neighborTile = this.factory.getTile(nx, ny);
        if (!neighborTile) continue;

        const nComp = neighborTile.getComponent();
        const myComp = tile.getComponent();

        const outLinked = tile.getInputOutputManager().getOutputsByDirection()[dir];
        if (outLinked && outLinked.getId() === neighborTile.getId()) {
          this.surroundedOutputTiles.push({
            tile: outLinked,
            from: tile,
            direction: tile.getDirection(outLinked),
            oppositeDirection: outLinked.getDirection(tile),
            directEdge: false,
          });
        } else if (
          nComp &&
          nComp !== myComp &&
          DirectNeighborTransfer.canDirectEdgeOutput(nComp.getMeta())
        ) {
          this.surroundedOutputTiles.push({
            tile: neighborTile,
            from: tile,
            direction: tile.getDirection(neighborTile),
            oppositeDirection: neighborTile.getDirection(tile),
            directEdge: true,
          });
        }

        const inLinked = tile.getInputOutputManager().getInputsByDirection()[dir];
        if (inLinked && inLinked.getId() === neighborTile.getId()) {
          this.surroundedInputTiles.push({
            tile: inLinked,
            from: tile,
            direction: inLinked.getDirection(tile),
            oppositeDirection: tile.getDirection(inLinked),
            directEdge: false,
          });
        } else if (
          nComp &&
          nComp !== myComp &&
          DirectNeighborTransfer.canDirectEdgeInputSource(nComp.getMeta())
        ) {
          this.surroundedInputTiles.push({
            tile: neighborTile,
            from: tile,
            direction: neighborTile.getDirection(tile),
            oppositeDirection: tile.getDirection(neighborTile),
            directEdge: true,
          });
        }
      }
    });
  }

  /**
   * Recompute direct / conveyor adjacency only (no inventory reset).
   * Call when a neighbor building is placed or removed so edge lists stay in sync.
   */
  refreshEdgeCaches() {
    this._updateSurroundedTilesCache();
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
    if (this.isPaused()) return;
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
    writer.writeUint8(this._isPaused ? 1 : 0);
    this.strategy.exportToWriter(writer);
  }

  importFromReader(reader, version) {
    this._isPaused = !!reader.readUint8();
    this.strategy.importFromReader(reader, version);
  }

  isPaused() {
    return this._isPaused;
  }

  setPaused(value) {
    if (this.meta.strategy.type === "transport") return;
    if (this._isPaused === value) return;
    this._isPaused = value;
    
  }

  togglePaused() {
    this.setPaused(!this._isPaused);
  }
}
