/**
 * BackgroundLayer - Terrain rendering and background elements
 * Extracted from original_app.js
 */
define("ui/factory/mapLayers/BackgroundLayer", [
    "config/event/FactoryEvent"
], function(FactoryEvent) {

    /**
     * BackgroundLayer constructor
     * @param {Object} imageMap - ImageMap instance
     * @param {Object} factory - Factory instance
     * @param {Object} options - Options with tileSize
     */
    var BackgroundLayer = function(imageMap, factory, options) {
        console.log("BackgroundLayer constructor called");
        this.imageMap = imageMap;
        this.factory = factory;
        this.game = factory.getGame();
        this.tileSize = (options && options.tileSize) ? options.tileSize : 21;
        this.tilesX = factory.getMeta().tilesX;
        this.tilesY = factory.getMeta().tilesY;
    };


    /**
     * Draw terrain tiles (like original app's drawTerrain)
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Object} terrainMapping - Terrain type mapping
     */
    BackgroundLayer.prototype.drawTerrain = function(ctx, terrainMapping) {
        for (var i = 0; i < this.factory.getTiles().length; i++) {
            var tile = this.factory.getTiles()[i];
            var tileX = tile.getX() * this.tileSize;
            var tileY = tile.getY() * this.tileSize;

            var terrainType = tile.getTerrain();
            var mapping = terrainMapping[terrainType];

            if (mapping) {
                var randomTile = Math.floor(mapping.tiles * Math.random());
                var spriteX = randomTile * (this.tileSize + 1);
                var spriteY = mapping.y * (this.tileSize + 1);

                    ctx.drawImage(
                        this.sprite,
                        spriteX, spriteY,
                        this.tileSize, this.tileSize,
                        tileX, tileY,
                        this.tileSize, this.tileSize
                    );
            }
        }
    };


    /**
     * Get terrain type at specific coordinates
     * @private
     */
    BackgroundLayer.prototype._getTerrainAt = function(x, y, terrainMap, meta) {
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
    BackgroundLayer.prototype._getWallPieceType = function(x, y, top, right, bottom, left, topRight, topLeft, bottomRight, bottomLeft) {
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
     * Render roads with proper connections (like original app's drawRoad)
     * @private
     */
    BackgroundLayer.prototype._renderRoads = function(ctx) {
        if (!ctx || !this.terrainsImage) return;

        var tiles = this.factory.getTiles();
        if (!tiles) return;

        for (var i = 0; i < tiles.length; i++) {
            var tile = tiles[i];
            if (tile.getTerrain() === "road") {
                this._drawRoad(tile, 2, { road: true }, ctx);
            }
        }
    };

    /**
     * Draw road with proper connections (like original app's drawRoad)
     * @private
     */
    BackgroundLayer.prototype._drawRoad = function(tile, roadRow, allowedTerrains, ctx) {
        if (!ctx || !this.terrainsImage) return;

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
            ctx.drawImage(
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
    BackgroundLayer.prototype._getTileInDirection = function(tile, direction) {
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
     * Helper function to get terrain name from terrain code
     */
    BackgroundLayer.prototype._getTerrainName = function(terrainCode) {
        if (!terrainCode) return null;
        var meta = this.factory.getMeta();
        return meta.terrains ? meta.terrains[terrainCode] : null;
    };

    /**
     * Display the background layer in the specified container
     * @param {Object} container - Container element (jQuery object)
     */
    BackgroundLayer.prototype.display = function(container) {
        this.container = container;


        // Create canvas (matching original app structure)
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.tilesX * this.tileSize;
        this.canvas.height = this.tilesY * this.tileSize;
        this.canvas.style.position = 'absolute';

        container.append(this.canvas);

        // Get sprite from ImageMap (like original app)
        this.sprite = this.imageMap.getImage("terrains");

        this.redraw();

        this.factory.getEventManager().addListener(
            "LayerBackground",
            FactoryEvent.TILE_TYPE_CHANGED,
            function() {
                this.redraw();
            }.bind(this)
        );

        this.shouldDrawBuildableAreas = false;
        this.factory.getEventManager().addListener(
            "LayerBackground",
            FactoryEvent.MAP_TOOL_SELECTED,
            function(e) {
                this.shouldDrawBuildableAreas = !!e;
                this.redraw();
            }.bind(this)
        );
    };

    /**
     * Redraw the background layer (like original app)
     */
    BackgroundLayer.prototype.redraw = function() {
        var ctx = this.canvas.getContext("2d");
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        var terrainMapping = {
            undefined: { y: 0, tiles: 6 },
            grass: { y: 0, tiles: 6 },
            floor: { y: 1, tiles: 6 },
            wall: { y: 1, tiles: 6 },
            road: { y: 0, tiles: 6 }
        };

        this.drawTerrain(ctx, terrainMapping);

        for (var i = 0; i < this.factory.getTiles().length; i++) {
            var tile = this.factory.getTiles()[i];
            if (tile.getTerrain() === "wall") {
                this.drawTerrainBorders(ctx, tile, 7, 1, { grass: true, road: true });
            }
            if (tile.getTerrain() === "floor") {
                this.drawTerrainBorders(ctx, tile, 7, 1, { grass: true, road: true });
            }
            if (tile.getTerrain() === "road") {
                this.drawRoad(ctx, tile, 2, { road: true });
            }
            if (tile.getTerrain() === "wall") {
                this.drawTerrainBorders(ctx, tile, 10, 6, { floor: true, grass: true, road: true });
            }
        }

        if (this.shouldDrawBuildableAreas) {
            this.drawBuildableAreas(ctx);
        }
    };

    /**
     * Draw terrain borders (like original app's drawTerrainBorders)
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Object} tile - Tile object
     * @param {number} row - Sprite row
     * @param {number} variant - Sprite variant
     * @param {Object} adjacentTypes - Adjacent terrain types to check
     */
    BackgroundLayer.prototype.drawTerrainBorders = function(ctx, tile, row, variant, adjacentTypes) {
        var hasTop = !tile.getTileInDirection("top") || adjacentTypes[tile.getTileInDirection("top").getTerrain()];
        var hasRight = !tile.getTileInDirection("right") || adjacentTypes[tile.getTileInDirection("right").getTerrain()];
        var hasBottom = !tile.getTileInDirection("bottom") || adjacentTypes[tile.getTileInDirection("bottom").getTerrain()];
        var hasLeft = !tile.getTileInDirection("left") || adjacentTypes[tile.getTileInDirection("left").getTerrain()];

        var hasTopRight = !tile.getTileInDirection("top_right") || adjacentTypes[tile.getTileInDirection("top_right").getTerrain()];
        var hasTopLeft = !tile.getTileInDirection("top_left") || adjacentTypes[tile.getTileInDirection("top_left").getTerrain()];
        var hasBottomRight = !tile.getTileInDirection("bottom_right") || adjacentTypes[tile.getTileInDirection("bottom_right").getTerrain()];
        var hasBottomLeft = !tile.getTileInDirection("bottom_left") || adjacentTypes[tile.getTileInDirection("bottom_left").getTerrain()];

        var tileSize = this.tileSize;
        var g = tileSize + 1;
        var tileX = tile.getX() * tileSize;
        var tileY = tile.getY() * tileSize;
        var X = row * g;
        var Y = (row + 1) * g;
        var V = (row + 2) * g;
        var variantOffset = Math.floor(variant * Math.random()) * g;

        // Draw corner pieces
        if (hasTop && hasRight) ctx.drawImage(this.sprite, 3 * g + 10, V + 0, 11, 11, tileX + 10, tileY + 0, 11, 11);
        if (hasTop && hasLeft) ctx.drawImage(this.sprite, 3 * g + 0, V + 0, 11, 11, tileX + 0, tileY + 0, 11, 11);
        if (hasBottom && hasRight) ctx.drawImage(this.sprite, 3 * g + 10, V + 10, 11, 11, tileX + 10, tileY + 10, 11, 11);
        if (hasBottom && hasLeft) ctx.drawImage(this.sprite, 3 * g + 0, V + 10, 11, 11, tileX + 0, tileY + 10, 11, 11);

        // // Draw diagonal corner fixes
         if (hasTopRight && !hasTop && !hasRight) ctx.drawImage(this.sprite, 0 * g + 10, V + 0, 11, 11, tileX + 10, tileY + 0, 11, 11);
         if (hasTopLeft && !hasTop && !hasLeft) ctx.drawImage(this.sprite, 0 * g + 0, V + 0, 11, 11, tileX + 0, tileY + 0, 11, 11);
        if (hasBottomRight && !hasBottom && !hasRight) ctx.drawImage(this.sprite, 0 * g + 10, V + 10, 11, 11, tileX + 10, tileY + 10, 11, 11);
        if (hasBottomLeft && !hasBottom && !hasLeft) ctx.drawImage(this.sprite, 0 * g + 0, V + 10, 11, 11, tileX + 0, tileY + 10, 11, 11);

        // Draw edge pieces
        var leftOffset = hasLeft ? 10 : 0;
        var rightOffset = hasRight ? 10 : 0;
        var topOffset = hasTop ? 10 : 0;
        var bottomOffset = hasBottom ? 10 : 0;

        if (hasTop) ctx.drawImage(this.sprite, variantOffset + 0 + leftOffset, X + 0 + 0, tileSize - leftOffset - rightOffset, 11, tileX + 0 + leftOffset, tileY + 0, tileSize - leftOffset - rightOffset, 11);
        if (hasBottom) ctx.drawImage(this.sprite, variantOffset + 0 + leftOffset, X + 0 + 10, tileSize - leftOffset - rightOffset, 11, tileX + 0 + leftOffset, tileY + 10, tileSize - leftOffset - rightOffset, 11);
        if (hasRight) ctx.drawImage(this.sprite, variantOffset + 10, Y + 0 + topOffset, 11, tileSize - topOffset - bottomOffset, tileX + 10, tileY + 0 + topOffset, 11, tileSize - topOffset - bottomOffset);
        if (hasLeft) ctx.drawImage(this.sprite, variantOffset + 0, Y + 0 + topOffset, 11, tileSize - topOffset - bottomOffset, tileX + 0, tileY + 0 + topOffset, 11, tileSize - topOffset - bottomOffset);
    };

    /**
     * Draw road tiles (like original app's drawRoad)
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Object} tile - Tile object
     * @param {number} row - Sprite row
     * @param {Object} adjacentTypes - Adjacent terrain types to check
     */
    BackgroundLayer.prototype.drawRoad = function(ctx, tile, row, adjacentTypes) {
        var hasTop = !tile.getTileInDirection("top") || adjacentTypes[tile.getTileInDirection("top").getTerrain()];
        var hasRight = !tile.getTileInDirection("right") || adjacentTypes[tile.getTileInDirection("right").getTerrain()];
        var hasBottom = !tile.getTileInDirection("bottom") || adjacentTypes[tile.getTileInDirection("bottom").getTerrain()];
        var hasLeft = !tile.getTileInDirection("left") || adjacentTypes[tile.getTileInDirection("left").getTerrain()];

        var roadPatterns = {
            "0000": [0, 0], // No connections
            1000: [1, 0],  // Top only
            "0100": [2, 0], // Right only
            "0010": [3, 0], // Bottom only
            "0001": [4, 0], // Left only
            1010: [0, 1],  // Top and bottom
            "0101": [0, 2], // Left and right
            1100: [0, 3],  // Top and right
            "0110": [1, 3], // Right and bottom
            "0011": [2, 3], // Bottom and left
            1001: [3, 3],  // Top and left
            1111: [4, 4],  // All directions
            1110: [0, 4],  // All except left
            "0111": [1, 4], // All except top
            1011: [2, 4],  // All except right
            1101: [3, 4],  // All except bottom
        };

        var patternKey = (hasTop ? "1" : "0") + (hasRight ? "1" : "0") + (hasBottom ? "1" : "0") + (hasLeft ? "1" : "0");
        var pattern = roadPatterns[patternKey];

        if (pattern) {
            var tileX = tile.getX() * this.tileSize;
            var tileY = tile.getY() * this.tileSize;
            var spriteX = pattern[0] * (this.tileSize + 1);
            var spriteY = (row + pattern[1]) * (this.tileSize + 1);

            ctx.drawImage(
                this.sprite,
                spriteX, spriteY,
                this.tileSize, this.tileSize,
                tileX, tileY,
                this.tileSize, this.tileSize
            );
        }
    };

    /**
     * Draw buildable areas overlay (like original app)
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    BackgroundLayer.prototype.drawBuildableAreas = function(ctx) {
        var buildableTypeImages = {
            " ": "greenSelection",
            "-": "yellowSelection",
            "X": "redSelection"
        };

        for (var i = 0; i < this.factory.getTiles().length; i++) {
            var tile = this.factory.getTiles()[i];
            var buildableType = tile.getBuildableType();
            var imageName = buildableTypeImages[buildableType];

            if (imageName) {
                var selectionImage = this.imageMap.getImage(imageName);
                if (selectionImage) {
                    var tileX = tile.getX() * this.tileSize;
                    var tileY = tile.getY() * this.tileSize;

                    ctx.drawImage(
                        selectionImage,
                        tileX, tileY,
                        this.tileSize, this.tileSize
                    );
                }
            }
        }
    };

    /**
     * Get the canvas element
     * @returns {HTMLCanvasElement}
     */
    BackgroundLayer.prototype.getCanvas = function() {
        return this.canvas;
    };

    /**
     * Refresh the background layer
     */
    BackgroundLayer.prototype.refresh = function() {
        this.redraw();
    };

    /**
     * Destroy the background layer (like original app)
     */
    BackgroundLayer.prototype.destroy = function() {
        this.factory.getEventManager().removeListenerForType("LayerBackground");
        this.container.html("");
        this.container = null;
    };

    return BackgroundLayer;
});
