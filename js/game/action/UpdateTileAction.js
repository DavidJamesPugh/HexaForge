// src/game/action/UpdateTileAction.js
import Tile from "../Tile.js";
import FactoryEvent from "../../config/event/FactoryEvent.js";

class UpdateTileAction {
  constructor(tile, toolId) {
    this.tile = tile;
    this.factory = tile.getFactory();
    this.toolId = toolId;
  }

  canUpdate() {
    return Boolean(this.toolId);
  }

  update() {
    if (!this.toolId) return;

    const [type, value] = this.toolId.split("-");

    if (type === "terrain") {
      this.tile.setTerrain(value);

      if (this.tile.getFactory().getMeta().buildableTerrains[value]) {
        this.tile.setBuildableType(Tile.BUILDABLE_YES);
      } else {
        this.tile.setBuildableType(Tile.BUILDABLE_NO);
      }
    } else if (type === "buildable" && value === "road") {
      this.tile.setBuildableType(Tile.BUILDABLE_PARTIAL);
    }

    this.factory.getEventManager().invokeEvent(FactoryEvent.TILE_TYPE_CHANGED, this.tile);
  }
}

export default UpdateTileAction;
