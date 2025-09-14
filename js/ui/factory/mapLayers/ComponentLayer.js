import DefaultStrategy from "./strategy/Default.js";
import TrackStrategy from "./strategy/Track.js";
import FactoryEvent from "/js/config/event/FactoryEvent.js"; // assuming

export default class ComponentLayer {
  constructor(imageMap, factory, options) {
    this.imageMap = imageMap;
    this.factory = factory;
    this.game = factory.getGame();
    this.tileSize = options.tileSize;
    this.tilesX = factory.getMeta().tilesX;
    this.tilesY = factory.getMeta().tilesY;
    this.canvas = null;

    this.strategies = {
      default: new DefaultStrategy(this.imageMap, { tileSize: this.tileSize }),
      track: new TrackStrategy(this.imageMap, { tileSize: this.tileSize }),
    };

    this.tilesWithComponentCache = [];
  }

  getCanvas() {
    return this.canvas;
  }

  display(container) {
    this.container = container;
    this.canvas = document.createElement("canvas");
    this.canvas.style.position = "absolute";
    this.canvas.width = this.tilesX * this.tileSize;
    this.canvas.height = this.tilesY * this.tileSize;
    container.append(this.canvas);

    this.factory.getEventManager().addListener(
      "LayerComponent",
      FactoryEvent.FACTORY_COMPONENTS_CHANGED,
      () => {
        this.buildCache();
        this.redraw();
      }
    );

    this.factory.getEventManager().addListener(
      "LayerComponent",
      FactoryEvent.FACTORY_TICK,
      () => {
        this.game.getTicker().getIsFocused();
      }
    );

    this.buildCache();
    this.redraw();
  }

  buildCache() {
    this.tilesWithComponentCache = [];
    const tiles = this.factory.getTiles();

    for (const tile of tiles) {
      if (tile.getComponent()) {
        this.tilesWithComponentCache.push(tile);
      }
    }
  }

  redraw() {
    const ctx = this.canvas.getContext("2d");
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (const tile of this.tilesWithComponentCache) {
      const strategyName = tile.getComponent().getMeta().drawStrategy || "default";
      this.strategies[strategyName].drawComponentLayer(ctx, tile);
    }
  }

  destroy() {
    this.factory.getEventManager().removeListenerForType("LayerComponent");
    this.container.html("");
    this.container = null;
    this.canvas = null;
  }
}
