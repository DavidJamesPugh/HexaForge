/**
 * PackageLayer - Package visualization layer
 * Extracted from original_app.js
 */
define("ui/factory/mapLayers/PackageLayer", [
    "config/event/FactoryEvent"
], function(FactoryEvent) {

    console.log("PackageLayer module loading...");

    /**
     * PackageLayer constructor
     * @param {Object} imageMap - ImageMap instance
     * @param {Object} factory - Factory instance
     * @param {Object} options - Options with tileSize
     */
    var PackageLayer = function(imageMap, factory, options) {
        console.log("PackageLayer constructor called");
        this.imageMap = imageMap;
        this.factory = factory;
        this.game = factory.getGame();
        this.tileSize = (options && options.tileSize) ? options.tileSize : 21;
        this.packageSize = 15;

        var i = this.packageSize / 3;
        this.tilesX = factory.getMeta().tilesX;
        this.tilesY = factory.getMeta().tilesY;
        this.resourcesMeta = this.factory.getGame().getMeta().resourcesById;

        this.firstPackageLocation = {
            top: { top: -this.packageSize + i, bottom: -this.tileSize / 2 - i },
            bottom: { top: this.tileSize / 2 - this.packageSize + i, bottom: 0 - i },
            right: { right: 0 - i, left: this.tileSize / 2 - this.packageSize + i },
            left: { right: -this.tileSize / 2 - i, left: -this.packageSize + i }
        };

        this.movementDirectionCoefficient = {
            top: { top: -5, bottom: 5 },
            bottom: { top: -5, bottom: 5 },
            right: { right: 5, left: -5 },
            left: { right: 5, left: -5 }
        };

        this.canvas = null;
        this.queuesCache = [];
    };

    /**
     * Get the canvas element
     * @returns {HTMLCanvasElement}
     */
    PackageLayer.prototype.getCanvas = function() {
        return this.canvas;
    };

    /**
     * Display the package layer in the specified container
     * @param {Object} container - Container element (jQuery object)
     */
    PackageLayer.prototype.display = function(container) {
        var self = this;
        this.container = container;

        this.canvas = document.createElement("canvas");
        this.canvas.style.position = "absolute";
        this.canvas.width = this.tilesX * this.tileSize;
        this.canvas.height = this.tilesY * this.tileSize;

        container.append(this.canvas);

        // Set up event listeners
        this.factory.getEventManager().addListener(
            "LayerPackage",
            FactoryEvent.FACTORY_TICK,
            function() {
                if (this.game.getTicker().getIsFocused()) {
                    this.redraw();
                }
            }.bind(this)
        );

        this.factory.getEventManager().addListener(
            "LayerPackage",
            FactoryEvent.FACTORY_COMPONENTS_CHANGED,
            function() {
                this.buildCache();
                this.redraw();
            }.bind(this)
        );

        this.buildCache();
        this.redraw();
    };

    /**
     * Build the queues cache for package rendering
     */
    PackageLayer.prototype.buildCache = function() {
        this.queuesCache = [];

        var tiles = this.factory.getTiles();
        for (var t = 0; t < tiles.length; t++) {
            var tile = tiles[t];
            var component = tile.getComponent();

            if (component && component.getMeta().strategy.type === "transport") {
                var inputQueues = component.getStrategy().getInputQueues();
                var outputQueues = component.getStrategy().getOutputQueues();

                this._addQueueToCache(tile, inputQueues.top, "top", "bottom");
                this._addQueueToCache(tile, outputQueues.top, "top", "top");
                this._addQueueToCache(tile, outputQueues.left, "left", "left");
                this._addQueueToCache(tile, inputQueues.left, "left", "right");
                this._addQueueToCache(tile, inputQueues.right, "right", "left");
                this._addQueueToCache(tile, outputQueues.right, "right", "right");
                this._addQueueToCache(tile, outputQueues.bottom, "bottom", "bottom");
                this._addQueueToCache(tile, inputQueues.bottom, "bottom", "top");
            }
        }
    };

    /**
     * Add a queue to the cache
     * @private
     */
    PackageLayer.prototype._addQueueToCache = function(tile, queue, posDir, moveDir) {
        if (queue) {
            this.queuesCache.push({
                tile: tile,
                queue: queue,
                posDir: posDir,
                moveDir: moveDir
            });
        }
    };

    /**
     * Redraw the package layer
     */
    PackageLayer.prototype.redraw = function() {
        if (!this.canvas) return;

        var ctx = this.canvas.getContext("2d");
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (var t = 0; t < this.queuesCache.length; t++) {
            var cacheItem = this.queuesCache[t];
            this.drawQueue(cacheItem.tile, cacheItem.queue, cacheItem.posDir, cacheItem.moveDir);
        }
    };

    /**
     * Draw a queue of packages
     * @param {Object} tile - The tile
     * @param {Object} queue - The package queue
     * @param {string} posDir - Position direction
     * @param {string} moveDir - Movement direction
     */
    PackageLayer.prototype.drawQueue = function(tile, queue, posDir, moveDir) {
        var centerX = tile.getX() * this.tileSize + this.tileSize / 2;
        var centerY = tile.getY() * this.tileSize + this.tileSize / 2;

        for (var h = 0; h < queue.getLength(); h++) {
            var packageIndex = h;

            // Reverse order for certain directions
            if (moveDir === "top" || moveDir === "left") {
                packageIndex = queue.getLength() - h - 1;
            }

            var pkg = queue.get(packageIndex);
            if (pkg) {
                var spriteX = this.resourcesMeta[pkg.getResourceId()].spriteX * (this.packageSize + 1);
                var spriteY = this.resourcesMeta[pkg.getResourceId()].spriteY * (this.packageSize + 1);

                var posX, posY;

                if (posDir === "left" || posDir === "right") {
                    posX = centerX + this.firstPackageLocation[posDir][moveDir] + this.movementDirectionCoefficient[posDir][moveDir] * packageIndex + pkg.getOffset() / 2;
                    posY = centerY - this.packageSize / 2 + pkg.getOffset();
                } else {
                    posX = centerX - this.packageSize / 2 + pkg.getOffset();
                    posY = centerY + this.firstPackageLocation[posDir][moveDir] + this.movementDirectionCoefficient[posDir][moveDir] * packageIndex + pkg.getOffset() / 2;
                }

                var ctx = this.canvas.getContext("2d");
                ctx.drawImage(
                    this.imageMap.getImage("resources"),
                    spriteX, spriteY,
                    this.packageSize, this.packageSize,
                    Math.round(posX) + 2, Math.round(posY) + 2,
                    this.packageSize - 4, this.packageSize - 4
                );
            }
        }
    };

    /**
     * Clean up resources and event listeners
     */
    PackageLayer.prototype.destroy = function() {
        if (this.factory && this.factory.getEventManager()) {
            this.factory.getEventManager().removeListenerForType("LayerPackage");
        }

        if (this.container) {
            this.container.html("");
            this.container = null;
        }

        this.canvas = null;
    };

    return PackageLayer;
});
