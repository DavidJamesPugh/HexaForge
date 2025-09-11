export default class DefaultStrategy {
    constructor(imageMap, { tileSize }) {
        this.imageMap = imageMap;
        this.tileSize = tileSize;
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
    }
}
