export default class DefaultStrategy {
    constructor(imageMap, { tileSize }) {
        this.imageMap = imageMap;
        this.tileSize = tileSize;
    }

    drawComponent(ctx, tile) {
        const meta = tile.getComponent().getMeta();
      
        const x = tile.getX() * this.tileSize;
        const y = tile.getY() * this.tileSize;
        const w = this.tileSize * meta.width;
        const h = this.tileSize * meta.height;
      
        ctx.clearRect(x, y, w, h);
      
        this.drawComponentLayer(ctx, tile);
      }

    drawComponentLayer(ctx, tile) {
        if (!tile.isMainComponentContainer()) return;
        
        const meta = tile.getComponent().getMeta();
        
        const img = this.imageMap.getImage("components");
        const srcX = meta.spriteX * (this.tileSize + 1);
        const srcY = meta.spriteY * (this.tileSize + 1);
        const x = tile.getX() * this.tileSize;
        const y = tile.getY() * this.tileSize;
        const w = this.tileSize * meta.width;
        const h = this.tileSize * meta.height;

        ctx.drawImage(img, srcX, srcY, w, h, x, y, w, h);

        
        const paused = tile.getComponent().isPaused();
        const pauseColor = paused ? "red" : "green"
        const pauseIndicatorWidth = 8;
        const roundness = paused ? [0,0,0,0]: [0,0,0,45];
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
        ctx.roundRect(pauseIndicatorX,pauseIndicatorY,
            pauseIndicatorWidth,pauseIndicatorWidth, roundness);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }
}
