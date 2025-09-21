// game/Factory.js
import Tile from "./Tile.js";
import EventManager from "../base/EventManager.js";
import UpgradesManager from "./UpgradesManager.js";
import AreasManager from "./AreasManager.js";
import FactorySetup from "./FactorySetup.js";
import FactoryEvent from "../config/event/FactoryEvent.js";
import BinaryArrayWriter from "/js/base/BinaryArrayWriter.js";

export default class Factory {
  constructor(meta, game) {
    this.game = game;
    this.isPaused = false;
    this.isBought = false;
    this.meta = meta;
    this.em = new EventManager(FactoryEvent, "Factory");
    this.upgradesManager = new UpgradesManager(this);
    this.tiles = [];
    this.components = [];

    // Initialize tiles
    for (let y = 0; y < meta.tilesY; y++) {
      for (let x = 0; x < meta.tilesX; x++) {
        const terrain = meta.terrains[meta.terrainMap[y * meta.tilesX + x]];
        const buildId = meta.buildMap[y * meta.tilesX + x];
        this.tiles[y * meta.tilesX + x] = new Tile(x, y, buildId, terrain, this);
      }
    }

    this.areasManager = new AreasManager(this);
  }

  reset() {
    this.tiles.forEach(tile => tile.setComponent(null));
    new FactorySetup(this).init();
  }

  getEventManager() {
    return this.em;
  }

  getUpgradesManager() {
    return this.upgradesManager;
  }

  getAreasManager() {
    return this.areasManager;
  }

  getMeta() {
    return this.meta;
  }

  setIsBought(value) {
    this.isBought = value;
  }

  getIsBought() {
    return this.isBought;
  }

  getGame() {
    return this.game;
  }

  getTiles() {
    return this.tiles;
  }

  getComponents() {
    return this.components;
  }

  getTile(x, y) {
    if (x < 0 || x >= this.meta.tilesX || y < 0 || y >= this.meta.tilesY) return null;
    return this.tiles[y * this.meta.tilesX + x];
  }

  getIsPaused() {
    return this.isPaused;
  }

  setIsPaused(value) {
    this.isPaused = value;
  }

  isOnMap(x, y, width = 1, height = 1) {
    return x >= 0 && y >= 0 && x + width <= this.meta.tilesX && y + height <= this.meta.tilesY;
  }

  isPossibleToBuildOnTypeWithSize(x, y, width = 1, height = 1, type) {
    if (!this.isOnMap(x, y, width, height)) return false;

    for (let dx = 0; dx < width; dx++) {
      for (let dy = 0; dy < height; dy++) {
        const tile = this.getTile(x + dx, y + dy);
        if (!tile || !tile.isPossibleToBuildOnType(type) || tile.getComponent()) return false;
      }
    }

    return true;
  }

  exportToWriter() {
    const writer = new BinaryArrayWriter();
    writer.writeWriter(this.upgradesManager.exportToWriter());
    writer.writeWriter(this.areasManager.exportToWriter());
    writer.writeUint8(this.isPaused ? 1 : 0);
    writer.writeUint8(this.isBought ? 1 : 0);
    writer.writeUint8(this.meta.tilesX);
    writer.writeUint8(this.meta.tilesY);

    const mainTiles = [];
    writer.writeBooleansArrayFunc(this.tiles, tile => {
      if (tile.isMainComponentContainer()) {
        mainTiles.push(tile);
        return true;
      }
      return false;
    });

    for (const tile of mainTiles) writer.writeUint8(tile.getComponent().getMeta().idNum);
    for (const tile of mainTiles) tile.exportToWriter1(writer);
    for (const tile of mainTiles) tile.exportToWriter2(writer);
    return writer;
  }

  importFromReader(reader, version) {
    console.log("Factory.importFromReader start, version:", version);
  
    this.upgradesManager.importFromReader(reader.readReader(), version);
    this.areasManager.importFromReader(reader.readReader(), version);
  
    this.isPaused = !!reader.readUint8();
    this.isBought = !!reader.readUint8();
  
    const tilesX = reader.readUint8();
    const tilesY = reader.readUint8();
  
    console.log("Loading factory size:", tilesX, tilesY);
  
    this.tiles.forEach(tile => tile.setComponent(null));
    const mainTiles = [];
    console.log("Reader position before boolean array:", reader.getPosition?.());

    reader.readBooleanArrayFunc(tilesX * tilesY, (index, value) => {
      if (value) {
        console.log("BooleanArray TRUE at", index, "-> tile coords:", Math.floor(index / tilesX), index % tilesX);
        mainTiles.push(this.tiles[Math.floor(index / tilesX) * this.meta.tilesX + (index % tilesX)]);
      } else {
        // optional: log first few falses to confirm
        if (index < 20) console.log("BooleanArray false at", index);
      }
    });
    console.log("Reader raw bytes after boolean array:", new Uint8Array(reader.getBuffer()).slice(reader.getOffset()-10, reader.getOffset()+10));

  
    console.log("Collected mainTiles:", mainTiles.length);
  
    for (const tile of mainTiles) {
      const compId = reader.readUint8();
      console.log("Assigning component", compId, "to tile", tile.x, tile.y);
      tile.setComponent(this.getGame().getMeta().componentsByIdNum[compId]);
    }
  
    for (const tile of mainTiles) {
      console.log("importFromReader1 for tile", tile.x, tile.y, tile.component?.meta?.id);
      tile.importFromReader1(reader, version);
    }
  
    for (const tile of mainTiles) {
      console.log("importFromReader2 for tile", tile.x, tile.y, tile.component?.meta?.id);
      tile.importFromReader2(reader, version);
    }
  
    this.em.invokeEvent(FactoryEvent.FACTORY_COMPONENTS_CHANGED);
    console.log("Factory.importFromReader finished.");
  }
}
