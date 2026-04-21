import FactoryEvent from "/js/config/event/FactoryEvent.js";

/**
 * Visualises direct (non-conveyor) resource handoff: animated arrow from
 * producer tile toward neighbour consumer along the shared edge path.
 */
export default class DirectNeighborFlowLayer {
  constructor(factory, options) {
    this.factory = factory;
    this.game = factory.getGame();
    this.tileSize = options.tileSize;
    this.tilesX = factory.getMeta().tilesX;
    this.tilesY = factory.getMeta().tilesY;
    this.canvas = null;
    this.edges = [];
    this._intervalId = null;
  }

  getCanvas() {
    return this.canvas;
  }

  display(container) {
    this.container = container;
    this.canvas = document.createElement("canvas");
    this.canvas.style.position = "absolute";
    this.canvas.style.zIndex = "12";
    this.canvas.style.pointerEvents = "none";
    this.canvas.width = this.tilesX * this.tileSize;
    this.canvas.height = this.tilesY * this.tileSize;
    container.append(this.canvas);

    this.factory.getEventManager().addListener(
      "LayerDirectNeighborFlow",
      FactoryEvent.FACTORY_COMPONENTS_CHANGED,
      () => {
        this.buildCache();
        this.redraw();
      }
    );

    this.buildCache();
    this.redraw();

    this._intervalId = setInterval(() => {
      if (this.game.getTicker().getIsFocused()) {
        this.redraw();
      }
    }, 80);
  }

  buildCache() {
    this.edges = [];
    const seen = new Set();
    for (const tile of this.factory.getTiles()) {
      if (!tile.isMainComponentContainer()) continue;
      const comp = tile.getComponent();
      if (!comp) continue;
      const outs = comp.getSurroundedOutputTiles();
      for (const e of outs) {
        if (!e.directEdge) continue;
        const fromTile = e.from;
        const toTile = e.tile;
        const key = `${fromTile.getId()}-${toTile.getId()}`;
        if (seen.has(key)) continue;
        seen.add(key);
        this.edges.push({ producer: comp, fromTile, toTile });
      }
    }
  }

  redraw() {
    const ctx = this.canvas.getContext("2d");
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    const ts = this.tileSize;
    const tAnim = (performance.now() % 1400) / 1400;

    for (const { producer, fromTile, toTile } of this.edges) {
      const strat = producer.getStrategy();
      const dir = fromTile.getDirection(toTile);
      const q = strat.getDirectOutputQueue?.(fromTile, dir);
      const pkg = q?.getLast?.();
      const hasFlow = !!pkg;

      const x0 = fromTile.getX() * ts + ts / 2;
      const y0 = fromTile.getY() * ts + ts / 2;
      const x1 = toTile.getX() * ts + ts / 2;
      const y1 = toTile.getY() * ts + ts / 2;

      const dx = x1 - x0;
      const dy = y1 - y0;
      const len = Math.hypot(dx, dy) || 1;
      const ux = dx / len;
      const uy = dy / len;
      const angle = Math.atan2(dy, dx);

      const inset = ts * 0.28;
      const sx0 = x0 + ux * inset;
      const sy0 = y0 + uy * inset;
      const sx1 = x1 - ux * inset;
      const sy1 = y1 - uy * inset;

      ctx.strokeStyle = hasFlow ? "rgba(34, 211, 238, 0.78)" : "rgba(148, 163, 184, 0.28)";
      ctx.lineWidth = hasFlow ? 3 : 1;
      ctx.setLineDash(hasFlow ? [] : [4, 5]);
      ctx.beginPath();
      ctx.moveTo(sx0, sy0);
      ctx.lineTo(sx1, sy1);
      ctx.stroke();
      ctx.setLineDash([]);

      const runLen = Math.hypot(sx1 - sx0, sy1 - sy0) || 1;
      const along = hasFlow ? 0.12 + tAnim * 0.76 : 0.5;
      const ax = sx0 + (sx1 - sx0) * along;
      const ay = sy0 + (sy1 - sy0) * along;
      const head = hasFlow ? ts * 0.22 : ts * 0.14;

      ctx.save();
      ctx.translate(ax, ay);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(head, 0);
      ctx.lineTo(-head * 0.55, head * 0.45);
      ctx.lineTo(-head * 0.55, -head * 0.45);
      ctx.closePath();
      ctx.fillStyle = hasFlow ? "rgba(34, 211, 238, 0.95)" : "rgba(148, 163, 184, 0.45)";
      ctx.fill();
      ctx.strokeStyle = hasFlow ? "rgba(8, 47, 73, 0.9)" : "rgba(71, 85, 105, 0.5)";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }
  }

  destroy() {
    if (this._intervalId != null) {
      clearInterval(this._intervalId);
      this._intervalId = null;
    }
    this.factory.getEventManager().removeListenerForType("LayerDirectNeighborFlow");
    if (this.container) {
      this.canvas?.remove();
    }
    this.container = null;
    this.canvas = null;
    this.edges = [];
  }
}
