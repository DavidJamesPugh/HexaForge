/**
 * MapUi - Factory map display and interaction
 * Extracted from original_app.js
 */
define("ui/factory/MapUi", [
    "config/event/FactoryEvent"
], function(FactoryEvent) {
    
    /**
     * MapUi constructor
     * @param {Object} factory - The factory instance
     * @param {Object} game - The game instance
     */
    var MapUi = function(factory) {
        this.factory = factory;
        this.game = factory.getGame();
        this.tileSize = 21; // Standard tile size
        this.offsetX = 0;
        this.offsetY = 0;
        this.isDragging = false;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this._docMouseMove = null;
        this._docMouseUp = null;
        this._docPlaceMove = null;
        this._docPlaceUp = null;
        this._isPlacingTrack = false;
        this._trackComponentMeta = null;
        this._lastTrackTileX = null;
        this._lastTrackTileY = null;
        this._isRemovingComponents = false; // Track if we're removing components
        this._lastRemovedTileX = null; // Track last removed tile to avoid duplicates
        this._lastRemovedTileY = null;
        this.viewportEl = null; // Preferred viewport element for clamping
        this.selectedComponentId = null; // Track selected component for placement
        this.shouldDrawBuildableAreas = false; // Show buildable areas when component selected
        this.isPlacingComponent = false; // Track if we're in component placement mode
        this._terrainRendered = false; // Track if terrain has been rendered
        this.hoverTileX = undefined; // Track hover tile X position
        this.hoverTileY = undefined; // Track hover tile Y position
        
        // Load images
        this._loadImages();
        
        // Create canvas
        this._createCanvas();
        
        // Set up event listeners
        this._setupEventHandlers();
    };
    
    /**
     * Initialize the MapUi
     * @private
     */
    MapUi.prototype._init = function() {
        this._createCanvas();
        this._loadImages();
        this._setupEventHandlers();
    };
    
    /**
     * Create the canvas element
     * @private
     */
    MapUi.prototype._createCanvas = function() {
        var meta = this.factory.getMeta();
        var width = meta.tilesX * this.tileSize;
        var height = meta.tilesY * this.tileSize;
        
        this.canvas = document.createElement('canvas');
        this.canvas.width = width;
        this.canvas.height = height;
        this.canvas.className = 'map-canvas';
        this.canvas.style.border = '1px solid #333';
        this.canvas.style.cursor = 'grab';
        
        this.ctx = this.canvas.getContext('2d');

        // Create an overlay canvas for selection/highlight (prevents ghosting)
        this.overlayCanvas = document.createElement('canvas');
        this.overlayCanvas.width = width;
        this.overlayCanvas.height = height;
        this.overlayCanvas.className = 'map-overlay-canvas';
        this.overlayCanvas.style.position = 'absolute';
        this.overlayCanvas.style.left = '0px';
        this.overlayCanvas.style.top = '0px';
        this.overlayCanvas.style.zIndex = '5';
        this.overlayCanvas.style.pointerEvents = 'none';
        this.overlayCtx = this.overlayCanvas.getContext('2d', { alpha: true });
    };
    
    /**
     * Load required images
     * @private
     */
    MapUi.prototype._loadImages = function() {
        var self = this;
        
        // Load terrains.png
        this.terrainsImage = new Image();
        this.terrainsImage.onload = function() {
            self._renderTerrain();
        };
        this.terrainsImage.src = 'img/terrains.png';
        
        // Load components.png
        this.componentsImage = new Image();
        this.componentsImage.onload = function() {
            self._renderComponents();
        };
        this.componentsImage.src = 'img/components.png';
        
        // Load transportLine.png
        this.transportLineImage = new Image();
        this.transportLineImage.onload = function() {
            self._renderTransportLines();
        };
        this.transportLineImage.src = 'img/transportLine.png';
        
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
     * @private
     */
    MapUi.prototype._setupEventHandlers = function() {
        var self = this;
        
        // Prevent context menu on right click
        this.canvas.addEventListener('contextmenu', function(e) {
            e.preventDefault();
        });
        
        this.canvas.addEventListener('mousedown', function(e) {
            self._onMouseDown(e);
        });
        
        this.canvas.addEventListener('mousemove', function(e) {
            self._onMouseMove(e);
        });
        
        this.canvas.addEventListener('mouseup', function(e) {
            self._onMouseUp(e);
        });
        
        this.canvas.addEventListener('wheel', function(e) {
            self._onWheel(e);
        });
        
        // Add mouse move for hover feedback
        this.canvas.addEventListener('mousemove', function(e) {
            self._onMouseMove(e);
            if (self.isPlacingComponent) {
                self._onComponentHover(e);
            }
        });
        
        // Clear hover position when mouse leaves canvas
        this.canvas.addEventListener('mouseleave', function(e) {
            self._clearHoverPosition();
            // Redraw to hide any hover effects
            self._renderDynamicElements();
        });
    };
    
    /**
     * Mouse down handler
     * @private
     */
    MapUi.prototype._onMouseDown = function(e) {
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
                console.log("MapUi: Mouse down at", e.clientX, e.clientY);
                this.isDragging = true;
                this.canvas.style.cursor = 'grabbing';
                this.dragStartX = e.clientX - this.offsetX;
                this.dragStartY = e.clientY - this.offsetY;
                console.log("MapUi: Drag start - offsetX:", this.offsetX, "offsetY:", this.offsetY);

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
            console.log("MapUi: Start component removal mode");
            this._beginComponentRemoval(e);
            e.preventDefault();
        }
    };
    
    /**
     * Mouse move handler
     * @private
     */
    MapUi.prototype._onMouseMove = function(e) {
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
                        
            this._updateTransform();
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
    MapUi.prototype._onMouseUp = function(e) {
        if (e.button === 0) {
            console.log("MapUi: Drag end - offsetX:", this.offsetX, "offsetY:", this.offsetY);
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
            console.log("MapUi: End component removal mode");
            this._endComponentRemoval();
        }
    };
    
    /**
     * Mouse wheel handler for zooming
     * @private
     */
    MapUi.prototype._onWheel = function(e) {
        e.preventDefault();
        var scale = e.deltaY > 0 ? 0.9 : 1.1;
        this._zoom(scale, e.offsetX, e.offsetY);
    };
    
    /**
     * Update canvas transform
     * @private
     */
    MapUi.prototype._updateTransform = function() {
        this.canvas.style.transform = 'translate(' + this.offsetX + 'px, ' + this.offsetY + 'px)';
        if (this.overlayCanvas) {
            this.overlayCanvas.style.transform = 'translate(' + this.offsetX + 'px, ' + this.offsetY + 'px)';
        }
    };
    
    /**
     * Zoom the canvas
     * @private
     */
    MapUi.prototype._zoom = function(scale, centerX, centerY) {
        // TODO: Implement zooming
    };
    
    /**
     * Render the terrain grid like the original app
     * @private
     */
    MapUi.prototype._renderTerrain = function() {
        if (!this.terrainsImage || !this.ctx) return;
        
        var meta = this.factory.getMeta();
        var terrainMap = meta.terrainMap;
        var terrains = meta.terrains;
        
        if (!terrainMap || !terrains) return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Count terrain types for debugging
        var terrainCounts = {};
        var totalTiles = 0;
        
        // Create terrain mapping like original app
        // NOTE: Use row 10 for wall base to ensure opaque fill under wall borders
        var terrainMapping = { 
            undefined: { y: 0, tiles: 6 }, 
            grass: { y: 0, tiles: 6 }, 
            floor: { y: 1, tiles: 6 }, 
            wall: { y: 1, tiles: 6 }, 
            road: { y: 0, tiles: 6 }  // Note: roads use y:0 but get overridden by drawRoad
        };
        
        // STEP 1: Draw ALL terrain normally (like original app's drawTerrain)
        for (var y = 0; y < meta.tilesY; y++) {
            for (var x = 0; x < meta.tilesX; x++) {
                var index = y * meta.tilesX + x;
                var terrainCode = terrainMap[index];
                var terrainName = terrains[terrainCode];
                
                // Count terrain types
                if (terrainCode) {
                    terrainCounts[terrainCode] = (terrainCounts[terrainCode] || 0) + 1;
                    totalTiles++;
                }
                
                // if (terrainCode === 'X') {
                //     continue;
                // }
                // Get terrain name from factory config
                var terrainName = terrains[terrainCode];
                // Look up terrain data from our mapping
                var terrainData = terrainMapping[terrainName];
                
                if (terrainData && terrainData.y !== undefined && terrainData.tiles !== undefined) {
                    var drawX = x * this.tileSize;
                    var drawY = y * this.tileSize;
                    
                    // Draw ALL terrain normally first (including walls and roads)
                    var variantX = Math.floor(terrainData.tiles * Math.random()) * (this.tileSize + 1);
                    var variantY = terrainData.y * (this.tileSize + 1);
                    
                    this.ctx.drawImage(
                        this.terrainsImage,
                        variantX, variantY,
                        this.tileSize, this.tileSize,
                        drawX, drawY,
                        this.tileSize, this.tileSize
                    );
                } 
            }
        }
        
        // STEP 2: Overlay special details for walls and roads (like original app)
        // Wall borders assume a solid wall base is present (drawn above from row 10)
        //this._renderWallBorders();
        //this._renderRoadDetails();
        
        // STEP 3: Render terrain borders and road details (like original app)
        this._renderTerrainBorders();
        this._renderRoads();
        
        };
    
    
    /**
     * Render pre-placed components
     * @private
     */
    MapUi.prototype._renderComponents = function() {
        if (!this.componentsImage || !this.ctx) return;
        
        var meta = this.factory.getMeta();
        var startComponents = meta.startComponents;
        var componentsById = this.game.getMeta().componentsById;
        
        // Render pre-placed components
        if (startComponents) {
            for (var i = 0; i < startComponents.length; i++) {
                var componentData = startComponents[i];
                var componentId = componentData.id;
                var x = componentData.x;
                var y = componentData.y;
                
                var componentMeta = componentsById[componentId];
                if (!componentMeta || componentMeta.id === "transportLine") continue;
                if (componentMeta && componentMeta.spriteX !== undefined && componentMeta.spriteY !== undefined) {
                    var drawX = x * this.tileSize;
                    var drawY = y * this.tileSize;
                    var tilesW = (componentMeta.width || 1);
                    var tilesH = (componentMeta.height || 1);
                    var g = this.tileSize + 1;
                    // Draw component by tiling each sub-tile from the atlas using (tileSize+1) stride
                    for (var dy = 0; dy < tilesH; dy++) {
                        for (var dx = 0; dx < tilesW; dx++) {
                            var srcX = (componentMeta.spriteX + dx) * g;
                            var srcY = (componentMeta.spriteY + dy) * g;
                            this.ctx.drawImage(
                                this.componentsImage,
                                srcX, srcY,
                                this.tileSize, this.tileSize,
                                drawX + dx * this.tileSize, drawY + dy * this.tileSize,
                                this.tileSize, this.tileSize
                            );
                        }
                    }
                }
            }
        }
        
        // Render dynamically placed components
        var dynamicComponents = this.factory.components || [];
        for (var i = 0; i < dynamicComponents.length; i++) {
            var component = dynamicComponents[i];
            var componentMeta = component.meta;
            
            if (!componentMeta || componentMeta.id === "transportLine") continue;
            
            var drawX = component.x * this.tileSize;
            var drawY = component.y * this.tileSize;
            var tilesW = (componentMeta.width || 1);
            var tilesH = (componentMeta.height || 1);
            
            // Draw component sprite
            if (componentMeta.spriteX !== undefined && componentMeta.spriteY !== undefined) {
                var g = this.tileSize + 1;
                for (var dy = 0; dy < tilesH; dy++) {
                    for (var dx = 0; dx < tilesW; dx++) {
                        var srcX = (componentMeta.spriteX + dx) * g;
                        var srcY = (componentMeta.spriteY + dy) * g;
                        this.ctx.drawImage(
                            this.componentsImage,
                            srcX, srcY,
                            this.tileSize, this.tileSize,
                            drawX + dx * this.tileSize, drawY + dy * this.tileSize,
                            this.tileSize, this.tileSize
                        );
                    }
                }
            }
        }
    };
    
    // Begin drag placement for track
    MapUi.prototype._beginTrackPlacement = function(e) {
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

    MapUi.prototype._endTrackPlacement = function() {
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

    MapUi.prototype._placeTransportTile = function(tileX, tileY) {
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
        this._updateTransportLineConnections();
        
        this._renderDynamicElements();
    };

    // Determine the primary drag direction
    MapUi.prototype._determineDragDirection = function(tileX, tileY) {
        var deltaX = tileX - this._dragStartX;
        var deltaY = tileY - this._dragStartY;
        
        // Determine primary direction (horizontal or vertical)
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            return deltaX > 0 ? 'right' : 'left';
        } else {
            return deltaY > 0 ? 'down' : 'up';
        }
    };

    // Create a track component with proper input/output management
    MapUi.prototype._createTrackComponent = function(tileX, tileY) {
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

    // Update track input/output connections based on neighboring tracks and drag direction
    MapUi.prototype._updateTrackConnections = function(trackComponent) {
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

    // Handle corner pieces when the drag direction changes
    MapUi.prototype._handleCornerPiece = function(trackComponent, neighbors) {
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

    // Get neighboring tracks at a position
    MapUi.prototype._getNeighboringTracks = function(x, y) {
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

    // Render transport lines using the original app's Track strategy
    MapUi.prototype._renderTransportLines = function() {
        if (!this.transportLineImage || !this.ctx) return;
        
        // Get all track components
        var trackComponents = [];
        
        // From factory components
        if (this.factory.components) {
            for (var i = 0; i < this.factory.components.length; i++) {
                var comp = this.factory.components[i];
                if (comp.meta && comp.meta.drawStrategy === 'track') {
                    trackComponents.push(comp);
                }
            }
        }
        
        // From meta components
        var meta = this.factory.getMeta();
        if (meta.components) {
            for (var i = 0; i < meta.components.length; i++) {
                var comp = meta.components[i];
                if (comp.meta && comp.meta.drawStrategy === 'track') {
                    // Check if we already have this component
                    var exists = false;
                    for (var j = 0; j < trackComponents.length; j++) {
                        if (trackComponents[j].x === comp.x && trackComponents[j].y === comp.y) {
                            exists = true;
                            break;
                        }
                    }
                    if (!exists) {
                        trackComponents.push(comp);
                    }
                }
            }
        }
        
        // Render each track component using the Track strategy
        for (var i = 0; i < trackComponents.length; i++) {
            var track = trackComponents[i];
            this._renderTrackComponent(track);
        }
    };

    // Render a single track component using the Track strategy
    MapUi.prototype._renderTrackComponent = function(track) {
        if (!track.getInputOutputManager) return;
        
        var inputOutputManager = track.getInputOutputManager();
        var inputs = inputOutputManager.getInputsByDirection();
        var outputs = inputOutputManager.getOutputsByDirection();
        
        // Create bit patterns like the original app
        var inputPattern = (inputs.top ? "1" : "0") + (inputs.right ? "1" : "0") + (inputs.bottom ? "1" : "0") + (inputs.left ? "1" : "0");
        var outputPattern = (outputs.top ? "1" : "0") + (outputs.right ? "1" : "0") + (outputs.bottom ? "1" : "0") + (outputs.left ? "1" : "0");
        
        // Get draw parameters from the draw map
        var drawParams = this._getTrackDrawParameters(inputPattern, outputPattern);
        if (!drawParams) return;
        
        // Calculate drawing coordinates
        var drawX = track.x * this.tileSize;
        var drawY = track.y * this.tileSize;
        var spriteX = drawParams.n * this.tileSize;
        var spriteY = 0;
        
        // Draw the track sprite
        this.ctx.save();
        
        // Apply rotation and flipping like the original app
        var rotation = drawParams.rotation * Math.PI / 180;
        var centerX = drawX + this.tileSize / 2;
        var centerY = drawY + this.tileSize / 2;
        
        this.ctx.translate(centerX, centerY);
        this.ctx.rotate(rotation);
        if (drawParams.flip) {
            this.ctx.scale(-1, 1);
        }
        
        this.ctx.drawImage(
            this.transportLineImage,
            spriteX, spriteY,
            this.tileSize, this.tileSize,
            -this.tileSize / 2, -this.tileSize / 2,
            this.tileSize, this.tileSize
        );
        
        this.ctx.restore();
    };

    // Get track draw parameters from the draw map (like original app)
    MapUi.prototype._getTrackDrawParameters = function(inputPattern, outputPattern) {
        var drawMap = this._getTrackDrawMap();
        
        // Check if we have a mapping for this input/output combination
        if (drawMap[inputPattern] && drawMap[inputPattern][outputPattern]) {
            return drawMap[inputPattern][outputPattern];
        }
        
        // Fallback to error sprite
        return drawMap.error;
    };

    // Get the track draw map (like original app's _getDrawMap)
    MapUi.prototype._getTrackDrawMap = function() {
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
    
    /**
     * Display the MapUi in the specified container
     * @param {Object} container - Container element
     */
    MapUi.prototype.display = function(container) {
        if (this.canvas) {
            container.empty();
            
            // Get container dimensions and calculated map dimensions
            var containerWidth = container.width();
            var containerHeight = container.height();
            var mapWidth = this.factory.getMeta().tilesX * this.tileSize;
            var mapHeight = this.factory.getMeta().tilesY * this.tileSize;
            
            // Create overlay div (constrains the view) - MATCHES ORIGINAL APP
            this.overlay = $("<div />")
                .css("overflow", "hidden")
                .css("margin", "0 0 0 0")
                .css("width", Math.min(containerWidth, mapWidth))
                .css("height", Math.min(containerHeight, mapHeight));
            
            // Create element div (holds the actual map) - MATCHES ORIGINAL APP
            this.element = $("<div />")
                .css("position", "relative")
                .css("width", mapWidth + "px")
                .css("height", mapHeight + "px");
            
            // Nest the element inside the overlay
            this.overlay.html(this.element);
            
            // Add the canvas to the element (not directly to container)
            this.element.append(this.canvas);
            if (this.overlayCanvas) {
                this.element.append(this.overlayCanvas);
            }
            
            // Add the overlay to the container
            container.html(this.overlay);
            
            // Ensure container is positioned relative so overlay can be absolutely positioned
            if (container.length && getComputedStyle(container.get(0)).position === 'static') {
                container.get(0).style.position = 'relative';
            }
            
            // Cache viewport element for clamping (prefer the provided container)
            //this.viewportEl = container && container.length ? container.get(0) : this.canvas.parentElement;
            
            // Reset map to proper starting position
            this._resetToBoundaries();
            
            // Reset terrain rendered flag to allow initial rendering
            this._terrainRendered = false;
            
            // Set up event listener for component selection
            this._setupComponentSelectionListener();
            
            console.log("MapUi: Created overlay structure - overlay:", this.overlay.width(), "x", this.overlay.height(), "element:", this.element.width(), "x", this.element.height());
        }
    };
    
    /**
     * Clear component selection
     * @private
     */
    MapUi.prototype._clearComponentSelection = function() {
        this.selectedComponentId = null;
        this.isPlacingComponent = false;
        this.shouldDrawBuildableAreas = false;
        this._clearHoverPosition();
        this.canvas.style.cursor = 'grab';
        
        // Notify other components
        this.factory.getEventManager().invokeEvent(FactoryEvent.COMPONENT_META_SELECTED, "noComponent");
        
        // Redraw dynamic elements only (preserve terrain variants)
        this._renderDynamicElements();
    };
    
    /**
     * Set up event listener for component selection
     * @private
     */
    MapUi.prototype._setupComponentSelectionListener = function() {
        var self = this;
        this.factory.getEventManager().addListener(
            "mapUi",
            FactoryEvent.COMPONENT_META_SELECTED,
            function(componentId) {
                self.selectedComponentId = componentId;
                console.log("MapUi: Component selected:", componentId);
                
                // Update placement mode
                if (componentId && componentId !== "noComponent") {
                    self.isPlacingComponent = true;
                    self.shouldDrawBuildableAreas = true;
                    self.canvas.style.cursor = 'crosshair';
                    // Clear any previous hover position
                    self._clearHoverPosition();
                } else {
                    self.isPlacingComponent = false;
                    self.shouldDrawBuildableAreas = false;
                    self.canvas.style.cursor = 'grab';
                    // Clear hover position
                    self._clearHoverPosition();
                }
                
                // Redraw dynamic layer only to avoid terrain re-randomization
                self._renderDynamicElements();
            }
        );
        
        // Add keyboard event listener for Escape key
        this._keydownHandler = function(e) {
            if (e.key === 'Escape' && self.isPlacingComponent) {
                self._clearComponentSelection();
            }
        };
        document.addEventListener('keydown', this._keydownHandler);
    };
    
    /**
     * Clear hover position to prevent ghost images
     * @private
     */
    MapUi.prototype._clearHoverPosition = function() {
        this.hoverTileX = undefined;
        this.hoverTileY = undefined;
    };
    
    /**
     * Clean up resources and event listeners
     */
    MapUi.prototype.destroy = function() {
        if (this.factory && this.factory.getEventManager()) {
            this.factory.getEventManager().removeListenerForType("mapUi");
        }
        
        // Remove canvas event listeners
        if (this.canvas) {
            this.canvas.removeEventListener('mousedown', this._onMouseDown.bind(this));
            this.canvas.removeEventListener('mousemove', this._onMouseMove.bind(this));
            this.canvas.removeEventListener('mouseup', this._onMouseUp.bind(this));
            this.canvas.removeEventListener('wheel', this._onWheel.bind(this));
        }
        // Remove any document-level drag listeners
        this._detachDocumentDragListeners();
        
        // Remove keyboard event listener
        document.removeEventListener('keydown', this._keydownHandler);
        
        // Clear references
        this.canvas = null;
        this.ctx = null;
        this.overlayCanvas = null;
        this.overlayCtx = null;
        this.terrainsImage = null;
        this.componentsImage = null;
        this.transportLineImage = null;
        this.yellowSelectionImage = null;
        this.redSelectionImage = null;
        this.greenSelectionImage = null;
        this.factory = null;
        this.game = null;
    };
    
    /**
     * Reset the map to proper boundary constraints
     * @private
     */
    MapUi.prototype._resetToBoundaries = function() {
        // Reset to top-left corner (0,0 coordinate visible)
        this.offsetX = 0;
        this.offsetY = 0;
        this._updateTransform();
    };
    
    /**
     * Get the canvas element
     * @returns {HTMLCanvasElement}
     */
    MapUi.prototype.getCanvas = function() {
        return this.canvas;
    };
    
    /**
     * Refresh the map display
     */
    MapUi.prototype.refresh = function() {
        this._renderMap(false); // Allow terrain refresh on manual refresh
    };
    
    /**
     * Render the complete map
     * @private
     * @param {boolean} preserveTerrain - If true, don't re-render terrain (prevents randomization)
     */
    MapUi.prototype._renderMap = function(preserveTerrain) {
        // Only render terrain once (don't re-randomize) unless explicitly requested
        if (!this._terrainRendered || preserveTerrain === false) {
            this._renderTerrain();
            this._terrainRendered = true;
        }
        
        this._renderComponents();
        this._renderTransportLines();
        
        // Only render buildable areas if we're not preserving terrain (to avoid recursion)
        if (!preserveTerrain) {
            this._renderBuildableAreas();
        }
    };
    
    /**
     * Render only the dynamic elements (components, buildable areas) without re-rendering terrain
     * @private
     */
    MapUi.prototype._renderDynamicElements = function() {
        this._renderComponents();
        this._renderTransportLines();
        this._renderBuildableAreas();
    };
    
    /**
     * Take a screenshot of the current map
     * @returns {string} Data URL of the screenshot
     */
    MapUi.prototype.takeScreenshot = function() {
        if (this.canvas) {
            return this.canvas.toDataURL('image/png');
        }
        return null;
    };
    
    /**
     * Render wall borders on top of basic wall tiles (like original app's drawTerrainBorders)
     * @private
     */
    MapUi.prototype._renderWallBorders = function() {
        var meta = this.factory.getMeta();
        var terrainMap = meta.terrainMap;
        var tileSize = this.tileSize;
        var g = tileSize + 1; // Gap between sprites
        
        // Render wall borders for each wall tile
        for (var y = 0; y < meta.tilesY; y++) {
            for (var x = 0; x < meta.tilesX; x++) {
                var index = y * meta.tilesX + x;
                var terrainCode = terrainMap[index];
                
                if (terrainCode === 'X') {
                    var drawX = x * tileSize;
                    var drawY = y * tileSize;
                    
                    // Check neighboring tiles
                    var top = this._getTerrainAt(x, y - 1, terrainMap, meta);
                    var right = this._getTerrainAt(x + 1, y, terrainMap, meta);
                    var bottom = this._getTerrainAt(x, y + 1, terrainMap, meta);
                    var left = this._getTerrainAt(x - 1, y, terrainMap, meta);
                    var topRight = this._getTerrainAt(x + 1, y - 1, terrainMap, meta);
                    var topLeft = this._getTerrainAt(x - 1, y - 1, terrainMap, meta);
                    var bottomRight = this._getTerrainAt(x + 1, y + 1, terrainMap, meta);
                    var bottomLeft = this._getTerrainAt(x - 1, y + 1, terrainMap, meta);
                    
                    // Determine wall piece type and select appropriate sprite
                    var wallPiece = this._getWallPieceType(x, y, top, right, bottom, left, topRight, topLeft, bottomRight, bottomLeft);
                    
                    if (wallPiece.type === 'corner') {
                        // Corner piece - use row 12, column 4 as specified
                        var spriteX = 4 * g;
                        var spriteY = 12 * g;
                        
                        this.ctx.drawImage(
                            this.terrainsImage,
                            spriteX, spriteY,
                            tileSize, tileSize,
                            drawX, drawY,
                            tileSize, tileSize
                        );
                        
                        } else if (wallPiece.type === 'edge') {
                        // Edge piece - use appropriate row based on direction
                        var wallRow = wallPiece.direction === 'vertical' ? 12 : 11;
                        var wallCol = Math.floor(Math.random() * 6); // Random variant
                        
                        var spriteX = wallCol * g;
                        var spriteY = wallRow * g;
                        
                        this.ctx.drawImage(
                            this.terrainsImage,
                            spriteX, spriteY,
                            tileSize, tileSize,
                            drawX, drawY,
                            tileSize, tileSize
                        );
                        
                        } else {
                        // Interior wall - use basic wall variant from row 10
                        var wallCol = Math.floor(Math.random() * 6);
                        var spriteX = wallCol * g;
                        var spriteY = 10 * g;
                        
                        this.ctx.drawImage(
                            this.terrainsImage,
                            spriteX, spriteY,
                            tileSize, tileSize,
                            drawX, drawY,
                            tileSize, tileSize
                        );
                        
                        }
                }
            }
        }
    };
    
    /**
     * Render road details on top of basic road tiles (like original app's drawRoad)
     * @private
     */
    MapUi.prototype._renderRoadDetails = function() {
        var meta = this.factory.getMeta();
        var terrainMap = meta.terrainMap;
        var tileSize = this.tileSize;
        var g = tileSize + 1; // Gap between sprites
        
        // Render road details for each road tile
        for (var y = 0; y < meta.tilesY; y++) {
            for (var x = 0; x < meta.tilesX; x++) {
                var index = y * meta.tilesX + x;
                var terrainCode = terrainMap[index];
                
                if (terrainCode === '.') {
                    var drawX = x * tileSize;
                    var drawY = y * tileSize;
                    
                    // Check neighboring tiles
                    var top = this._getTerrainAt(x, y - 1, terrainMap, meta);
                    var right = this._getTerrainAt(x + 1, y, terrainMap, meta);
                    var bottom = this._getTerrainAt(x, y + 1, terrainMap, meta);
                    var left = this._getTerrainAt(x - 1, y, terrainMap, meta);
                    
                    // Create pattern string (top, right, bottom, left)
                    var topBit = (top === '.' || top === ' ') ? "1" : "0";
                    var rightBit = (right === '.' || right === ' ') ? "1" : "0";
                    var bottomBit = (bottom === '.' || bottom === ' ') ? "1" : "0";
                    var leftBit = (left === '.' || left === ' ') ? "1" : "0";
                    var pattern = topBit + rightBit + bottomBit + leftBit;
                    
                    // Road sprite lookup table (based on original app's pattern)
                    var roadPatterns = {
                        "0000": [0, 0],   // Isolated road
                        "1000": [1, 0],   // Top only
                        "0100": [2, 0],   // Right only
                        "0010": [3, 0],   // Bottom only
                        "0001": [4, 0],   // Left only
                        "1010": [0, 1],   // Top and bottom
                        "0101": [0, 2],   // Right and left
                        "1100": [0, 3],   // Top and right
                        "0110": [1, 3],   // Right and bottom
                        "0011": [2, 3],   // Bottom and left
                        "1001": [3, 3],   // Top and left
                        "1111": [4, 4],   // All directions
                        "1110": [0, 4],   // Top, right, bottom
                        "0111": [1, 4],   // Right, bottom, left
                        "1011": [2, 4],   // Top, bottom, left
                        "1101": [3, 4]    // Top, right, left
                    };
                    
                    // Get sprite coordinates for this pattern
                    var spriteCoords = roadPatterns[pattern] || [0, 0];
                    var spriteX = spriteCoords[0] * g;
                    var spriteY = (2 + spriteCoords[1]) * g; // Use row 2 like original app
                    
                    // Draw the road sprite on top of the basic road tile
                    this.ctx.drawImage(
                        this.terrainsImage,
                        spriteX, spriteY,
                        tileSize, tileSize,
                        drawX, drawY,
                        tileSize, tileSize
                    );
                    
                    }
            }
        }
    };
    
    /**
     * Get terrain type at specific coordinates
     * @private
     */
    MapUi.prototype._getTerrainAt = function(x, y, terrainMap, meta) {
        // Check boundaries
        if (x < 0 || x >= meta.tilesX || y < 0 || y >= meta.tilesY) {
            return null; // Out of bounds
        }
        
        var index = y * meta.tilesX + x;
        return terrainMap[index];
    };
    
    /**
     * Determine the type and direction of a wall piece.
     * @private
     */
    MapUi.prototype._getWallPieceType = function(x, y, top, right, bottom, left, topRight, topLeft, bottomRight, bottomLeft) {
        // Corner pieces (X in all 4 directions)
        if (top === 'X' && right === 'X' && bottom === 'X' && left === 'X') {
            return { type: 'corner', direction: 'all' };
        }
        // Edge pieces (X in 2 directions)
        if (top === 'X' && right === 'X' && bottom === ' ' && left === ' ') { // Top and right
            return { type: 'edge', direction: 'vertical' };
        }
        if (top === 'X' && right === ' ' && bottom === 'X' && left === ' ') { // Top and bottom
            return { type: 'edge', direction: 'horizontal' };
        }
        if (top === ' ' && right === 'X' && bottom === 'X' && left === ' ') { // Right and bottom
            return { type: 'edge', direction: 'vertical' };
        }
        if (top === ' ' && right === ' ' && bottom === 'X' && left === 'X') { // Bottom and left
            return { type: 'edge', direction: 'horizontal' };
        }
        // Interior pieces (X in 1 direction)
        if (top === 'X' && right === ' ' && bottom === ' ' && left === ' ') { // Top only
            return { type: 'interior', direction: 'top' };
        }
        if (top === ' ' && right === 'X' && bottom === ' ' && left === ' ') { // Right only
            return { type: 'interior', direction: 'right' };
        }
        if (top === ' ' && right === ' ' && bottom === 'X' && left === ' ') { // Bottom only
            return { type: 'interior', direction: 'bottom' };
        }
        if (top === ' ' && right === ' ' && bottom === ' ' && left === 'X') { // Left only
            return { type: 'interior', direction: 'left' };
        }
        // Fallback for unknown pieces
        return { type: 'unknown', direction: 'none' };
    };
    
    /**
     * Handle component hover for placement preview
     * @private
     */
    MapUi.prototype._onComponentHover = function(e) {
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
            this._renderDynamicElements();
        }
    };
    
    /**
     * Place a component on the map
     * @private
     */
    MapUi.prototype._placeComponent = function(mouseX, mouseY) {
        var meta = this.factory.getMeta();
        var tileX = Math.floor(mouseX / this.tileSize);
        var tileY = Math.floor(mouseY / this.tileSize);
        
        console.log("MapUi: Attempting to place component at tile:", tileX, tileY);
        
        // Check if tile is within map bounds
        if (tileX < 0 || tileX >= meta.tilesX || tileY < 0 || tileY >= meta.tilesY) {
            console.log("MapUi: Placement outside map bounds:", tileX, tileY);
            return;
        }
        
        // Get component metadata
        var componentMeta = this._getComponentMeta(this.selectedComponentId);
        if (!componentMeta) {
            console.log("MapUi: Component not found:", this.selectedComponentId);
            return;
        }
        
        console.log("MapUi: Component meta:", componentMeta);
        
        // Check if component fits at this location
        if (!this._canPlaceComponent(componentMeta, tileX, tileY)) {
            console.log("MapUi: Cannot place component at", tileX, tileY);
            return;
        }
        
        // Place the component
        this._addComponentToMap(componentMeta, tileX, tileY);
        
        // Don't clear selection - allow multiple placements
        // this.factory.getEventManager().invokeEvent(FactoryEvent.COMPONENT_META_SELECTED, "noComponent");
        
        // Redraw the map to show the new component
        this._renderMap(false); // Allow terrain refresh when placing components
        
        console.log("MapUi: Successfully placed", this.selectedComponentId, "at", tileX, tileY);
    };
    
    /**
     * Check if a component can be placed at the given location
     * @private
     */
    MapUi.prototype._canPlaceComponent = function(componentMeta, tileX, tileY) {
        var meta = this.factory.getMeta();
        var buildMap = meta.buildMap;
        
        console.log("MapUi: Checking placement for", componentMeta.id, "at", tileX, tileY);
        console.log("MapUi: Component dimensions:", componentMeta.width || 1, "x", componentMeta.height || 1);
        
        // Allow placement when all tiles are buildable: " " (yes) or "-" (partial)
        if (!buildMap) {
            console.log("MapUi: No buildMap available");
            return false;
        }
        
        // Check if all tiles for the component are buildable
        for (var y = 0; y < (componentMeta.height || 1); y++) {
            for (var x = 0; x < (componentMeta.width || 1); x++) {
                var checkX = tileX + x;
                var checkY = tileY + y;
                
                // Check bounds
                if (checkX < 0 || checkX >= meta.tilesX || checkY < 0 || checkY >= meta.tilesY) {
                    console.log("MapUi: Component extends beyond map bounds at", checkX, checkY);
                    return false;
                }
                
                // Check if tile is buildable (only floor tiles "-")
                var index = checkY * meta.tilesX + checkX;
                var buildable = buildMap[index];
                console.log("MapUi: Tile at", checkX, checkY, "buildable:", buildable);
                
                // Red tiles (anything other than space or dash) are not buildable
                if (buildable !== " " && buildable !== "-") {
                    console.log("MapUi: Cannot build on tile type:", buildable);
                    return false;
                }
            }
        }
        
        console.log("MapUi: Component can be placed at", tileX, tileY);
        return true;
    };
    
    /**
     * Add a component to the map
     * @private
     */
    MapUi.prototype._addComponentToMap = function(componentMeta, tileX, tileY) {
        // Create component instance
        var component = {
            id: componentMeta.id,
            x: tileX,
            y: tileY,
            width: componentMeta.width,
            height: componentMeta.height,
            meta: componentMeta
        };
        
        // Add to factory's component list
        if (!this.factory.components) {
            this.factory.components = [];
        }
        this.factory.components.push(component);
    };
    
    /**
     * Get component metadata by ID
     * @private
     */
    MapUi.prototype._getComponentMeta = function(componentId) {
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
    MapUi.prototype._getHardcodedComponents = function() {
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
     * Render buildable areas with mouse cursor feedback
     * @private
     */
    MapUi.prototype._renderBuildableAreas = function() {
        if (!this.shouldDrawBuildableAreas || !this.ctx) return;
        
        var meta = this.factory.getMeta();
        var buildMap = meta.buildMap;
        
        if (!buildMap) return;
        
        // Clear overlay each frame to prevent ghosting
        if (this.overlayCtx && this.overlayCanvas) {
            this.overlayCtx.clearRect(0, 0, this.overlayCanvas.width, this.overlayCanvas.height);
        }
        
        // The _renderMap() call above will handle terrain, components, and transport lines
        // Now we just need to draw the current buildable areas on top
        if (this.hoverTileX !== undefined && this.hoverTileY !== undefined) {
            var componentMeta = this._getComponentMeta(this.selectedComponentId);
            if (componentMeta) {
                this._renderComponentBuildableArea(componentMeta, this.hoverTileX, this.hoverTileY);
            }
        }
    };
    
    /**
     * Render buildable area for a specific component at a specific location
     * @private
     */
    MapUi.prototype._renderComponentBuildableArea = function(componentMeta, tileX, tileY) {
        if (!this.ctx) return;
        
        var meta = this.factory.getMeta();
        var buildMap = meta.buildMap;
        var tileSize = this.tileSize;
        var widthTiles = Math.max(1, componentMeta.width || 1);
        var heightTiles = Math.max(1, componentMeta.height || 1);
        
        // Clamp footprint to map bounds
        var startX = Math.max(0, tileX);
        var startY = Math.max(0, tileY);
        var endX = Math.min(meta.tilesX, tileX + widthTiles);
        var endY = Math.min(meta.tilesY, tileY + heightTiles);
        var clampedWidthTiles = Math.max(0, endX - startX);
        var clampedHeightTiles = Math.max(0, endY - startY);
        if (clampedWidthTiles === 0 || clampedHeightTiles === 0) return;
        
        // Determine overall status across footprint
        var hasRed = false;
        var hasYellow = false;
        for (var y = startY; y < endY; y++) {
            for (var x = startX; x < endX; x++) {
                var index = y * meta.tilesX + x;
                var buildable = buildMap[index];
                if (buildable === "-") {
                    // ok
                } else if (buildable === " ") {
                    hasYellow = true;
                } else {
                    hasRed = true;
                }
            }
        }
        
        // Pick image: red if any red; else yellow if any yellow; else green
        var cursorImage = this.greenSelectionImage;
        if (hasRed) {
            cursorImage = this.redSelectionImage;
        } else if (hasYellow) {
            cursorImage = this.yellowSelectionImage;
        }
        
        if (cursorImage && cursorImage.complete) {
            var ctx = this.overlayCtx || this.ctx;
            var drawX = startX * tileSize;
            var drawY = startY * tileSize;
            var drawW = clampedWidthTiles * tileSize;
            var drawH = clampedHeightTiles * tileSize;
            var srcW = cursorImage.width || tileSize;
            var srcH = cursorImage.height || tileSize;
            ctx.drawImage(cursorImage, 0, 0, srcW, srcH, drawX, drawY, drawW, drawH);
        }
    };
    
    /**
     * Clear all buildable areas to prevent ghosting
     * @private
     */
    MapUi.prototype._clearAllBuildableAreas = function() {
        // Force a complete redraw to clear all buildable areas
        this._renderMap(false); // Allow terrain refresh when clearing all areas
    };
    
    /**
     * Render terrain borders for floors and walls (like original app's drawTerrainBorders)
     * @private
     */
    MapUi.prototype._renderTerrainBorders = function() {
        if (!this.ctx || !this.terrainsImage) return;
        
        var tiles = this.factory.getTiles();
        if (!tiles) return;
        
        for (var i = 0; i < tiles.length; i++) {
            var tile = tiles[i];
            var terrain = tile.getTerrain();
            
            if (terrain === "floor") {
                // Draw floor borders where floor meets grass/road to trim floor edges
                this._drawTerrainBorders(tile, 7, 1, {  grass: true, road: true });
            } else 
            if (terrain === "wall") {
                // Basic wall borders
                this._drawTerrainBorders(tile, 7, 1, { floor:false, grass: true, road: true });
                // Detailed wall borders
                this._drawTerrainBorders(tile, 10, 1, { floor: true,grass: true, road: true });
            }
        }
    };
    
    /**
     * Draw terrain borders for a specific tile (like original app's drawTerrainBorders)
     * @private
     */
    MapUi.prototype._drawTerrainBorders = function(tile, borderRow, variants, allowedTerrains) {
        if (!this.ctx || !this.terrainsImage) return;
        
        var tileSize = this.tileSize;
        var g = tileSize + 1;
        var x = tile.getX() * tileSize;
        var y = tile.getY() * tileSize;
        
        // Get neighboring tiles
        var top = this._getTileInDirection(tile, "top");
        var right = this._getTileInDirection(tile, "right");
        var bottom = this._getTileInDirection(tile, "bottom");
        var left = this._getTileInDirection(tile, "left");
        var topRight = this._getTileInDirection(tile, "top_right");
        var topLeft = this._getTileInDirection(tile, "top_left");
        var bottomRight = this._getTileInDirection(tile, "bottom_right");
        var bottomLeft = this._getTileInDirection(tile, "bottom_left");
        
        // Check if neighbors are allowed terrain types
        var o = !top || allowedTerrains[top.getTerrain()];
        var s = !right || allowedTerrains[right.getTerrain()];
        var a = !bottom || allowedTerrains[bottom.getTerrain()];
        var u = !left || allowedTerrains[left.getTerrain()];
        var c = !topRight || allowedTerrains[topRight.getTerrain()];
        var l = !topLeft || allowedTerrains[topLeft.getTerrain()];
        var h = !bottomRight || allowedTerrains[bottomRight.getTerrain()];
        var p = !bottomLeft || allowedTerrains[bottomLeft.getTerrain()];
        
        // Calculate border positions
        var X = borderRow * g;
        var y_pos = (borderRow + 1) * g;
        var v = (borderRow + 2) * g;
        var variant = Math.floor(variants * Math.random()) * g;
        
        // Draw corner borders
        if (o && s) this.ctx.drawImage(this.terrainsImage, 3 * g + 10, v + 0, 11, 11, x + 10, y + 0, 11, 11);
        if (o && u) this.ctx.drawImage(this.terrainsImage, 3 * g + 0, v + 0, 11, 11, x + 0, y + 0, 11, 11);
        if (a && s) this.ctx.drawImage(this.terrainsImage, 3 * g + 10, v + 10, 11, 11, x + 10, y + 10, 11, 11);
        if (a && u) this.ctx.drawImage(this.terrainsImage, 3 * g + 0, v + 10, 11, 11, x + 0, y + 10, 11, 11);
        
        // // // Draw edge borders
        //if (!c || o || s) this.ctx.drawImage(this.terrainsImage, 0 * g + 10, v + 0, 11, 11, x + 10, y + 0, 11, 11);
        // if (!l || o || u) this.ctx.drawImage(this.terrainsImage, 0 * g + 0, v + 0, 11, 11, x + 0, y + 0, 11, 11);
        // if (!h || a || s) this.ctx.drawImage(this.terrainsImage, 0 * g + 10, v + 10, 11, 11, x + 10, y + 10, 11, 11);
        // if (!p || a || u) this.ctx.drawImage(this.terrainsImage, 0 * g + 0, v + 10, 11, 11, x + 0, y + 10, 11, 11);
        
        // Draw edge lines
        var b = u ? 10 : 0;
        var S = s ? 10 : 0;
        var G = o ? 10 : 0;
        var T = a ? 10 : 0;
        
        if (o) this.ctx.drawImage(this.terrainsImage, variant + 0 + b, X + 0 + 0, tileSize - b - S, 11, x + 0 + b, y + 0, tileSize - b - S, 11);
        if (a) this.ctx.drawImage(this.terrainsImage, variant + 0 + b, X + 0 + 10, tileSize - b - S, 11, x + 0 + b, y + 10, tileSize - b - S, 11);
        if (s) this.ctx.drawImage(this.terrainsImage, variant + 10, y_pos + 0 + G, 11, tileSize - G - T, x + 10, y + 0 + G, 11, tileSize - G - T);
        if (u) this.ctx.drawImage(this.terrainsImage, variant + 0, y_pos + 0 + G, 11, tileSize - G - T, x + 0, y + 0 + G, 11, tileSize - G - T);
    };
    
    /**
     * Render roads with proper connections (like original app's drawRoad)
     * @private
     */
    MapUi.prototype._renderRoads = function() {
        if (!this.ctx || !this.terrainsImage) return;
        
        var tiles = this.factory.getTiles();
        if (!tiles) return;
        
        for (var i = 0; i < tiles.length; i++) {
            var tile = tiles[i];
            if (tile.getTerrain() === "road") {
                this._drawRoad(tile, 2, { road: true });
            }
        }
    };
    
    /**
     * Draw road with proper connections (like original app's drawRoad)
     * @private
     */
    MapUi.prototype._drawRoad = function(tile, roadRow, allowedTerrains) {
        if (!this.ctx || !this.terrainsImage) return;
        
        var tileSize = this.tileSize;
        var g = tileSize + 1;
        var x = tile.getX() * tileSize;
        var y = tile.getY() * tileSize;
        
        // Get neighboring tiles
        var top = this._getTileInDirection(tile, "top");
        var right = this._getTileInDirection(tile, "right");
        var bottom = this._getTileInDirection(tile, "bottom");
        var left = this._getTileInDirection(tile, "left");
        
        // Check if neighbors are road tiles
        var r = !top || allowedTerrains[top.getTerrain()];
        var o = !right || allowedTerrains[right.getTerrain()];
        var s = !bottom || allowedTerrains[bottom.getTerrain()];
        var a = !left || allowedTerrains[left.getTerrain()];
        
        // Road connection pattern mapping (like original app)
        var roadPatterns = {
            "0000": [0, 0],
            "1000": [1, 0],
            "0100": [2, 0],
            "0010": [3, 0],
            "0001": [4, 0],
            "1010": [0, 1],
            "0101": [0, 2],
            "1100": [0, 3],
            "0110": [1, 3],
            "0011": [2, 3],
            "1001": [3, 3],
            "1111": [4, 4],
            "1110": [0, 4],
            "0111": [1, 4],
            "1011": [2, 4],
            "1101": [3, 4]
        };
        
        // Create pattern key
        var patternKey = (r ? "1" : "0") + (o ? "1" : "0") + (s ? "1" : "0") + (a ? "1" : "0");
        var pattern = roadPatterns[patternKey];
        
        if (pattern) {
            this.ctx.drawImage(
                this.terrainsImage,
                pattern[0] * g, (roadRow + pattern[1]) * g,
                tileSize, tileSize,
                x, y,
                tileSize, tileSize
            );
        }
    };
    
    /**
     * Get tile in a specific direction (helper for terrain borders)
     * @private
     */
    MapUi.prototype._getTileInDirection = function(tile, direction) {
        var x = tile.getX();
        var y = tile.getY();
        var meta = this.factory.getMeta();
        
        switch (direction) {
            case "top": return y > 0 ? this.factory.getTile(x, y - 1) : null;
            case "right": return x < meta.tilesX - 1 ? this.factory.getTile(x + 1, y) : null;
            case "bottom": return y < meta.tilesY - 1 ? this.factory.getTile(x, y + 1) : null;
            case "left": return x > 0 ? this.factory.getTile(x - 1, y) : null;
            case "top_right": return (y > 0 && x < meta.tilesX - 1) ? this.factory.getTile(x + 1, y - 1) : null;
            case "top_left": return (y > 0 && x > 0) ? this.factory.getTile(x - 1, y - 1) : null;
            case "bottom_right": return (y < meta.tilesY - 1 && x < meta.tilesX - 1) ? this.factory.getTile(x + 1, y + 1) : null;
            case "bottom_left": return (y < meta.tilesY - 1 && x > 0) ? this.factory.getTile(x - 1, y + 1) : null;
            default: return null;
        }
    };

    /**
     * Attach document-level listeners for dragging outside canvas
     * @private
     */
    MapUi.prototype._attachDocumentDragListeners = function() {
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
    MapUi.prototype._detachDocumentDragListeners = function() {
        if (this._docMouseMove) {
            document.removeEventListener('mousemove', this._docMouseMove);
            this._docMouseMove = null;
        }
        if (this._docMouseUp) {
            document.removeEventListener('mouseup', this._docMouseUp);
            this._docMouseUp = null;
        }
    };
    
    // Get component at specific tile coordinates
    MapUi.prototype._getComponentAt = function(tileX, tileY) {
        // Check factory components first
            console.log("MapUi: Factory components:", this.factory);
        if (this.factory.components) {
            console.log("MapUi: Factory components:", this.factory.components);
            for (var i = 0; i < this.factory.components.length; i++) {
                var comp = this.factory.components[i];
                if (comp.x === tileX && comp.y === tileY) {
                    console.log(comp);
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

    // Update transport line connections based on placed components
    MapUi.prototype._updateTransportLineConnections = function() {
        // Update existing tracks to connect to newly placed tracks
        if (this.factory.components) {
            for (var i = 0; i < this.factory.components.length; i++) {
                var comp = this.factory.components[i];
                if (comp.meta && comp.meta.drawStrategy === 'track') {
                    this._updateExistingTrackConnections(comp);
                }
            }
        }
        
        // Also update meta components
        var meta = this.factory.getMeta();
        if (meta.components) {
            for (var i = 0; i < meta.components.length; i++) {
                var comp = meta.components[i];
                if (comp.meta && comp.meta.drawStrategy === 'track') {
                    this._updateExistingTrackConnections(comp);
                }
            }
        }
        
        // Redraw to show the new connections
        this._renderDynamicElements();
    };

    // Update existing track connections to connect to neighbors
    MapUi.prototype._updateExistingTrackConnections = function(trackComponent) {
        var x = trackComponent.x;
        var y = trackComponent.y;
        var inputs = trackComponent._inputOutputManager._inputs;
        var outputs = trackComponent._inputOutputManager._outputs;
        
        // Check for neighboring tracks
        var neighbors = this._getNeighboringTracks(x, y);
        
        // Ensure inputs remain "0000" (no inputs) as per original app
        inputs.top = inputs.right = inputs.bottom = inputs.left = false;
        
        // Reset outputs and set them based on actual neighboring tracks
        outputs.top = outputs.right = outputs.bottom = outputs.left = false;
        
        // Set outputs to show connections to neighboring tracks
        if (neighbors.top) outputs.top = true;
        if (neighbors.right) outputs.right = true;
        if (neighbors.bottom) outputs.bottom = true;
        if (neighbors.left) outputs.left = true;
    };

    // Begin component removal mode
    MapUi.prototype._beginComponentRemoval = function(e) {
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

    // End component removal mode
    MapUi.prototype._endComponentRemoval = function() {
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

    // Remove component at specific tile coordinates
    MapUi.prototype._removeComponentAtTile = function(tileX, tileY) {
        console.log("MapUi: Removing component at", tileX, tileY);
        
        // Find component that covers this tile (considering component dimensions)
        var component = this._getComponentAtFootprint(tileX, tileY);
        console.log("MapUi: Component found:", component);
        
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
                this._updateTransportLineConnections();
            }
            
            // Redraw floor terrain over the removed component area
            this._redrawFloorOverComponent(componentX, componentY, componentWidth, componentHeight);
            
            // Redraw to show the removal
            this._renderDynamicElements();
            
            console.log("MapUi: Removed component at", componentX, componentY, "with dimensions", componentWidth, "x", componentHeight);
        }
    };
    
    // Get component that covers a specific tile (considering component dimensions)
    MapUi.prototype._getComponentAtFootprint = function(tileX, tileY) {
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
    
    // Redraw floor terrain over a removed component area
    MapUi.prototype._redrawFloorOverComponent = function(componentX, componentY, componentWidth, componentHeight) {
        if (!this.terrainsImage || !this.ctx) return;
        
        var meta = this.factory.getMeta();
        var terrainMap = meta.terrainMap;
        var terrains = meta.terrains;
        
        if (!terrainMap || !terrains) return;
        
        // Redraw floor tiles over the component area
        for (var y = componentY; y < componentY + componentHeight; y++) {
            for (var x = componentX; x < componentX + componentWidth; x++) {
                // Check bounds
                if (x < 0 || x >= meta.tilesX || y < 0 || y >= meta.tilesY) continue;
                
                var index = y * meta.tilesX + x;
                var terrainCode = terrainMap[index];
                var terrainName = terrains[terrainCode];
                
                // Only redraw floor tiles (dash character in buildMap)
                if (terrainName === "floor") {
                    var drawX = x * this.tileSize;
                    var drawY = y * this.tileSize;
                    
                    // Use floor terrain mapping (row 1, 6 variants)
                    var variantX = Math.floor(6 * Math.random()) * (this.tileSize + 1);
                    var variantY = 1 * (this.tileSize + 1);
                    
                    this.ctx.drawImage(
                        this.terrainsImage,
                        variantX, variantY,
                        this.tileSize, this.tileSize,
                        drawX, drawY,
                        this.tileSize, this.tileSize
                    );
                }
            }
        }
        
        // Also redraw terrain borders for the affected area
        this._redrawTerrainBordersInArea(componentX, componentY, componentWidth, componentHeight);
    };
    
    // Redraw terrain borders in a specific area
    MapUi.prototype._redrawTerrainBordersInArea = function(startX, startY, width, height) {
        if (!this.terrainsImage || !this.ctx) return;
        
        var meta = this.factory.getMeta();
        var terrainMap = meta.terrainMap;
        var terrains = meta.terrains;
        
        if (!terrainMap || !terrains) return;
        
        // Redraw borders for the affected area and its neighbors
        var borderX = Math.max(0, startX - 1);
        var borderY = Math.max(0, startY - 1);
        var borderWidth = Math.min(meta.tilesX - borderX, width + 2);
        var borderHeight = Math.min(meta.tilesY - borderY, height + 2);
        
        for (var y = borderY; y < borderY + borderHeight; y++) {
            for (var x = borderX; x < borderX + borderWidth; x++) {
                var index = y * meta.tilesX + x;
                var terrainCode = terrainMap[index];
                var terrainName = terrains[terrainCode];
                
                if (terrainName === "floor") {
                    // Redraw floor borders
                    this._drawTerrainBordersForTile(x, y, 7, 1, { grass: true, road: true });
                } else if (terrainName === "wall") {
                    // Redraw wall borders
                    this._drawTerrainBordersForTile(x, y, 7, 1, { floor: false, grass: true, road: true });
                    this._drawTerrainBordersForTile(x, y, 10, 1, { floor: true, grass: true, road: true });
                }
            }
        }
    };
    
    // Draw terrain borders for a specific tile
    MapUi.prototype._drawTerrainBordersForTile = function(tileX, tileY, borderRow, variants, allowedTerrains) {
        if (!this.terrainsImage || !this.ctx) return;
        
        var tileSize = this.tileSize;
        var g = tileSize + 1;
        var x = tileX * tileSize;
        var y = tileY * tileSize;
        
        // Get neighboring tiles
        var top = this._getTerrainAt(tileX, tileY - 1, this.factory.getMeta().terrainMap, this.factory.getMeta());
        var right = this._getTerrainAt(tileX + 1, tileY, this.factory.getMeta().terrainMap, this.factory.getMeta());
        var bottom = this._getTerrainAt(tileX, tileY + 1, this.factory.getMeta().terrainMap, this.factory.getMeta());
        var left = this._getTerrainAt(tileX - 1, tileY, this.factory.getMeta().terrainMap, this.factory.getMeta());
        var topRight = this._getTerrainAt(tileX + 1, tileY - 1, this.factory.getMeta().terrainMap, this.factory.getMeta());
        var topLeft = this._getTerrainAt(tileX - 1, tileY - 1, this.factory.getMeta().terrainMap, this.factory.getMeta());
        var bottomRight = this._getTerrainAt(tileX + 1, tileY + 1, this.factory.getMeta().terrainMap, this.factory.getMeta());
        var bottomLeft = this._getTerrainAt(tileX - 1, tileY + 1, this.factory.getMeta().terrainMap, this.factory.getMeta());
        
        // Check if neighbors are allowed terrain types
        var o = !top || allowedTerrains[this._getTerrainName(top)];
        var s = !right || allowedTerrains[this._getTerrainName(right)];
        var a = !bottom || allowedTerrains[this._getTerrainName(bottom)];
        var u = !left || allowedTerrains[this._getTerrainName(left)];
        var c = !topRight || allowedTerrains[this._getTerrainName(topRight)];
        var l = !topLeft || allowedTerrains[this._getTerrainName(topLeft)];
        var h = !bottomRight || allowedTerrains[this._getTerrainName(bottomRight)];
        var p = !bottomLeft || allowedTerrains[this._getTerrainName(bottomLeft)];
        
        // Calculate border positions
        var X = borderRow * g;
        var y_pos = (borderRow + 1) * g;
        var v = (borderRow + 2) * g;
        var variant = Math.floor(variants * Math.random()) * g;
        
        // Draw corner borders
        if (o && s) this.ctx.drawImage(this.terrainsImage, 3 * g + 10, v + 0, 11, 11, x + 10, y + 0, 11, 11);
        if (o && u) this.ctx.drawImage(this.terrainsImage, 3 * g + 0, v + 0, 11, 11, x + 0, y + 0, 11, 11);
        if (a && s) this.ctx.drawImage(this.terrainsImage, 3 * g + 10, v + 10, 11, 11, x + 10, y + 10, 11, 11);
        if (a && u) this.ctx.drawImage(this.terrainsImage, 3 * g + 0, v + 10, 11, 11, x + 0, y + 10, 11, 11);
        
        // Draw edge lines
        var b = u ? 10 : 0;
        var S = s ? 10 : 0;
        var G = o ? 10 : 0;
        var T = a ? 10 : 0;
        
        if (o) this.ctx.drawImage(this.terrainsImage, variant + 0 + b, X + 0 + 0, tileSize - b - S, 11, x + 0 + b, y + 0, tileSize - b - S, 11);
        if (a) this.ctx.drawImage(this.terrainsImage, variant + 0 + b, X + 0 + 10, tileSize - b - S, 11, x + 0 + b, y + 10, tileSize - b - S, 11);
        if (s) this.ctx.drawImage(this.terrainsImage, variant + 10, y_pos + 0 + G, 11, tileSize - G - T, x + 10, y + 0 + G, 11, tileSize - G - T);
        if (u) this.ctx.drawImage(this.terrainsImage, variant + 0, y_pos + 0 + G, 11, tileSize - G - T, x + 0, y + 0 + G, 11, tileSize - G - T);
    };
    
    // Helper function to get terrain name from terrain code
    MapUi.prototype._getTerrainName = function(terrainCode) {
        if (!terrainCode) return null;
        var meta = this.factory.getMeta();
        return meta.terrains ? meta.terrains[terrainCode] : null;
    };
    
    return MapUi;
});
