import ComponentFootprint from "../../../../game/ComponentFootprint.js";

export default class DefaultStrategy {
    constructor(imageMap, { tileSize }) {
        this.imageMap = imageMap;
        this.tileSize = tileSize;
    }

    drawComponent(ctx, tile) {
        const comp = tile.getComponent();
        const meta = ComponentFootprint.ensurePrepared(comp.getMeta());
        const ax = comp.getX();
        const ay = comp.getY();
        for (const { dx, dy } of meta.occupiedCells) {
          const px = (ax + dx) * this.tileSize;
          const py = (ay + dy) * this.tileSize;
          ctx.clearRect(px, py, this.tileSize, this.tileSize);
        }
        this.drawComponentLayer(ctx, tile);
      }

    drawComponentLayer(ctx, tile) {
        if (!tile.isMainComponentContainer()) return;

        const comp = tile.getComponent();
        const meta = ComponentFootprint.ensurePrepared(comp.getMeta());
        const img = this.imageMap.getImage("components");
        const ax = comp.getX();
        const ay = comp.getY();
        const baseSrcX = meta.spriteX * (this.tileSize + 1);
        const baseSrcY = meta.spriteY * (this.tileSize + 1);

        for (const { dx, dy } of meta.occupiedCells) {
          const destX = (ax + dx) * this.tileSize;
          const destY = (ay + dy) * this.tileSize;
          const srcX = baseSrcX + dx * this.tileSize;
          const srcY = baseSrcY + dy * this.tileSize;
          ctx.drawImage(
            img,
            srcX,
            srcY,
            this.tileSize,
            this.tileSize,
            destX,
            destY,
            this.tileSize,
            this.tileSize
          );
        }

        const paused = comp.isPaused();
        const pauseColor = paused ? "red" : "green"
        const pauseIndicatorWidth = 8;
        const roundness = paused ? [0,0,0,0]: [0,0,0,45];
        const x = ax * this.tileSize;
        const y = ay * this.tileSize;
        const w = this.tileSize * meta.width;
        const h = this.tileSize * meta.height;
        const pauseIndicatorTranslateX = (x - pauseIndicatorWidth) + w;
        const pauseIndicatorTranslateY = (y - pauseIndicatorWidth) + h;
        let pauseIndicatorX = -2;
        let pauseIndicatorY = -2;
        ctx.save();

        ctx.translate(
            pauseIndicatorTranslateX,
            pauseIndicatorTranslateY
          );
        if(!paused) {
            ctx.rotate((45 * Math.PI) / 180);
            pauseIndicatorX = -pauseIndicatorWidth/2;
            pauseIndicatorY = -pauseIndicatorWidth/2;
        }
        ctx.fillStyle = pauseColor;

        ctx.beginPath();
        // ctx.roundRect(pauseIndicatorX,pauseIndicatorY,
        //     pauseIndicatorWidth,pauseIndicatorWidth, roundness);
        // ctx.fill();
        // ctx.stroke();
        ctx.restore();
    }
}
