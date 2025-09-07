/**
 * Track strategy for drawing transport line components with connections and rotations
 * Extracted from original_app.js
 */
define("ui/factory/mapLayers/strategy/Track", [], function() {

    /**
     * Track strategy constructor
     * @param {Object} imageMap - ImageMap instance
     * @param {Object} options - Options with tileSize
     */
    var Track = function(imageMap, options) {
        this.imageMap = imageMap;
        this.tileSize = (options && options.tileSize) ? options.tileSize : 21;
        this.drawMap = this._getDrawMap();
    };

    /**
     * Draw a component using the track strategy
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Object} tile - Tile containing the component
     */
    Track.prototype.drawComponentLayer = function(ctx, tile) {
        if (tile.isMainComponentContainer()) {
            var componentMeta = tile.getComponent().getMeta();
            var drawParams = this._getDrawParameters(tile);
            var trackImage = this.imageMap.getImage(componentMeta.id);

            var srcX = drawParams.n * this.tileSize;
            var srcY = 0;
            var width = this.tileSize * componentMeta.width;
            var height = this.tileSize * componentMeta.height;
            var destX = tile.getX() * this.tileSize;
            var destY = tile.getY() * this.tileSize;

            var rotation = drawParams.rotation;
            var flip = drawParams.flip;

            this._drawImage(ctx, trackImage, srcX, srcY, width, height, destX, destY, width, height, rotation, flip);
        }
    };

    /**
     * Get draw parameters for a tile based on its connections
     * @param {Object} tile - Tile to get parameters for
     * @returns {Object} Draw parameters with n, rotation, flip
     * @private
     */
    Track.prototype._getDrawParameters = function(tile) {
        var inputOutputManager = tile.getComponent().getInputOutputManager();
        var inputs = inputOutputManager.getInputsByDirection();
        var outputs = inputOutputManager.getOutputsByDirection();

        var inputPattern = (inputs.top ? "1" : "0") +
                          (inputs.right ? "1" : "0") +
                          (inputs.bottom ? "1" : "0") +
                          (inputs.left ? "1" : "0");

        var outputPattern = (outputs.top ? "1" : "0") +
                           (outputs.right ? "1" : "0") +
                           (outputs.bottom ? "1" : "0") +
                           (outputs.left ? "1" : "0");

        if (this.drawMap[inputPattern] && this.drawMap[inputPattern][outputPattern]) {
            return this.drawMap[inputPattern][outputPattern];
        }

        return this.drawMap.error;
    };

    /**
     * Draw an image with rotation and flipping
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Image} image - Image to draw
     * @param {number} srcX - Source X position
     * @param {number} srcY - Source Y position
     * @param {number} srcWidth - Source width
     * @param {number} srcHeight - Source height
     * @param {number} destX - Destination X position
     * @param {number} destY - Destination Y position
     * @param {number} destWidth - Destination width
     * @param {number} destHeight - Destination height
     * @param {number} rotation - Rotation in degrees
     * @param {boolean} flip - Whether to flip horizontally
     * @private
     */
    Track.prototype._drawImage = function(ctx, image, srcX, srcY, srcWidth, srcHeight, destX, destY, destWidth, destHeight, rotation, flip) {
        ctx.save();

        var radians = (rotation * Math.PI) / 180;
        if (!flip) {
            radians = 2 * Math.PI - radians;
        }

        var centerX = destX + destWidth / 2;
        var centerY = destY + destHeight / 2;

        ctx.translate(centerX, centerY);
        ctx.rotate(radians);

        if (flip) {
            ctx.scale(-1, 1);
        }

        ctx.drawImage(image, srcX, srcY + 1, srcWidth, srcHeight, -destWidth / 2, -destHeight / 2, destWidth, destHeight);

        ctx.restore();
    };

    /**
     * Get the draw map for track connections
     * @returns {Object} Draw map with patterns and their corresponding sprites
     * @private
     */
    Track.prototype._getDrawMap = function() {
        return {
            error: { n: 17, rotation: 0, flip: false },
            "0000": {
                "0000": { n: 0, rotation: 0, flip: false },
                "1000": { n: 1, rotation: 0, flip: false },
                "0100": { n: 1, rotation: -90, flip: false },
                "0010": { n: 1, rotation: 180, flip: false },
                "0001": { n: 1, rotation: 90, flip: false }
            },
            "1000": {
                "0000": { n: 2, rotation: 0, flip: false },
                "0100": { n: 4, rotation: 0, flip: false },
                "0010": { n: 3, rotation: 0, flip: false },
                "0001": { n: 4, rotation: 0, flip: true },
                "0110": { n: 5, rotation: 0, flip: true },
                "0101": { n: 6, rotation: 0, flip: false },
                "0011": { n: 5, rotation: 0, flip: false },
                "0111": { n: 7, rotation: 0, flip: false }
            },
            "0100": {
                "0000": { n: 2, rotation: 270, flip: false },
                "1000": { n: 4, rotation: 90, flip: true },
                "0010": { n: 4, rotation: 270, flip: false },
                "0001": { n: 3, rotation: 270, flip: false },
                "1010": { n: 6, rotation: 270, flip: false },
                "1001": { n: 5, rotation: 270, flip: false },
                "0011": { n: 5, rotation: 90, flip: true },
                "1011": { n: 7, rotation: 270, flip: false }
            },
            "0010": {
                "0000": { n: 2, rotation: 180, flip: false },
                "1000": { n: 3, rotation: 180, flip: false },
                "0100": { n: 4, rotation: 180, flip: true },
                "0001": { n: 4, rotation: 180, flip: false },
                "1100": { n: 5, rotation: 180, flip: false },
                "1001": { n: 5, rotation: 180, flip: true },
                "0101": { n: 6, rotation: 180, flip: false },
                "1101": { n: 7, rotation: 180, flip: false }
            },
            "0001": {
                "0000": { n: 2, rotation: 90, flip: false },
                "1000": { n: 4, rotation: 90, flip: false },
                "0100": { n: 3, rotation: 90, flip: false },
                "0010": { n: 4, rotation: 270, flip: true },
                "1100": { n: 5, rotation: 270, flip: true },
                "1010": { n: 6, rotation: 90, flip: false },
                "0110": { n: 5, rotation: 90, flip: false },
                "1110": { n: 7, rotation: 90, flip: false }
            },
            "1100": {
                "0000": { n: 8, rotation: 0, flip: false },
                "0010": { n: 10, rotation: 0, flip: true },
                "0001": { n: 10, rotation: 270, flip: false },
                "0011": { n: 13, rotation: 270, flip: false }
            },
            "1010": {
                "0000": { n: 9, rotation: 0, flip: false },
                "0100": { n: 11, rotation: 90, flip: false },
                "0001": { n: 11, rotation: 270, flip: false },
                "0101": { n: 12, rotation: 90, flip: true }
            },
            "1001": {
                "0000": { n: 8, rotation: 90, flip: false },
                "0100": { n: 10, rotation: 270, flip: true },
                "0010": { n: 10, rotation: 0, flip: false },
                "0110": { n: 13, rotation: 0, flip: false }
            },
            "0110": {
                "0000": { n: 8, rotation: 270, flip: false },
                "1000": { n: 10, rotation: 180, flip: false },
                "0001": { n: 10, rotation: 90, flip: true },
                "1001": { n: 13, rotation: 180, flip: false }
            },
            "0101": {
                "0000": { n: 9, rotation: 90, flip: false },
                "1000": { n: 11, rotation: 180, flip: false },
                "0010": { n: 11, rotation: 0, flip: false },
                "1010": { n: 12, rotation: 0, flip: false }
            },
            "0011": {
                "0000": { n: 8, rotation: 180, flip: false },
                "1000": { n: 10, rotation: 180, flip: true },
                "0100": { n: 10, rotation: 90, flip: false },
                "1100": { n: 13, rotation: 90, flip: false }
            },
            "1110": {
                "0000": { n: 15, rotation: 270, flip: false },
                "0001": { n: 14, rotation: 270, flip: false }
            },
            "1101": {
                "0000": { n: 15, rotation: 0, flip: false },
                "0010": { n: 14, rotation: 0, flip: false }
            },
            "1011": {
                "0000": { n: 15, rotation: 90, flip: false },
                "0100": { n: 14, rotation: 90, flip: false }
            },
            "0111": {
                "0000": { n: 15, rotation: 180, flip: false },
                "1000": { n: 14, rotation: 180, flip: false }
            },
            "1111": {
                "0000": { n: 16, rotation: 0, flip: false }
            }
        };
    };

    return Track;
});
