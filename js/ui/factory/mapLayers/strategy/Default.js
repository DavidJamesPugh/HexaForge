/**
 * Default strategy for drawing regular components
 * Extracted from original_app.js
 */
define("ui/factory/mapLayers/strategy/Default", [], function() {

    /**
     * Default strategy constructor
     * @param {Object} imageMap - ImageMap instance
     * @param {Object} options - Options with tileSize
     */
    var Default = function(imageMap, options) {
        this.imageMap = imageMap;
        this.tileSize = (options && options.tileSize) ? options.tileSize : 21;
    };

    /**
     * Draw a component using the default strategy
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Object} tile - Tile containing the component
     */
    Default.prototype.drawComponentLayer = function(ctx, tile) {
        if (tile.isMainComponentContainer()) {
            var componentMeta = tile.getComponent().getMeta();
            var componentsImage = this.imageMap.getImage("components");

            var srcX = componentMeta.spriteX * (this.tileSize + 1);
            var srcY = componentMeta.spriteY * (this.tileSize + 1);
            var destX = tile.getX() * this.tileSize;
            var destY = tile.getY() * this.tileSize;
            var width = this.tileSize * componentMeta.width;
            var height = this.tileSize * componentMeta.height;

            ctx.drawImage(componentsImage, srcX, srcY, width, height, destX, destY, width, height);
        }
    };

    return Default;
});
