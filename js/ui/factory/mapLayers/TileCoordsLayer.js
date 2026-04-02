/**
 * Dev mode: draws tile indices (x, y) on each cell. Placed above terrain, below components.
 */
export default class TileCoordsLayer {
  constructor(factory, { tileSize }) {
    this.factory = factory;
    this.tileSize = tileSize;
    this.canvas = null;
  }

  display(container) {
    const meta = this.factory.getMeta();
    const w = meta.tilesX * this.tileSize;
    const h = meta.tilesY * this.tileSize;

    this.canvas = document.createElement("canvas");
    this.canvas.width = w;
    this.canvas.height = h;
    Object.assign(this.canvas.style, {
      position: "absolute",
      left: "0",
      top: "0",
      pointerEvents: "none",
      zIndex: "1",
    });

    const ctx = this.canvas.getContext("2d");
    const linePx = Math.max(5, Math.floor(this.tileSize /2));
    ctx.font = `${linePx}px ui-monospace, monospace`;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";

    const pad = 1;
    for (let ty = 0; ty < meta.tilesY; ty++) {
      for (let tx = 0; tx < meta.tilesX; tx++) {
        const px = tx * this.tileSize + pad;
        const py = ty * this.tileSize + pad;
        const line1 = String(tx);
        const line2 = String(ty);
        ctx.strokeStyle = "rgba(0,0,0,0.75)";
        ctx.lineWidth = 2;
        ctx.strokeText(line1, px, py);
        ctx.strokeText(line2, px, py + linePx);
        ctx.fillStyle = "rgba(255,255,255,0.92)";
        ctx.fillText(line1, px, py);
        ctx.fillText(line2, px, py + linePx);
      }
    }

    container.append(this.canvas);
  }

  setVisible(visible) {
    if (this.canvas) {
      this.canvas.style.display = visible ? "" : "none";
    }
  }

  destroy() {
    if (this.canvas) {
      this.canvas.remove();
      this.canvas = null;
    }
  }
}
