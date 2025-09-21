import FactoryEvent from "../../config/event/FactoryEvent.js";

export default class UpdateComponentInputOutputAction {
  constructor(fromTile, toTile) {
    this.fromTile = fromTile;
    this.toTile = toTile;
    this.factory = fromTile.getFactory();
  }

  canUpdate() {
    const fromComp = this.fromTile.getComponent();
    const toComp = this.toTile.getComponent();

    if (!fromComp || !toComp || fromComp === toComp || !this.fromTile.getDirection(this.toTile)) {
      return false;
    }

    const fromMeta = fromComp.getMeta();
    const toMeta = toComp.getMeta();

    return (
      (fromMeta.strategy.type === "transport" || toMeta.strategy.type === "transport") &&
      this._isLinkAllowed(this.fromTile, this.toTile, fromMeta.allowedOutputs) &&
      this._isLinkAllowed(this.toTile, this.fromTile, toMeta.allowedInputs) &&
      !this._detectLoop(this.fromTile, this.toTile)
    );
  }

  _isLinkAllowed(tileA, tileB, allowed) {
    if (!allowed) return true;
    const dir = tileA.getDirection(tileB);
    const r = tileA.getX() - tileA.getComponent().getX();
    const o = tileA.getY() - tileA.getComponent().getY();
    return allowed[`${r}:${o}`] || allowed[`${r}:${o}:${dir}`];
  }

  _detectLoop(startTile, currentTile) {
    const check = (tile, depth = 0) => {
      if (tile.getComponent().getMeta().strategy.type !== "transport") return false;
      if (tile.getId() === startTile.getId() && depth > 0) return true;

      for (const outputTile of tile.getInputOutputManager().getOutputsList()) {
        if (check(outputTile, depth + 1)) return true;
      }
      return false;
    };

    return check(currentTile, 0);
  }

  update() {
    console.log(
      "from:", this.fromTile.getId(),
      "to:", this.toTile.getId(),
      "dir:", this.fromTile.getDirection(this.toTile)
    );
    
    this.fromTile.getInputOutputManager().setOutput(this.fromTile.getDirection(this.toTile));
    this.factory.getEventManager().invokeEvent(
      FactoryEvent.FACTORY_COMPONENTS_CHANGED,
      this.fromTile
    );
  }
}
