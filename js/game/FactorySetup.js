import BuyComponentAction from "./action/BuyComponentAction.js";
import UpdateComponentInputOutputAction from "./action/UpdateComponentInputOutputAction.js";

export default class FactorySetup {
  constructor(factory) {
    this.factory = factory;
    this.factoryMeta = factory.getMeta();
    this.gameMeta = factory.getGame().getMeta();
  }

  init() {
    this._initComponents();
    this._initTransportLines();
    return this;
  }

  _initComponents() {
    if (!this.factoryMeta.startComponents) return;

    for (const start of this.factoryMeta.startComponents) {
      const tile = this.factory.getTile(start.x, start.y);
      new BuyComponentAction(tile, this.gameMeta.componentsById[start.id]).buyFree();
    }
  }

  _initTransportLines() {
    if (!this.factoryMeta.transportLineConnections) return;

    for (const conn of this.factoryMeta.transportLineConnections) {
      const fromTile = this.factory.getTile(conn.fromX, conn.fromY);
      const toTile = this.factory.getTile(conn.toX, conn.toY);
      const action = new UpdateComponentInputOutputAction(fromTile, toTile);
      if (action.canUpdate()) action.update();
    }
  }
}
