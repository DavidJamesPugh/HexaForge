/**
 * MouseLayer - Mouse interactions, hover effects, and component placement/removal
 * Extracted from original_app.js
 */
define("ui/factory/mapLayers/MouseLayer", [
    "game/Component"
], function(Component) {

    console.log("MouseLayer module loading...");

    /**
     * MouseLayer constructor
     * @param {Object} imageMap - ImageMap instance
     * @param {Object} factory - Factory instance
     * @param {Object} options - Options with tileSize
     */
    var MouseLayer = function(imageMap, factory, options) {
        console.log("MouseLayer constructor called");
        this.imageMap = imageMap;
        this.factory = factory;
        this.game = factory.getGame();
        this.tileSize = (options && options.tileSize) ? options.tileSize : 21;

        // Create canvas
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.factory.getMeta().tilesX * this.tileSize;
        this.canvas.height = this.factory.getMeta().tilesY * this.tileSize;
        this.canvas.className = 'mouse-canvas';
        this.canvas.style.position = 'absolute';
        this.canvas.style.left = '0px';
        this.canvas.style.top = '0px';
        this.canvas.style.zIndex = '4';
        this.canvas.style.pointerEvents = 'none';

        this.ctx = this.canvas.getContext('2d', { alpha: true });

        // Load mouse cursor images
        this._loadImages();
    };

    /**
     * Load required images
     * @private
     */
    MouseLayer.prototype._loadImages = function() {
        // Load mouse cursor images
        this.yellowSelectionImage = new Image();
        this.yellowSelectionImage.src = 'img/mouse/yellow.png';

        this.redSelectionImage = new Image();
        this.redSelectionImage.src = 'img/mouse/red.png';

        this.greenSelectionImage = new Image();
        this.greenSelectionImage.src = 'img/mouse/green.png';
    };

    /**
     * Setup mouse event handlers
     */
    MouseLayer.prototype.setupEventHandlers = function() {
        var self = this;

        if (!this.canvas) return;

        // Prevent context menu on right click
        this.canvas.addEventListener('contextmenu', function(e) {
            e.preventDefault();
        });

        this.canvas.addEventListener('mousedown', function(e) {
            self._onMouseDown(e);
        });

        this.canvas.addEventListener('mousemove', function(e) {
            self._onMouseMove(e);
            if (self.isPlacingComponent) {
                self._onComponentHover(e);
            }
        });

        this.canvas.addEventListener('mouseup', function(e) {
            self._onMouseUp(e);
        });

        this.canvas.addEventListener('wheel', function(e) {
            self._onWheel(e);
        });

        // Clear hover position when mouse leaves canvas
        this.canvas.addEventListener('mouseleave', function(e) {
            self._clearHoverPosition();
            // Redraw to hide any hover effects
            if (self.onRenderDynamicElements) {
                self.onRenderDynamicElements();
            }
        });
    };

    /**
     * Set callback for rendering dynamic elements
     */
    MouseLayer.prototype.setRenderCallback = function(callback) {
        this.onRenderDynamicElements = callback;
    };

    /**
     * Set viewport element for boundary constraints
     */
    MouseLayer.prototype.setViewportElement = function(element) {
        this.viewportEl = element;
    };

    /**
     * Set offset values
     */
    MouseLayer.prototype.setOffsets = function(offsetX, offsetY) {
        this.offsetX = offsetX;
        this.offsetY = offsetY;
    };

    /**
     * Get current offsets
     */
    MouseLayer.prototype.getOffsets = function() {
        return { offsetX: this.offsetX, offsetY: this.offsetY };
    };

    /**
     * Mouse down handler
     * @private
     */
    MouseLayer.prototype._onMouseDown = function(e) {
        if (e.button === 0) { // Left click
            var rect = this.canvas.getBoundingClientRect();
            var mouseX = e.clientX - rect.left;
            var mouseY = e.clientY - rect.top;

            // Check if we're placing a component
            if (this.selectedComponentId && this.selectedComponentId !== "noComponent") {
                var meta = this._getComponentMeta(this.selectedComponentId);
                if (meta && meta.drawStrategy === "track") {
                    this._beginTrackPlacement(e);
                } else {
                    this._placeComponent(mouseX, mouseY);
                }
            } else {
                // Start dragging
                console.log("MouseLayer: Mouse down at", e.clientX, e.clientY);
                this.isDragging = true;
                this.canvas.style.cursor = 'grabbing';
                this.dragStartX = e.clientX - this.offsetX;
                this.dragStartY = e.clientY - this.offsetY;
                console.log("MouseLayer: Drag start - offsetX:", this.offsetX, "offsetY:", this.offsetY);

                // Attach document-level listeners so dragging continues outside canvas/container
                this._attachDocumentDragListeners();
                // Prevent text selection during drag
                if (document && document.body) {
                    document.body.style.userSelect = 'none';
                }
                e.preventDefault();
            }
        } else if (e.button === 2) { // Right click
            // Start component removal mode
            console.log("MouseLayer: Start component removal mode");
            this._beginComponentRemoval(e);
            e.preventDefault();
        }
    };

    /**
     * Mouse move handler
     * @private
     */
    MouseLayer.prototype._onMouseMove = function(e) {
        if (this.isDragging) {
            var newOffsetX = e.clientX - this.dragStartX;
            var newOffsetY = e.clientY - this.dragStartY;


            // Apply boundary constraints against preferred viewport (.mapContainer -> parent -> #gameArea)
            var vp = this.viewportEl || document.getElementById('gameArea');
            var viewportWidth = vp ? vp.clientWidth : 0;
            var viewportHeight = vp ? vp.clientHeight : 0;
            var mapWidth = this.canvas.width;
            var mapHeight = this.canvas.height;

            var minX = Math.min(0, viewportWidth - mapWidth-220);
            var maxX = 0;
            var minY = Math.min(0, viewportHeight - mapHeight-125);
            var maxY = 0;

            this.offsetX = Math.max(minX, Math.min(maxX, newOffsetX));
            this.offsetY = Math.max(minY, Math.min(maxY, newOffsetY));

            if (this.onUpdateTransform) {
                this.onUpdateTransform(this.offsetX, this.offsetY);
            }
        }
        // Track placement drag
        if (this._isPlacingTrack) {
            var rect = this.canvas.getBoundingClientRect();
            var mouseX = e.clientX - rect.left;
            var mouseY = e.clientY - rect.top;
            var tileX = Math.floor(mouseX / this.tileSize);
            var tileY = Math.floor(mouseY / this.tileSize);
            if (tileX !== this._lastTrackTileX || tileY !== this._lastTrackTileY) {
                // Check if drag direction has changed (corner piece)
                var newDirection = this._determineDragDirection(tileX, tileY);
                if (newDirection !== this._dragDirection) {
                    // Direction changed - this is a corner piece
                    this._dragDirection = newDirection;
                }

                this._placeTransportTile(tileX, tileY);
                this._lastTrackTileX = tileX;
                this._lastTrackTileY = tileY;
            }
        }

        // Component removal drag
        if (this._isRemovingComponents) {
            var rect = this.canvas.getBoundingClientRect();
            var mouseX = e.clientX - rect.left;
            var mouseY = e.clientY - rect.top;
            var tileX = Math.floor(mouseX / this.tileSize);
            var tileY = Math.floor(mouseY / this.tileSize);
            if (tileX !== this._lastRemovedTileX || tileY !== this._lastRemovedTileY) {
                this._removeComponentAtTile(tileX, tileY);
                this._lastRemovedTileX = tileX;
                this._lastRemovedTileY = tileY;
            }
        }
    };

    /**
     * Mouse up handler
     * @private
     */
    MouseLayer.prototype._onMouseUp = function(e) {
        if (e.button === 0) {
            console.log("MouseLayer: Drag end - offsetX:", this.offsetX, "offsetY:", this.offsetY);
            this.isDragging = false;
            this.canvas.style.cursor = 'grab';
            this._detachDocumentDragListeners();
            if (document && document.body) {
                document.body.style.userSelect = '';
            }
            if (this._isPlacingTrack) {
                this._endTrackPlacement();
            }
        } else if (e.button === 2) { // Right click
            // End component removal mode
            console.log("MouseLayer: End component removal mode");
            this._endComponentRemoval();
        }
    };

    /**
     * Mouse wheel handler for zooming
     * @private
     */
    MouseLayer.prototype._onWheel = function(e) {
        e.preventDefault();
        var scale = e.deltaY > 0 ? 0.9 : 1.1;
        this._zoom(scale, e.offsetX, e.offsetY);
    };

    /**
     * Zoom the canvas
     * @private
     */
    MouseLayer.prototype._zoom = function(scale, centerX, centerY) {
        // TODO: Implement zooming
    };

    /**
     * Handle component hover for placement preview
     * @private
     */
    MouseLayer.prototype._onComponentHover = function(e) {
        var rect = this.canvas.getBoundingClientRect();
        var mouseX = e.clientX - rect.left;
        var mouseY = e.clientY - rect.top;

        // Convert to tile coordinates (do not subtract offsetX/offsetY since CSS transform already applied)
        var tileX = Math.floor(mouseX / this.tileSize);
        var tileY = Math.floor(mouseY / this.tileSize);

        // Check if we've moved to a different tile
        if (this.hoverTileX !== tileX || this.hoverTileY !== tileY) {
            // Store new hover position
            this.hoverTileX = tileX;
            this.hoverTileY = tileY;

            // Redraw only dynamic elements to show hover feedback
            if (this.onRenderDynamicElements) {
                this.onRenderDynamicElements();
            }
        }
    };

    /**
     * Clear hover position to prevent ghost images
     * @private
     */
    MouseLayer.prototype._clearHoverPosition = function() {
        this.hoverTileX = undefined;
        this.hoverTileY = undefined;
    };

    /**
     * Attach document-level listeners for dragging outside canvas
     * @private
     */
    MouseLayer.prototype._attachDocumentDragListeners = function() {
        if (!this._docMouseMove) {
            this._docMouseMove = this._onMouseMove.bind(this);
            document.addEventListener('mousemove', this._docMouseMove);
        }
        if (!this._docMouseUp) {
            this._docMouseUp = this._onMouseUp.bind(this);
            document.addEventListener('mouseup', this._docMouseUp);
        }
    };

    /**
     * Detach document-level listeners added during dragging
     * @private
     */
    MouseLayer.prototype._detachDocumentDragListeners = function() {
        if (this._docMouseMove) {
            document.removeEventListener('mousemove', this._docMouseMove);
            this._docMouseMove = null;
        }
        if (this._docMouseUp) {
            document.removeEventListener('mouseup', this._docMouseUp);
            this._docMouseUp = null;
        }
    };

    /**
     * Begin drag placement for track
     * @private
     */
    MouseLayer.prototype._beginTrackPlacement = function(e) {
        var rect = this.canvas.getBoundingClientRect();
        var mouseX = e.clientX - rect.left;
        var mouseY = e.clientY - rect.top;
        var tileX = Math.floor(mouseX / this.tileSize);
        var tileY = Math.floor(mouseY / this.tileSize);
        this._trackComponentMeta = this._getComponentMeta(this.selectedComponentId);
        this._isPlacingTrack = true;
        this._lastTrackTileX = tileX;
        this._lastTrackTileY = tileY;
        this._dragStartX = tileX;
        this._dragStartY = tileY;
        this._dragDirection = null; // Will be set on first move
        this._placeTransportTile(tileX, tileY);
        // Attach doc listeners to continue placing while dragging outside
        if (!this._docPlaceMove) {
            this._docPlaceMove = this._onMouseMove.bind(this);
            document.addEventListener('mousemove', this._docPlaceMove);
        }
        if (!this._docPlaceUp) {
            this._docPlaceUp = this._onMouseUp.bind(this);
            document.addEventListener('mouseup', this._docPlaceUp);
        }
        e.preventDefault();
    };

    /**
     * End track placement
     * @private
     */
    MouseLayer.prototype._endTrackPlacement = function() {
        this._isPlacingTrack = false;
        this._trackComponentMeta = null;
        this._lastTrackTileX = null;
        this._lastTrackTileY = null;
        this._dragStartX = null;
        this._dragStartY = null;
        this._dragDirection = null;
        if (this._docPlaceMove) {
            document.removeEventListener('mousemove', this._docPlaceMove);
            this._docPlaceMove = null;
        }
        if (this._docPlaceUp) {
            document.removeEventListener('mouseup', this._docPlaceUp);
            this._docPlaceUp = null;
        }
    };

    /**
     * Place transport tile
     * @private
     */
    MouseLayer.prototype._placeTransportTile = function(tileX, tileY) {
        var meta = this.factory.getMeta();
        if (tileX < 0 || tileX >= meta.tilesX || tileY < 0 || tileY >= meta.tilesY) return;

        // Check if tile is buildable
        var buildMap = meta.buildMap;
        if (!buildMap) return;
        var index = tileY * meta.tilesX + tileX;
        var buildable = buildMap[index];
        if (buildable !== ' ' && buildable !== '-') return;

        // Check if tile already has a component
        var existingComponent = this._getComponentAt(tileX, tileY);
        if (existingComponent) return;

        // Determine drag direction if this is the first move
        if (this._dragDirection === null) {
            this._dragDirection = this._determineDragDirection(tileX, tileY);
        }

        // Create a proper track component with input/output manager
        var trackComponent = this._createTrackComponent(tileX, tileY);
        if (!trackComponent) return;

        // Add to factory's component list
        if (!this.factory.components) {
            this.factory.components = [];
        }
        this.factory.components.push(trackComponent);

        // Update transport line connections for proper rendering
        if (this.onUpdateTransportLineConnections) {
            this.onUpdateTransportLineConnections();
        }

        if (this.onRenderDynamicElements) {
            this.onRenderDynamicElements();
        }
    };

    /**
     * Determine the primary drag direction
     * @private
     */
    MouseLayer.prototype._determineDragDirection = function(tileX, tileY) {
        var deltaX = tileX - this._dragStartX;
        var deltaY = tileY - this._dragStartY;

        // Determine primary direction (horizontal or vertical)
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            return deltaX > 0 ? 'right' : 'left';
        } else {
            return deltaY > 0 ? 'down' : 'up';
        }
    };

    /**
     * Create a track component with proper input/output management
     * @private
     */
    MouseLayer.prototype._createTrackComponent = function(tileX, tileY) {
        var meta = this.factory.getMeta();

        // Create the component object with a fresh input/output manager
        var component = {
            id: "transportLine",
            x: tileX,
            y: tileY,
            width: 1,
            height: 1,
            meta: { id: "transportLine", drawStrategy: "track" },
            // Add input/output manager like the original app
            getInputOutputManager: function() {
                return this._inputOutputManager;
            },
            _inputOutputManager: {
                getInputsByDirection: function() {
                    return this._inputs;
                },
                getOutputsByDirection: function() {
                    return this._outputs;
                },
                _inputs: { top: false, right: false, bottom: false, left: false },
                _outputs: { top: false, right: false, bottom: false, left: false }
            }
        };

        // Determine input/output directions based on drag direction and neighboring tracks
        this._updateTrackConnections(component);

        return component;
    };

    /**
     * Update track input/output connections based on neighboring tracks and drag direction
     * @private
     */
    MouseLayer.prototype._updateTrackConnections = function(trackComponent) {
        var x = trackComponent.x;
        var y = trackComponent.y;
        var inputs = trackComponent._inputOutputManager._inputs;
        var outputs = trackComponent._inputOutputManager._outputs;

        // Reset all connections
        inputs.top = inputs.right = inputs.bottom = inputs.left = false;
        outputs.top = outputs.right = outputs.bottom = outputs.left = false;

        // Check for neighboring tracks
        var neighbors = this._getNeighboringTracks(x, y);

        // If this is the first track (no neighbors), it should be neutral
        var hasNeighbors = neighbors.top || neighbors.right || neighbors.bottom || neighbors.left;

        if (!hasNeighbors) {
            // First track - no inputs or outputs (pattern "0000" -> "0000")
            // This will render as sprite n: 0 (neutral track)
            return;
        }

        // For subsequent tracks, set ONLY outputs based on drag direction
        // The original app NEVER sets inputs - they remain "0000"
        // Only outputs are set to show the flow direction

        if (this._dragDirection === 'right') {
            // Dragging right: output to right (where we're going)
            outputs.right = true;
        } else if (this._dragDirection === 'left') {
            // Dragging left: output to left (where we're going)
            outputs.left = true;
        } else if (this._dragDirection === 'down') {
            // Dragging down: output to bottom (where we're going)
            outputs.bottom = true;
        } else if (this._dragDirection === 'up') {
            // Dragging up: output to top (where we're going)
            outputs.top = true;
        }

        // Handle corner pieces when drag direction changes
        this._handleCornerPiece(trackComponent, neighbors);
    };

    /**
     * Handle corner pieces when the drag direction changes
     * @private
     */
    MouseLayer.prototype._handleCornerPiece = function(trackComponent, neighbors) {
        var x = trackComponent.x;
        var y = trackComponent.y;
        var inputs = trackComponent._inputOutputManager._inputs;
        var outputs = trackComponent._inputOutputManager._outputs;

        // Check if this is a corner piece (has neighbors in perpendicular directions)
        var hasPerpendicularNeighbors = false;
        var perpendicularDirection = null;

        if (this._dragDirection === 'right' || this._dragDirection === 'left') {
            // Horizontal drag - check for vertical neighbors
            if (neighbors.top || neighbors.bottom) {
                hasPerpendicularNeighbors = true;
                if (neighbors.top) {
                    perpendicularDirection = 'top';
                }
                if (neighbors.bottom) {
                    perpendicularDirection = 'bottom';
                }
            }
        } else if (this._dragDirection === 'up' || this._dragDirection === 'down') {
            // Vertical drag - check for horizontal neighbors
            if (neighbors.left || neighbors.right) {
                hasPerpendicularNeighbors = true;
                if (neighbors.left) {
                    perpendicularDirection = 'left';
                }
                if (neighbors.right) {
                    perpendicularDirection = 'right';
                }
            }
        }

        // If this is a corner piece, we need to set outputs in both directions
        // But remember: inputs remain "0000" (no inputs) as per original app
        if (hasPerpendicularNeighbors) {
            // Set output in the main drag direction (already set above)
            // Also set output in the perpendicular direction
            if (perpendicularDirection === 'top') {
                outputs.top = true;
            } else if (perpendicularDirection === 'bottom') {
                outputs.bottom = true;
            } else if (perpendicularDirection === 'left') {
                outputs.left = true;
            } else if (perpendicularDirection === 'right') {
                outputs.right = true;
            }
        }
    };

    /**
     * Get neighboring tracks at a position
     * @private
     */
    MouseLayer.prototype._getNeighboringTracks = function(x, y) {
        var neighbors = { top: false, right: false, bottom: false, left: false };

        // Check factory components
        if (this.factory.components) {
            for (var i = 0; i < this.factory.components.length; i++) {
                var comp = this.factory.components[i];
                if (comp.meta && comp.meta.id === 'transportLine') {
                    if (comp.x === x && comp.y === y - 1) neighbors.top = true;
                    if (comp.x === x + 1 && comp.y === y) neighbors.right = true;
                    if (comp.x === x && comp.y === y + 1) neighbors.bottom = true;
                    if (comp.x === x - 1 && comp.y === y) neighbors.left = true;
                }
            }
        }

        // Also check meta components
        var meta = this.factory.getMeta();
        if (meta.components) {
            for (var i = 0; i < meta.components.length; i++) {
                var comp = meta.components[i];
                if (comp.meta && comp.meta.id === 'transportLine') {
                    if (comp.x === x && comp.y === y - 1) neighbors.top = true;
                    if (comp.x === x + 1 && comp.y === y) neighbors.right = true;
                    if (comp.x === x && comp.y === y + 1) neighbors.bottom = true;
                    if (comp.x === x - 1 && comp.y === y) neighbors.left = true;
                }
            }
        }

        return neighbors;
    };

    /**
     * Place a component on the map
     * @private
     */
    MouseLayer.prototype._placeComponent = function(mouseX, mouseY) {
        var meta = this.factory.getMeta();
        var tileX = Math.floor(mouseX / this.tileSize);
        var tileY = Math.floor(mouseY / this.tileSize);

        console.log("MouseLayer: Attempting to place component at tile:", tileX, tileY);

        // Check if tile is within map bounds
        if (tileX < 0 || tileX >= meta.tilesX || tileY < 0 || tileY >= meta.tilesY) {
            console.log("MouseLayer: Placement outside map bounds:", tileX, tileY);
            return;
        }

        // Get component metadata
        var componentMeta = this._getComponentMeta(this.selectedComponentId);
        if (!componentMeta) {
            console.log("MouseLayer: Component not found:", this.selectedComponentId);
            return;
        }

        console.log("MouseLayer: Component meta:", componentMeta);

        // Check if component fits at this location
        if (!this._canPlaceComponent(componentMeta, tileX, tileY)) {
            console.log("MouseLayer: Cannot place component at", tileX, tileY);
            return;
        }

        // Place the component
        this._addComponentToMap(componentMeta, tileX, tileY);

        // Don't clear selection - allow multiple placements
        // this.factory.getEventManager().invokeEvent(FactoryEvent.COMPONENT_META_SELECTED, "noComponent");

        // Redraw the map to show the new component
        if (this.onRenderMap) {
            this.onRenderMap(false); // Allow terrain refresh when placing components
        }

        console.log("MouseLayer: Successfully placed", this.selectedComponentId, "at", tileX, tileY);
    };

    /**
     * Check if a component can be placed at the given location
     * @private
     */
    MouseLayer.prototype._canPlaceComponent = function(componentMeta, tileX, tileY) {
        var meta = this.factory.getMeta();
        var buildMap = meta.buildMap;

        console.log("MouseLayer: Checking placement for", componentMeta.id, "at", tileX, tileY);
        console.log("MouseLayer: Component dimensions:", componentMeta.width || 1, "x", componentMeta.height || 1);

        // Allow placement when all tiles are buildable: " " (yes) or "-" (partial)
        if (!buildMap) {
            console.log("MouseLayer: No buildMap available");
            return false;
        }

        // Check if all tiles for the component are buildable and unoccupied
        for (var y = 0; y < (componentMeta.height || 1); y++) {
            for (var x = 0; x < (componentMeta.width || 1); x++) {
                var checkX = tileX + x;
                var checkY = tileY + y;

                // Check bounds
                if (checkX < 0 || checkX >= meta.tilesX || checkY < 0 || checkY >= meta.tilesY) {
                    console.log("MouseLayer: Component extends beyond map bounds at", checkX, checkY);
                    return false;
                }

                // Check if tile is buildable (only floor tiles " " or "-")
                var index = checkY * meta.tilesX + checkX;
                var buildable = buildMap[index];
                console.log("MouseLayer: Tile at", checkX, checkY, "buildable:", buildable);

                // Red tiles (anything other than space or dash) are not buildable
                if (buildable !== " " && buildable !== "-") {
                    console.log("MouseLayer: Cannot build on tile type:", buildable);
                    return false;
                }

                // Check if tile already has a component
                var existingComponent = this._getComponentAt(checkX, checkY);
                if (existingComponent) {
                    console.log("MouseLayer: Tile at", checkX, checkY, "already has component:", existingComponent.getMeta ? existingComponent.getMeta().id : existingComponent.id);
                    return false;
                }
            }
        }

        console.log("MouseLayer: Component can be placed at", tileX, tileY);
        return true;
    };

    /**
     * Add a component to the map
     * @private
     */
    MouseLayer.prototype._addComponentToMap = function(componentMeta, tileX, tileY) {
        // Create component instance using the imported Component class
        var component = new Component(this.factory, tileX, tileY, componentMeta);

        // Place component on the main tile
        var mainTile = this.factory.getTileAt(tileX, tileY);
        if (mainTile) {
            mainTile.setComponent(component);

            // For multi-tile components, mark surrounding tiles as occupied
            var width = componentMeta.width || 1;
            var height = componentMeta.height || 1;

            for (var dx = 0; dx < width; dx++) {
                for (var dy = 0; dy < height; dy++) {
                    if (dx !== 0 || dy !== 0) { // Skip main tile
                        var occupiedTile = this.factory.getTileAt(tileX + dx, tileY + dy);
                        if (occupiedTile) {
                            // Mark as occupied by this component (you might want to implement this)
                            // occupiedTile.setOccupiedBy(component);
                        }
                    }
                }
            }
        } else {
            console.warn("MouseLayer: Could not find main tile at", tileX, tileY, "for component", componentMeta.id);
        }
    };

    /**
     * Get component metadata by ID
     * @private
     */
    MouseLayer.prototype._getComponentMeta = function(componentId) {
        // Try to get from game meta first
        var gameMeta = this.factory.getGame().getMeta();
        if (gameMeta && gameMeta.componentsById && gameMeta.componentsById[componentId]) {
            return gameMeta.componentsById[componentId];
        }

        // Fallback to hardcoded components
        var components = this._getHardcodedComponents();
        return components[componentId];
    };

    /**
     * Get hardcoded component definitions as fallback
     * @private
     */
    MouseLayer.prototype._getHardcodedComponents = function() {
        return {
            "transportLine": { id: "transportLine", width: 1, height: 1, spriteX: 0, spriteY: 0, name: "Conveyor" },
            "ironBuyer": { id: "ironBuyer", width: 2, height: 2, spriteX: 4, spriteY: 0, name: "Iron ore buyer" },
            "ironFoundry": { id: "ironFoundry", width: 4, height: 2, spriteX: 0, spriteY: 0, name: "Iron foundry" },
            "ironSeller": { id: "ironSeller", width: 1, height: 2, spriteX: 6, spriteY: 0, name: "Iron seller" },
            "coalBuyer": { id: "coalBuyer", width: 2, height: 1, spriteX: 0, spriteY: 2, name: "Coal buyer" },
            "steelFoundry": { id: "steelFoundry", width: 3, height: 3, spriteX: 0, spriteY: 3, name: "Steel foundry" },
            "steelSeller": { id: "steelSeller", width: 2, height: 2, spriteX: 3, spriteY: 3, name: "Steel seller" }
        };
    };

    /**
     * Get component at specific tile coordinates
     * @private
     */
    MouseLayer.prototype._getComponentAt = function(tileX, tileY) {
        // Check tile for component
        var tile = this.factory.getTileAt(tileX, tileY);
        if (tile) {
            var component = tile.getComponent();
            if (component) {
                return component;
            }
        }

        // Fallback: Check factory components array (for backward compatibility)
        if (this.factory.components) {
            for (var i = 0; i < this.factory.components.length; i++) {
                var comp = this.factory.components[i];
                if (comp.x === tileX && comp.y === tileY) {
                    return comp;
                }
            }
        }

        // Fallback to meta components
        var meta = this.factory.getMeta();
        var components = meta.components || [];

        for (var i = 0; i < components.length; i++) {
            var comp = components[i];
            if (comp.x === tileX && comp.y === tileY) {
                return comp;
            }
        }
        return null;
    };

    /**
     * Begin component removal mode
     * @private
     */
    MouseLayer.prototype._beginComponentRemoval = function(e) {
        var rect = this.canvas.getBoundingClientRect();
        var mouseX = e.clientX - rect.left;
        var mouseY = e.clientY - rect.top;
        var tileX = Math.floor(mouseX / this.tileSize);
        var tileY = Math.floor(mouseY / this.tileSize);

        this._isRemovingComponents = true;
        this._lastRemovedTileX = tileX;
        this._lastRemovedTileY = tileY;

        // Remove component at initial position
        this._removeComponentAtTile(tileX, tileY);

        // Attach document listeners to continue removing while dragging outside
        if (!this._docPlaceMove) {
            this._docPlaceMove = this._onMouseMove.bind(this);
            document.addEventListener('mousemove', this._docPlaceMove);
        }
        if (!this._docPlaceUp) {
            this._docPlaceUp = this._onMouseUp.bind(this);
            document.addEventListener('mouseup', this._docPlaceUp);
        }

        e.preventDefault();
    };

    /**
     * End component removal mode
     * @private
     */
    MouseLayer.prototype._endComponentRemoval = function() {
        this._isRemovingComponents = false;
        this._lastRemovedTileX = null;
        this._lastRemovedTileY = null;

        // Detach document listeners
        if (this._docPlaceMove) {
            document.removeEventListener('mousemove', this._docPlaceMove);
            this._docPlaceMove = null;
        }
        if (this._docPlaceUp) {
            document.removeEventListener('mouseup', this._docPlaceUp);
            this._docPlaceUp = null;
        }
    };

    /**
     * Remove component at specific tile coordinates
     * @private
     */
    MouseLayer.prototype._removeComponentAtTile = function(tileX, tileY) {
        console.log("MouseLayer: Removing component at", tileX, tileY);

        // Find component that covers this tile (considering component dimensions)
        var component = this._getComponentAtFootprint(tileX, tileY);
        console.log("MouseLayer: Component found:", component);

        if (component) {
            // Store component dimensions before removal
            var componentWidth = component.meta ? (component.meta.width || 1) : 1;
            var componentHeight = component.meta ? (component.meta.height || 1) : 1;
            var componentX = component.x;
            var componentY = component.y;

            // Remove from factory components
            if (this.factory.components) {
                var index = this.factory.components.indexOf(component);
                if (index > -1) {
                    this.factory.components.splice(index, 1);
                }
            }

            // Also check if this is a meta component (startComponents) and remove it
            var meta = this.factory.getMeta();
            if (meta.startComponents) {
                for (var i = meta.startComponents.length - 1; i >= 0; i--) {
                    var startComp = meta.startComponents[i];
                    if (startComp.x === componentX && startComp.y === componentY &&
                        startComp.id === (component.id || component.meta?.id)) {
                        meta.startComponents.splice(i, 1);
                        break;
                    }
                }
            }

            // Update transport line connections if this was a track
            if (component.meta && component.meta.drawStrategy === 'track') {
                if (this.onUpdateTransportLineConnections) {
                    this.onUpdateTransportLineConnections();
                }
            }

            // Redraw floor terrain over the removed component area
            if (this.onRedrawFloorOverComponent) {
                this.onRedrawFloorOverComponent(componentX, componentY, componentWidth, componentHeight);
            }

            // Redraw to show the removal
            if (this.onRenderDynamicElements) {
                this.onRenderDynamicElements();
            }

            console.log("MouseLayer: Removed component at", componentX, componentY, "with dimensions", componentWidth, "x", componentHeight);
        }
    };

    /**
     * Get component that covers a specific tile (considering component dimensions)
     * @private
     */
    MouseLayer.prototype._getComponentAtFootprint = function(tileX, tileY) {
        // Check factory components first
        if (this.factory.components) {
            for (var i = 0; i < this.factory.components.length; i++) {
                var comp = this.factory.components[i];
                var compWidth = comp.meta ? (comp.meta.width || 1) : 1;
                var compHeight = comp.meta ? (comp.meta.height || 1) : 1;

                // Check if the tile is within this component's footprint
                if (tileX >= comp.x && tileX < comp.x + compWidth &&
                    tileY >= comp.y && tileY < comp.y + compHeight) {
                    return comp;
                }
            }
        }

        // Fallback to meta components
        var meta = this.factory.getMeta();
        if (meta.components) {
            for (var i = 0; i < meta.components.length; i++) {
                var comp = meta.components[i];
                var compWidth = comp.meta ? (comp.meta.width || 1) : 1;
                var compHeight = comp.meta ? (comp.meta.height || 1) : 1;

                // Check if the tile is within this component's footprint
                if (tileX >= comp.x && tileX < comp.x + compWidth &&
                    tileY >= comp.y && tileY < comp.y + compHeight) {
                    return comp;
                }
            }
        }

        return null;
    };

    /**
     * Set selected component ID
     */
    MouseLayer.prototype.setSelectedComponentId = function(componentId) {
        this.selectedComponentId = componentId;
        console.log("MouseLayer: Component selected:", componentId);

        // Update placement mode
        if (componentId && componentId !== "noComponent") {
            this.isPlacingComponent = true;
            this.shouldDrawBuildableAreas = true;
            if (this.canvas) this.canvas.style.cursor = 'crosshair';
            // Clear any previous hover position
            this._clearHoverPosition();
        } else {
            this.isPlacingComponent = false;
            this.shouldDrawBuildableAreas = false;
            if (this.canvas) this.canvas.style.cursor = 'grab';
            // Clear hover position
            this._clearHoverPosition();
        }

        // Redraw dynamic layer only to avoid terrain re-randomization
        if (this.onRenderDynamicElements) {
            this.onRenderDynamicElements();
        }
    };

    /**
     * Get hover position
     */
    MouseLayer.prototype.getHoverPosition = function() {
        return { tileX: this.hoverTileX, tileY: this.hoverTileY };
    };

    /**
     * Display the mouse layer in the specified container
     * @param {Object} container - Container element (jQuery object)
     */
    MouseLayer.prototype.display = function(container) {
        container.append(this.canvas);
        // Mouse layer is for displaying cursor feedback, no initial render needed
    };

    /**
     * Get the canvas element
     * @returns {HTMLCanvasElement}
     */
    MouseLayer.prototype.getCanvas = function() {
        return this.canvas;
    };

    /**
     * Refresh the mouse layer
     */
    MouseLayer.prototype.refresh = function() {
        // Mouse layer typically doesn't need refreshing as it shows dynamic cursor feedback
    };

    /**
     * Clean up resources
     */
    MouseLayer.prototype.destroy = function() {
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
        this.canvas = null;
        this.ctx = null;
        this.yellowSelectionImage = null;
        this.redSelectionImage = null;
        this.greenSelectionImage = null;
    };

    return MouseLayer;
});
