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
                this._placeComponent(mouseX, mouseY);
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
            // Clear component selection on right click
            if (this.isPlacingComponent) {
                this._clearComponentSelection();
                e.preventDefault();
            }
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
            
            var minX = Math.min(0, viewportWidth - mapWidth-236);
            var maxX = 0;
            var minY = Math.min(0, viewportHeight - mapHeight-118);
            var maxY = 0;

            this.offsetX = Math.max(minX, Math.min(maxX, newOffsetX));
            this.offsetY = Math.max(minY, Math.min(maxY, newOffsetY));
                        
            this._updateTransform();
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
            floor: { y: 1, tiles: 1 }, 
            wall: { y: 1, tiles: 1 }, 
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
                if (componentMeta && componentMeta.spriteX !== undefined && componentMeta.spriteY !== undefined) {
                    var drawX = x * this.tileSize;
                    var drawY = y * this.tileSize;
                    var width = (componentMeta.width || 1) * this.tileSize;
                    var height = (componentMeta.height || 1) * this.tileSize;
                    
                    // Draw component sprite
                    this.ctx.drawImage(
                        this.componentsImage,
                        componentMeta.spriteX * this.tileSize, componentMeta.spriteY * this.tileSize,
                        width, height,
                        drawX, drawY,
                        width, height
                    );
                }
            }
        }
        
        // Render dynamically placed components
        var dynamicComponents = this.factory.components || [];
        for (var i = 0; i < dynamicComponents.length; i++) {
            var component = dynamicComponents[i];
            var componentMeta = component.meta;
            
            if (!componentMeta) continue;
            
            var drawX = component.x * this.tileSize;
            var drawY = component.y * this.tileSize;
            var width = (componentMeta.width || 1) * this.tileSize;
            var height = (componentMeta.height || 1) * this.tileSize;
            
            // Draw component sprite
            if (componentMeta.spriteX !== undefined && componentMeta.spriteY !== undefined) {
                var spriteX = componentMeta.spriteX * (this.tileSize + 1);
                var spriteY = componentMeta.spriteY * (this.tileSize + 1);
                
                this.ctx.drawImage(
                    this.componentsImage,
                    spriteX, spriteY,
                    this.tileSize, this.tileSize,
                    drawX, drawY,
                    width, height
                );
            }
            
            // Draw component name
            if (componentMeta.name) {
                this.ctx.fillStyle = 'white';
                this.ctx.strokeStyle = 'black';
                this.ctx.lineWidth = 2;
                this.ctx.font = '10px Arial';
                this.ctx.textAlign = 'center';
                
                var textX = drawX + width / 2;
                var textY = drawY + height / 2 + 3;
                
                this.ctx.strokeText(componentMeta.name, textX, textY);
                this.ctx.fillText(componentMeta.name, textX, textY);
            }
        }
    };
    
    /**
     * Render transport lines
     * @private
     */
    MapUi.prototype._renderTransportLines = function() {
        if (!this.transportLineImage || !this.ctx) return;
        
        var meta = this.factory.getMeta();
        var transportLineConnections = meta.transportLineConnections;
        
        if (!transportLineConnections) return;
        
        for (var i = 0; i < transportLineConnections.length; i++) {
            var connection = transportLineConnections[i];
            var x = connection.x;
            var y = connection.y;
            
            var drawX = x * this.tileSize;
            var drawY = y * this.tileSize;
            
            // Draw transport line sprite
            this.ctx.drawImage(
                this.transportLineImage,
                0, 0,
                this.tileSize, this.tileSize,
                drawX, drawY,
                this.tileSize, this.tileSize
            );
        }
    };
    
    /**
     * Display the map UI
     * @param {jQuery} container - Container to display the map in
     */
    MapUi.prototype.display = function(container) {
        if (this.canvas) {
            container.empty().append(this.canvas);
            // Cache viewport element for clamping (prefer the provided container)
           // this.viewportEl = container && container.length ? container.get(0) : this.canvas.parentElement;
            
            // Reset map to proper starting position
            this._resetToBoundaries();
            
            // Reset terrain rendered flag to allow initial rendering
            this._terrainRendered = false;
            
            // Set up event listener for component selection
            this._setupComponentSelectionListener();
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
        
        // Redraw to hide buildable areas
        this._renderMap(false); // Allow terrain refresh when clearing selection
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
                
                // Redraw to show/hide buildable areas
                self._renderMap(false); // Allow terrain refresh when changing selection
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
        
        // Convert to tile coordinates
        var tileX = Math.floor((mouseX - this.offsetX) / this.tileSize);
        var tileY = Math.floor((mouseY - this.offsetY) / this.tileSize);
        
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
        var tileX = Math.floor((mouseX - this.offsetX) / this.tileSize);
        var tileY = Math.floor((mouseY - this.offsetY) / this.tileSize);
        
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
        
        // Only allow placement on floor tiles (marked with "-" in buildMap)
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
                
                if (buildable !== "-") {
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
        
        // Clear the entire canvas to remove ALL previous hover effects
        // This prevents ghosting by ensuring a clean slate
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Now redraw everything from scratch to ensure no ghosting
        // This includes terrain, components, transport lines, and new buildable areas
        this._renderMap(true); // Pass true to preserve terrain
        
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
        
        // Check each tile the component would occupy
        for (var y = 0; y < (componentMeta.height || 1); y++) {
            for (var x = 0; x < (componentMeta.width || 1); x++) {
                var checkX = tileX + x;
                var checkY = tileY + y;
                
                // Check bounds
                if (checkX < 0 || checkX >= meta.tilesX || checkY < 0 || checkY >= meta.tilesY) {
                    continue;
                }
                
                var index = checkY * meta.tilesX + checkX;
                var buildable = buildMap[index];
                var drawX = checkX * tileSize;
                var drawY = checkY * tileSize;
                
                // Select cursor image based on buildable type
                var cursorImage = null;
                if (buildable === "-") {
                    cursorImage = this.greenSelectionImage; // Floor tiles - can build
                } else if (buildable === " ") {
                    cursorImage = this.yellowSelectionImage; // Grass tiles - limited building
                } else {
                    cursorImage = this.redSelectionImage; // Walls/roads - cannot build
                }
                
                if (cursorImage && cursorImage.complete) {
                    this.ctx.drawImage(
                        cursorImage,
                        0, 0,
                        tileSize, tileSize,
                        drawX, drawY,
                        tileSize, tileSize
                    );
                }
            }
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
    
    return MapUi;
});
