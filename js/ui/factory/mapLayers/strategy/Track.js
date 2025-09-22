export default class TrackStrategy {
  constructor(imageMap, options) {
    this.imageMap = imageMap;
    this.tileSize = options.tileSize;
    this.drawMap = this._getDrawMap();
  }

  drawComponentLayer(ctx, tile) {
    if (tile.isMainComponentContainer()) {
      const meta = tile.getComponent().getMeta();
      const params = this._getDrawParameters(tile);
      let sprite = this.imageMap.getImage(meta.id);
      if (!sprite) {
        // Fallback commonly used for tracks
        sprite = this.imageMap.getImage("transportLine");
        if (!sprite) {
          console.warn("TrackStrategy: missing sprite for", meta.id);
          return;
        } else {
          console.log("TrackStrategy: using fallback sprite 'transportLine' for", meta.id);
        }
      }

      const sx = params.n * this.tileSize;
      const sy = 0;
      const sw = this.tileSize * meta.width;
      const sh = this.tileSize * meta.height;

      const dx = tile.getX() * this.tileSize;
      const dy = tile.getY() * this.tileSize;
      const dw = this.tileSize * meta.width;
      const dh = this.tileSize * meta.height;

      const rotation = params.rotation;
      const flip = params.flip;

      this._drawImage(ctx, sprite, sx, sy, sw, sh, dx, dy, dw, dh, rotation, flip);

      // Keep AMD behavior
      ctx.font = "9px Arial";
      ctx.textAlign = "center";
    }
  }

  _getDrawParameters(tile) {
    const inputs = tile.getInputOutputManager().getInputsByDirection();
    const outputs = tile.getInputOutputManager().getOutputsByDirection();

    const inKey =
      (inputs.top ? "1" : "0") +
      (inputs.right ? "1" : "0") +
      (inputs.bottom ? "1" : "0") +
      (inputs.left ? "1" : "0");

    const outKey =
      (outputs.top ? "1" : "0") +
      (outputs.right ? "1" : "0") +
      (outputs.bottom ? "1" : "0") +
      (outputs.left ? "1" : "0");

    return this.drawMap[inKey] && this.drawMap[inKey][outKey]
      ? this.drawMap[inKey][outKey]
      : this.drawMap.error;
  }

  _drawImage(ctx, img, sx, sy, sw, sh, dx, dy, dw, dh, rotation, flip) {
    ctx.save();
    let angle = (rotation * Math.PI) / 180;
    if (!flip) angle = 2 * Math.PI - angle;

    ctx.translate(dx + dw / 2, dy + dh / 2);
    ctx.rotate(angle);
    if (flip) ctx.scale(-1, 1);

    ctx.drawImage(img, sx, sy + 1, sw, sh, -dw / 2, -dh / 2, dw, dh);
    ctx.restore();
  }

  _getDrawMap() {
    return {
      error: { n: 17, rotation: 0, flip: false },
      "0000": {
        "0000": { n: 0, rotation: 0, flip: false },
        1000: { n: 1, rotation: 0, flip: false },
        "0100": { n: 1, rotation: -90, flip: false },
        "0010": { n: 1, rotation: 180, flip: false },
        "0001": { n: 1, rotation: 90, flip: false },
      },
      1000: {
        "0000": { n: 2, rotation: 0, flip: false },
        "0100": { n: 4, rotation: 0, flip: false },
        "0010": { n: 3, rotation: 0, flip: false },
        "0001": { n: 4, rotation: 0, flip: true },
        "0110": { n: 5, rotation: 0, flip: true },
        "0101": { n: 6, rotation: 0, flip: false },
        "0011": { n: 5, rotation: 0, flip: false },
        "0111": { n: 7, rotation: 0, flip: false },
      },
      "0100": {
        "0000": { n: 2, rotation: 270, flip: false },
        1000: { n: 4, rotation: 90, flip: true },
        "0010": { n: 4, rotation: 270, flip: false },
        "0001": { n: 3, rotation: 270, flip: false },
        1010: { n: 6, rotation: 270, flip: false },
        1001: { n: 5, rotation: 270, flip: false },
        "0011": { n: 5, rotation: 90, flip: true },
        1011: { n: 7, rotation: 270, flip: false },
      },
      "0010": {
        "0000": { n: 2, rotation: 180, flip: false },
        1000: { n: 3, rotation: 180, flip: false },
        "0100": { n: 4, rotation: 180, flip: true },
        "0001": { n: 4, rotation: 180, flip: false },
        1100: { n: 5, rotation: 180, flip: false },
        1001: { n: 5, rotation: 180, flip: true },
        "0101": { n: 6, rotation: 180, flip: false },
        1101: { n: 7, rotation: 180, flip: false },
      },
      "0001": {
        "0000": { n: 2, rotation: 90, flip: false },
        1000: { n: 4, rotation: 90, flip: false },
        "0100": { n: 3, rotation: 90, flip: false },
        "0010": { n: 4, rotation: 270, flip: true },
        1100: { n: 5, rotation: 270, flip: true },
        1010: { n: 6, rotation: 90, flip: false },
        "0110": { n: 5, rotation: 90, flip: false },
        1110: { n: 7, rotation: 90, flip: false },
      },
      1100: { "0000": { n: 8, rotation: 0, flip: false }, "0010": { n: 10, rotation: 0, flip: true }, "0001": { n: 10, rotation: 270, flip: false }, "0011": { n: 13, rotation: 270, flip: false } },
      1010: { "0000": { n: 9, rotation: 0, flip: false }, "0100": { n: 11, rotation: 90, flip: false }, "0001": { n: 11, rotation: 270, flip: false }, "0101": { n: 12, rotation: 90, flip: true } },
      1001: { "0000": { n: 8, rotation: 90, flip: false }, "0100": { n: 10, rotation: 270, flip: true }, "0010": { n: 10, rotation: 0, flip: false }, "0110": { n: 13, rotation: 0, flip: false } },
      "0110": { "0000": { n: 8, rotation: 270, flip: false }, 1000: { n: 10, rotation: 180, flip: false }, "0001": { n: 10, rotation: 90, flip: true }, 1001: { n: 13, rotation: 180, flip: false } },
      "0101": { "0000": { n: 9, rotation: 90, flip: false }, 1000: { n: 11, rotation: 180, flip: false }, "0010": { n: 11, rotation: 0, flip: false }, 1010: { n: 12, rotation: 0, flip: false } },
      "0011": { "0000": { n: 8, rotation: 180, flip: false }, 1000: { n: 10, rotation: 180, flip: true }, "0100": { n: 10, rotation: 90, flip: false }, 1100: { n: 13, rotation: 90, flip: false } },
      1110: { "0000": { n: 15, rotation: 270, flip: false }, "0001": { n: 14, rotation: 270, flip: false } },
      1101: { "0000": { n: 15, rotation: 0, flip: false }, "0010": { n: 14, rotation: 0, flip: false } },
      1011: { "0000": { n: 15, rotation: 90, flip: false }, "0100": { n: 14, rotation: 90, flip: false } },
      "0111": { "0000": { n: 15, rotation: 180, flip: false }, 1000: { n: 14, rotation: 180, flip: false } },
      1111: { "0000": { n: 16, rotation: 0, flip: false } },
    };
  }
}
