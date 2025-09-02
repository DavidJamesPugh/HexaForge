/**
 * Tile class - represents individual tiles in the factory grid
 * Extracted from original_app.js
 */
define("game/Tile", [
    "game/InputOutputManager",
    // TODO: These dependencies will need to be implemented as we extract more modules
    // "game/Component"
], function(InputOutputManager) {
    
    // Direction constants for tile positioning
    var DIRECTIONS = {
        top: [0, -1],
        right: [1, 0],
        bottom: [0, 1],
        left: [-1, 0],
        top_right: [1, -1],
        top_left: [-1, -1],
        bottom_right: [1, 1],
        bottom_left: [-1, 1]
    };
    
    // Direction mapping for coordinate differences
    var DIRECTION_MAP = {
        "-10": "top",
        "-1": "left",
        1: "right",
        10: "bottom"
    };
    
    // Buildable type constants
    var BUILDABLE_NO = "X";
    var BUILDABLE_YES = " ";
    var BUILDABLE_PARTIAL = "-";
    
    /**
     * Tile constructor
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {string} buildableType - Type of building allowed
     * @param {string} terrain - Terrain type
     * @param {Object} factory - Factory instance
     */
    var Tile = function(x, y, buildableType, terrain, factory) {
        this.id = y * factory.getMeta().tilesX + x;
        this.x = x;
        this.y = y;
        this.factory = factory;
        
        this.setTerrain(terrain);
        this.setBuildableType(buildableType);
        
        this.component = null;
        
        // Initialize input/output manager
        this.inputOutputManager = new InputOutputManager(this, function() {
            if (this.component) {
                this.component.outputsInputsChanged();
            }
        }.bind(this));
    };
    
    // Static constants
    Tile.BUILDABLE_NO = BUILDABLE_NO;
    Tile.BUILDABLE_YES = BUILDABLE_YES;
    Tile.BUILDABLE_PARTIAL = BUILDABLE_PARTIAL;
    
    /**
     * Get the tile ID
     * @returns {number} Tile ID
     */
    Tile.prototype.getId = function() {
        return this.id;
    };
    
    /**
     * Get the tile ID as a string
     * @returns {string} Tile ID string (x:y format)
     */
    Tile.prototype.getIdStr = function() {
        return this.x + ":" + this.y;
    };
    
    /**
     * Get the X coordinate
     * @returns {number} X coordinate
     */
    Tile.prototype.getX = function() {
        return this.x;
    };
    
    /**
     * Get the Y coordinate
     * @returns {number} Y coordinate
     */
    Tile.prototype.getY = function() {
        return this.y;
    };
    
    /**
     * Set the buildable type for this tile
     * @param {string} buildableType - Type of building allowed
     */
    Tile.prototype.setBuildableType = function(buildableType) {
        if (buildableType != BUILDABLE_YES && buildableType != BUILDABLE_PARTIAL) {
            buildableType = BUILDABLE_NO;
        }
        this.buildableType = buildableType;
    };
    
    /**
     * Get the buildable type for this tile
     * @returns {string} Buildable type
     */
    Tile.prototype.getBuildableType = function() {
        return this.buildableType;
    };
    
    /**
     * Check if it's possible to build a component on this tile
     * @param {Object} component - Component to check
     * @returns {boolean} True if building is possible
     */
    Tile.prototype.isPossibleToBuildOnType = function(component) {
        return this.buildableType == BUILDABLE_YES || 
               (component.canBuildToPartial && this.buildableType == BUILDABLE_PARTIAL);
    };
    
    /**
     * Set the terrain type for this tile
     * @param {string} terrain - Terrain type
     */
    Tile.prototype.setTerrain = function(terrain) {
        if (!terrain) {
            terrain = "grass";
        }
        this.terrain = terrain;
    };
    
    /**
     * Get the terrain type for this tile
     * @returns {string} Terrain type
     */
    Tile.prototype.getTerrain = function() {
        return this.terrain;
    };
    
    /**
     * Get the input/output manager for this tile
     * @returns {Object} InputOutputManager instance
     */
    Tile.prototype.getInputOutputManager = function() {
        return this.inputOutputManager || null;
    };
    
    /**
     * Get the direction from this tile to another tile
     * @param {Object} otherTile - Target tile
     * @returns {string} Direction string
     */
    Tile.prototype.getDirection = function(otherTile) {
        var deltaY = otherTile.getY() - this.y;
        var deltaX = otherTile.getX() - this.x;
        var key = String(10 * deltaY + deltaX);
        return DIRECTION_MAP[key] || null;
    };
    
    /**
     * Get the tile in a specific direction
     * @param {string} direction - Direction to look
     * @returns {Object|null} Tile in that direction or null
     */
    Tile.prototype.getTileInDirection = function(direction) {
        var directionVector = DIRECTIONS[direction];
        if (!directionVector) {
            return null;
        }
        return this.factory.getTile(this.x + directionVector[0], this.y + directionVector[1]);
    };
    
    /**
     * Check if this tile is the main container for a component
     * @returns {boolean} True if this is the main component container
     */
    Tile.prototype.isMainComponentContainer = function() {
        return !!this.component && 
               this.component.getX() == this.x && 
               this.component.getY() == this.y;
    };
    
    /**
     * Get the factory instance
     * @returns {Object} Factory instance
     */
    Tile.prototype.getFactory = function() {
        return this.factory;
    };
    
    /**
     * Get the component on this tile
     * @returns {Object|null} Component instance or null
     */
    Tile.prototype.getComponent = function() {
        return this.component;
    };
    
    /**
     * Set a component on this tile
     * @param {Object} component - Component instance or null
     */
    Tile.prototype.setComponent = function(component) {
        if (component) {
            // Store the component reference
            this.component = component;
            
            // TODO: Set component on all tiles it occupies when Component class is available
            // if (component.getWidth && component.getHeight) {
            //     for (var dx = 0; dx < component.getWidth(); dx++) {
            //         for (var dy = 0; dy < component.getHeight(); dy++) {
            //             var tile = this.factory.getTile(this.x + dx, this.y + dy);
            //             if (tile && tile !== this) {
            //                 tile.component = component;
            //             }
            //         }
            //     }
            // }
            
            // Reset input/output manager when component is placed
            if (this.inputOutputManager && typeof this.inputOutputManager.reset === 'function') {
                this.inputOutputManager.reset();
            }
        } else {
            this.component = null;
            
            // Reset input/output manager when component is removed
            if (this.inputOutputManager && typeof this.inputOutputManager.reset === 'function') {
                this.inputOutputManager.reset();
            }
        }
    };
    
    /**
     * Export tile data to writer (part 1 - input/output manager)
     * @param {Object} writer - BinaryArrayWriter instance
     */
    Tile.prototype.exportToWriter1 = function(writer) {
        // TODO: Export input/output manager when available
        // this.inputOutputManager.exportToWriter(writer);
        console.log("Tile.exportToWriter1 - TODO: Implement InputOutputManager export");
    };
    
    /**
     * Export tile data to writer (part 2 - component)
     * @param {Object} writer - BinaryArrayWriter instance
     */
    Tile.prototype.exportToWriter2 = function(writer) {
        // TODO: Export component when available
        // if (this.component) {
        //     this.component.exportToWriter(writer);
        // }
        console.log("Tile.exportToWriter2 - TODO: Implement Component export");
    };
    
    /**
     * Import tile data from reader (part 1 - input/output manager)
     * @param {Object} reader - BinaryArrayReader instance
     * @param {number} version - Save file version
     */
    Tile.prototype.importFromReader1 = function(reader, version) {
        // TODO: Import input/output manager when available
        // this.inputOutputManager.importFromReader(reader, version);
        console.log("Tile.importFromReader1 - TODO: Implement InputOutputManager import");
    };
    
    /**
     * Import tile data from reader (part 2 - component)
     * @param {Object} reader - BinaryArrayReader instance
     * @param {number} version - Save file version
     */
    Tile.prototype.importFromReader2 = function(reader, version) {
        // TODO: Import component when available
        // if (this.component) {
        //     this.component.importFromReader(reader, version);
        // }
        console.log("Tile.importFromReader2 - TODO: Implement Component import");
    };
    
    return Tile;
});
