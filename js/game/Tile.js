import InputOutputManager from "./InputOutputManager.js";
import Component from "./Component.js";

const DIRECTIONS = {
  top: [0, -1],
  right: [1, 0],
  bottom: [0, 1],
  left: [-1, 0],
  top_right: [1, -1],
  top_left: [-1, -1],
  bottom_right: [1, 1],
  bottom_left: [-1, 1],
};

const DIRECTION_MAP = {
  "-10": "top",
  "-1": "left",
  1: "right",
  10: "bottom",
};

export default class Tile {
  static BUILDABLE_NO = "X";
  static BUILDABLE_YES = " ";
  static BUILDABLE_PARTIAL = "-";

  constructor(x, y, buildableType, terrain, factory) {
    this.id = y * factory.getMeta().tilesX + x;
    this.x = x;
    this.y = y;
    this.factory = factory;
    this.setTerrain(terrain);
    this.setBuildableType(buildableType);
    this.component = null;
    this.inputOutputManager = new InputOutputManager(this, () => {
      if (this.component) this.component.outputsInputsChanged();
    });
  }

  getId() {
    return this.id;
  }

  getIdStr() {
    return `${this.x}:${this.y}`;
  }

  getX() {
    return this.x;
  }

  getY() {
    return this.y;
  }

  setBuildableType(type) {
    if (![Tile.BUILDABLE_YES, Tile.BUILDABLE_PARTIAL].includes(type)) type = Tile.BUILDABLE_NO;
    this.buildableType = type;
  }

  getBuildableType() {
    return this.buildableType;
  }

  isPossibleToBuildOnType(componentMeta) {
    return (
      this.buildableType === Tile.BUILDABLE_YES ||
      (componentMeta.canBuildToPartial && this.buildableType === Tile.BUILDABLE_PARTIAL)
    );
  }

  setTerrain(terrain = "grass") {
    this.terrain = terrain;
  }

  getTerrain() {
    return this.terrain;
  }

  getInputOutputManager() {
    return this.inputOutputManager;
  }

  getDirection(tile) {
    return DIRECTION_MAP[String(10 * (tile.getY() - this.y) + (tile.getX() - this.x))];
  }

  getTileInDirection(direction) {
    const [dx, dy] = DIRECTIONS[direction];
    return this.factory.getTile(this.x + dx, this.y + dy);
  }

  isMainComponentContainer() {
    return this.component && this.component.getX() === this.x && this.component.getY() === this.y;
  }

  getFactory() {
    return this.factory;
  }

  getComponent() {
    return this.component;
  }

  setComponent(componentMeta) {
    if (componentMeta) {
      const newComponent = new Component(this.factory, this.x, this.y, componentMeta);
      for (let i = 0; i < componentMeta.width; i++) {
        for (let j = 0; j < componentMeta.height; j++) {
          const tile = this.factory.getTile(this.x + i, this.y + j);
          if (tile) tile.component = newComponent;
        }
      }
      this.component = newComponent;
    } else {
      this.component = null;
    }
    this.inputOutputManager.reset();
  }

  exportToWriter1(writer) {
    this.inputOutputManager.exportToWriter(writer);
  }

  exportToWriter2(writer) {
    this.component.exportToWriter(writer);
  }

  importFromReader1(reader, game) {
    this.inputOutputManager.importFromReader(reader, game);
  }

  importFromReader2(reader, game) {
    this.component.importFromReader(reader, game);
  }
}
