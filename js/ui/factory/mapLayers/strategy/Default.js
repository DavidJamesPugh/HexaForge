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
        
        const pauseColor = tile.getComponent().isPaused() ? "red" : "green"
        const pauseIndicatorWidth = 7;
        const pauseIndicatorX = (x - pauseIndicatorWidth) + w;
        const pauseIndicatorY = (y - pauseIndicatorWidth) + h;

        ctx.drawImage(img, srcX, srcY, w, h, x, y, w, h);
        ctx.fillStyle = pauseColor;
        ctx.fillRect(pauseIndicatorX,pauseIndicatorY,
            pauseIndicatorWidth,pauseIndicatorWidth);

    }
}
