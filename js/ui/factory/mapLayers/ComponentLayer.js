/**
 * ComponentLayer - Component rendering using strategy pattern
 * Extracted from original_app.js
 */
define("ui/factory/mapLayers/ComponentLayer", [
    "ui/factory/mapLayers/strategy/Default",
    "ui/factory/mapLayers/strategy/Track"
], function(Default, Track) {

    console.log("ComponentLayer module loading...");

    /**
     * ComponentLayer constructor
     * @param {Object} imageMap - ImageMap instance
     * @param {Object} factory - Factory instance
     * @param {Object} options - Options with tileSize
     */
    var ComponentLayer = function(imageMap, factory, options) {
        console.log("ComponentLayer constructor called");
        this.imageMap = imageMap;
        this.factory = factory;
        this.game = factory.getGame();
        this.tileSize = (options && options.tileSize) ? options.tileSize : 21;
        this.tilesX = factory.getMeta().tilesX;
        this.tilesY = factory.getMeta().tilesY;

        // Create strategies (like original app)
        this.strategies = {
            default: new Default(this.imageMap, { tileSize: this.tileSize }),
            track: new Track(this.imageMap, { tileSize: this.tileSize })
        };

        // Cache for tiles with components (like original app)
        this.tilesWithComponentCache = [];
    };

    /**
     * Build cache of tiles with components (like original app)
     */
    ComponentLayer.prototype.buildCache = function() {
        this.tilesWithComponentCache = [];

        var tiles = this.factory.getTiles();
        for (var i = 0; i < tiles.length; i++) {
            var tile = tiles[i];
            if (tile.getComponent()) {
                this.tilesWithComponentCache.push(tile);
            }
        }
    };

    /**
     * Redraw the component layer (like original app)
     */
    ComponentLayer.prototype.redraw = function() {
        var ctx = this.canvas.getContext("2d");
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Render each component using appropriate strategy (like original app)
        for (var i = 0; i < this.tilesWithComponentCache.length; i++) {
            var tile = this.tilesWithComponentCache[i];
            var component = tile.getComponent();
            var drawStrategy = component.getMeta().drawStrategy;

            // Default to 'default' if no strategy specified
            if (!drawStrategy) {
                drawStrategy = "default";
            }

            // Use the appropriate strategy to draw the component
            if (this.strategies[drawStrategy]) {
                this.strategies[drawStrategy].drawComponentLayer(ctx, tile);
            }
        }
    };
    /**
     * Display the component layer (like original app)
     * @param {Object} container - Container element (jQuery object)
     */
    ComponentLayer.prototype.display = function(container) {
        console.log("ComponentLayer.display called");
        this.container = container;

        // Create canvas (like original app)
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.tilesX * this.tileSize;
        this.canvas.height = this.tilesY * this.tileSize;
        this.canvas.style.position = 'absolute';

        this.ctx = this.canvas.getContext('2d');

        container.append(this.canvas);

        // Build initial cache and render
        this.buildCache();
        this.redraw();

        // Set up event listeners (like original app)
        this.factory.getEventManager().addListener(
            "LayerComponent",
            FactoryEvent.FACTORY_COMPONENTS_CHANGED,
            function() {
                this.buildCache();
                this.redraw();
            }.bind(this)
        );

        this.factory.getEventManager().addListener(
            "LayerComponent",
            FactoryEvent.FACTORY_TICK,
            function() {
                if (this.game.getTicker().getIsFocused()) {
                    // Handle tick updates if needed
                }
            }.bind(this)
        );
    };


    /**
     * Get the canvas element
     * @returns {HTMLCanvasElement}
     */
    ComponentLayer.prototype.getCanvas = function() {
        return this.canvas;
    };

    /**
     * Refresh the component layer
     */
    ComponentLayer.prototype.refresh = function() {
        this.buildCache();
        this.redraw();
    };

    /**
     * Destroy the component layer (like original app)
     */
    ComponentLayer.prototype.destroy = function() {
        this.factory.getEventManager().removeListenerForType("LayerComponent");
        if (this.container) {
            this.container.html("");
            this.container = null;
        }
        this.canvas = null;
    };

    return ComponentLayer;
    
});