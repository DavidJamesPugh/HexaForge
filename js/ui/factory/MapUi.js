/**
 * MapUi - Factory map display and interaction
 * Extracted from original_app.js
 */
define("ui/factory/MapUi", [
    "config/event/FactoryEvent",
    "game/Component",
    "ui/factory/mapLayers/BackgroundLayer",
    "ui/factory/mapLayers/ComponentLayer",
    "ui/factory/mapLayers/PackageLayer",
    "ui/factory/mapLayers/MouseLayer",
    "ui/factory/mapLayers/AreasLayer",
    "ui/factory/ScreenshotUi"
], function(FactoryEvent, Component, BackgroundLayer, ComponentLayer, PackageLayer, MouseLayer, AreasLayer, ScreenshotUi) {

    console.log("MapUI module loading...");

    /**
     * MapUi constructor
     * @param {Object} globalUiEm - Global UI event manager
     * @param {Object} imageMap - ImageMap instance
     * @param {Object} factory - Factory instance
     * @param {Object} options - Options with tileSize
     */
    var MapUi = function(globalUiEm, imageMap, factory, options) {
        console.log("MapUI constructor called");
        this.globalUiEm = globalUiEm;
        this.imageMap = imageMap;
        this.factory = factory;
        this.game = factory.getGame();
        this.tileSize = (options && options.tileSize) ? options.tileSize : 21;

        // Initialize layers
        this.backgroundLayer = new BackgroundLayer(this.imageMap, this.factory, { tileSize: this.tileSize });
        // this.componentLayer = new ComponentLayer(this.imageMap, this.factory, { tileSize: this.tileSize });
        // this.packageLayer = new PackageLayer(this.imageMap, this.factory, { tileSize: this.tileSize });
        // this.mouseLayer = new MouseLayer(this.imageMap, this.factory, { tileSize: this.tileSize });
        // this.areasLayer = new AreasLayer(this.imageMap, this.factory, { tileSize: this.tileSize });
    };
    
    /**
     * Display the MapUi in the specified container
     * @param {Object} container - Container element (jQuery object)
     */
    MapUi.prototype.display = function(container) {
        console.log("MapUi.display called with container:", container);
        console.log("Container dimensions:", container.width(), "x", container.height());
        this.container = container;

        // Get container and map dimensions
        var containerWidth = this.container.width();
        var containerHeight = this.container.height();
        var mapWidth = this.factory.getMeta().tilesX * this.tileSize;
        var mapHeight = this.factory.getMeta().tilesY * this.tileSize;

        console.log("Map dimensions:", mapWidth, "x", mapHeight);
        console.log("Factory meta:", this.factory.getMeta());
            
        // Create overlay div (constrains the view)
            this.overlay = $("<div />")
                .css("overflow", "hidden")
                .css("margin", "0 0 0 0")
                .css("width", Math.min(containerWidth, mapWidth))
                .css("height", Math.min(containerHeight, mapHeight))
                .css("background-color", "#e0e0e0")
                .css("border", "1px solid #999");
            
        // Create element div (holds the actual map)
            this.element = $("<div />")
                .css("position", "relative")
                .css("width", mapWidth + "px")
                .css("height", mapHeight + "px")
                .css("background-color", "#f0f0f0")
                .css("border", "2px solid #ccc");
            
            // Nest the element inside the overlay
            this.overlay.html(this.element);
            
            // Add the overlay to the container
        this.container.html(this.overlay);

        // Display layers
        console.log("Displaying layers...");
        console.log("BackgroundLayer:", this.backgroundLayer);
        // console.log("ComponentLayer:", this.componentLayer);
        // console.log("PackageLayer:", this.packageLayer);
        // console.log("MouseLayer:", this.mouseLayer);
        // console.log("AreasLayer:", this.areasLayer);

        this.backgroundLayer.display(this.element);
        // this.componentLayer.display(this.element);
        // this.packageLayer.display(this.element);
        // this.mouseLayer.display(this.element);
        // this.areasLayer.display(this.element);

        //console.log("All layers displayed");

        // Set up map dragging
        this.setupMapDragging();

        // Set up screenshot functionality
        this.setupScreenshot();

        // console.log("MapUi: Created overlay structure - overlay:",
        //     this.overlay.width(), "x", this.overlay.height(),
        //     "element:", this.element.width(), "x", this.element.height());
    };
    
    /**
     * Set up map dragging functionality
     * @private
     */
    MapUi.prototype.setupMapDragging = function() {
        var self = this;
        var isDraggingAllowed = true;

        // Listen for component selection to determine if dragging is allowed
        this.factory.getEventManager().addListener(
            "MapUi",
            FactoryEvent.COMPONENT_META_SELECTED,
            function(componentId) {
                var componentMeta = self.game.getMeta().componentsById[componentId];
                isDraggingAllowed = !componentMeta || !componentMeta.buildByDragging;
            }
        );

        // Set up mouse event handlers for dragging
        this.element.get(0).addEventListener("mousedown", function(e) {
            if (e.which === 1 && !e.shiftKey && !e.altKey && isDraggingAllowed) {
                var startX = e.pageX;
                var startY = e.pageY;
                var elementOffset = self.element.offset();

                var dragHandler = function(moveEvent) {
                    var newLeft = elementOffset.left + (moveEvent.pageX - startX);
                    var newTop = elementOffset.top + (moveEvent.pageY - startY);
                    self.element.offset(self.constrainOffset(newLeft, newTop));
                    self.factory.getEventManager().invokeEvent(FactoryEvent.FACTORY_SCROLL_START);
                };

                var stopDragHandler = function() {
                    $("body").off("mousemove", dragHandler).off("mouseleave", stopDragHandler).off("mouseup", stopDragHandler);
                    self.factory.getEventManager().invokeEvent(FactoryEvent.FACTORY_SCROLL_END);
                };

                $("body").on("mousemove", dragHandler).on("mouseup", stopDragHandler).on("mouseleave", stopDragHandler);
            }
        });

        // Initialize map position
        var initialOffset = this.overlay.offset();
        var startX = this.factory.getMeta().startX || 0;
        var startY = this.factory.getMeta().startY || 0;

        if (this.overlay.width() < this.element.width()) {
            initialOffset.left = -startX * this.tileSize + initialOffset.left;
        }
        if (this.overlay.height() < this.element.height()) {
            initialOffset.top = -startY * this.tileSize + initialOffset.top;
        }

        this.element.offset(this.constrainOffset(initialOffset.left, initialOffset.top));
    };
    
    /**
     * Constrain the map offset to stay within bounds
     * @private
     */
    MapUi.prototype.constrainOffset = function(left, top) {
        var overlayOffset = this.overlay.offset();
        var maxLeft = overlayOffset.left;
        var minLeft = overlayOffset.left - this.element.width() + this.overlay.width();
        var maxTop = overlayOffset.top;
        var minTop = overlayOffset.top - this.element.height() + this.overlay.height();

        left = Math.min(maxLeft, Math.max(minLeft, left));
        top = Math.min(maxTop, Math.max(minTop, top));

        return { left: left, top: top };
    };
    
    /**
     * Set up screenshot functionality
     * @private
     */
    MapUi.prototype.setupScreenshot = function() {
        var self = this;
        this.globalUiEm.addListener(
            "MapUi",
            FactoryEvent.OPEN_SCREENSHOT_VIEW,
            function() {
                new ScreenshotUi(self.factory, { tileSize: self.tileSize },
                    self.backgroundLayer.getCanvas(),
                    self.componentLayer.getCanvas(),
                    self.packageLayer.getCanvas()).open();
            }
        );
    };
    
    /**
     * Refresh the map display
     */
    MapUi.prototype.refresh = function() {
        // Refresh all layers
        this.backgroundLayer.refresh && this.backgroundLayer.refresh();
        this.componentLayer.refresh && this.componentLayer.refresh();
        this.areasLayer.refresh && this.areasLayer.refresh();
    };
    
    /**
     * Take a screenshot of the current map
     * @returns {string} Data URL of the screenshot
     */
    MapUi.prototype.takeScreenshot = function() {
        // This would be handled by the ScreenshotUi layer
        return null;
    };
    
    /**
     * Clean up resources and event listeners
     */
    MapUi.prototype.destroy = function() {
        // Remove event listeners
        this.factory.getEventManager().removeListenerForType("MapUi");

        // Clean up layers
        this.backgroundLayer.destroy();
        this.componentLayer.destroy();
        this.packageLayer.destroy();
        this.mouseLayer.destroy();
        this.areasLayer.destroy();

        // Clean up DOM
        if (this.container) {
            this.container.html("");
            this.container = null;
        }
    };

    return MapUi;
});
