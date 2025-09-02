/**
 * Factory class - manages factory tiles, components, and operations
 * Extracted from original_app.js
 */
define("game/Factory", [
    "base/EventManager",
    "config/event/FactoryEvent",
    "game/Tile",
    "game/Component"
    // TODO: These dependencies will need to be implemented as we extract more modules
    // "game/UpgradesManager",
    // "game/AreasManager",
    // "game/FactorySetup"
], function(EventManager, FactoryEvent, Tile, Component) {
    
    /**
     * Factory constructor
     * @param {Object} meta - Factory metadata configuration
     * @param {Object} game - Game instance
     */
    var Factory = function(meta, game) {
        this.game = game;
        this.isPaused = meta.isPaused || false;
        this.isBought = meta.isBought || false;
        this.meta = meta;
        
        // Create event manager for factory events
        this.em = new EventManager(FactoryEvent, "Factory");
        
        // TODO: Initialize managers when their modules are extracted
        // this.upgradesManager = new UpgradesManager(this);
        // this.areasManager = new AreasManager(this);
        
        // Initialize tiles array
        this.tiles = [];
        
        // Initialize tiles using terrainMap and buildMap from meta
        for (var y = 0; y < this.meta.tilesY; y++) {
            for (var x = 0; x < this.meta.tilesX; x++) {
                var terrain = this.meta.terrains[this.meta.terrainMap[y * this.meta.tilesX + x]];
                var buildType = this.meta.buildMap[y * this.meta.tilesX + x];
                this.tiles[y * this.meta.tilesX + x] = new Tile(x, y, buildType, terrain, this);
            }
        }
    };

    /**
     * Reset the factory to initial state
     */
    Factory.prototype.reset = function() {
        // TODO: Reset tiles when Tile class is available
        // for (var i = 0; i < this.tiles.length; i++) {
        //     this.tiles[i].setComponent(null);
        // }
        
        // TODO: Initialize factory setup when FactorySetup is available
        // new FactorySetup(this).init();
    };

    /**
     * Get the factory event manager
     * @returns {EventManager} Event manager instance
     */
    Factory.prototype.getEventManager = function() {
        return this.em;
    };

    /**
     * Get the upgrades manager
     * @returns {Object} UpgradesManager instance
     */
    Factory.prototype.getUpgradesManager = function() {
        return this.upgradesManager || null;
    };

    /**
     * Get the areas manager
     * @returns {Object} AreasManager instance
     */
    Factory.prototype.getAreasManager = function() {
        return this.areasManager || null;
    };

    /**
     * Get the factory metadata
     * @returns {Object} Factory metadata
     */
    Factory.prototype.getMeta = function() {
        return this.meta;
    };

    /**
     * Set whether the factory is bought
     * @param {boolean} isBought - Whether the factory is purchased
     */
    Factory.prototype.setIsBought = function(isBought) {
        this.isBought = isBought;
    };

    /**
     * Check if the factory is bought
     * @returns {boolean} True if factory is purchased
     */
    Factory.prototype.getIsBought = function() {
        return this.isBought;
    };

    /**
     * Get the game instance
     * @returns {Object} Game instance
     */
    Factory.prototype.getGame = function() {
        return this.game;
    };

    /**
     * Get all factory tiles
     * @returns {Array} Array of tile objects
     */
    Factory.prototype.getTiles = function() {
        return this.tiles;
    };

    /**
     * Get a specific tile by coordinates
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {Object|null} Tile object or null if out of bounds
     */
    Factory.prototype.getTile = function(x, y) {
        if (x < 0 || x >= this.meta.tilesX || y < 0 || y >= this.meta.tilesY) {
            return null;
        }
        return this.tiles[y * this.meta.tilesX + x];
    };

    /**
     * Check if factory is paused
     * @returns {boolean} True if factory is paused
     */
    Factory.prototype.getIsPaused = function() {
        return this.isPaused;
    };

    /**
     * Set factory pause state
     * @param {boolean} isPaused - Whether to pause the factory
     */
    Factory.prototype.setIsPaused = function(isPaused) {
        this.isPaused = isPaused;
    };
    
    /**
     * Set factory pause state (alias for setIsPaused)
     * @param {boolean} isPaused - Whether to pause the factory
     */
    Factory.prototype.setPaused = function(isPaused) {
        this.isPaused = isPaused;
    };
    
    /**
     * Set whether the factory is bought
     * @param {boolean} isBought - Whether the factory is purchased
     */
    Factory.prototype.setIsBought = function(isBought) {
        this.isBought = isBought;
    };
    
    /**
     * Set whether the factory is bought (alias for setIsBought)
     * @param {boolean} isBought - Whether the factory is purchased
     */
    Factory.prototype.setBought = function(isBought) {
        this.isBought = isBought;
    };
    
    /**
     * Get a specific tile by coordinates (alias for getTile)
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {Object|null} Tile object or null if out of bounds
     */
    Factory.prototype.getTileAt = function(x, y) {
        return this.getTile(x, y);
    };

    /**
     * Check if coordinates are within map bounds
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {number} width - Width of area to check
     * @param {number} height - Height of area to check
     * @returns {boolean} True if coordinates are within bounds
     */
    Factory.prototype.isOnMap = function(x, y, width, height) {
        return x >= 0 && y >= 0 && 
               x + width <= this.meta.tilesX && 
               y + height <= this.meta.tilesY;
    };

    /**
     * Check if it's possible to build on a specific area
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {number} width - Width of building area
     * @param {number} height - Height of building area
     * @param {string} buildType - Type of building to place
     * @returns {boolean} True if building is possible
     */
    Factory.prototype.isPossibleToBuildOnTypeWithSize = function(x, y, width, height, buildType) {
        if (!width) width = 1;
        if (!height) height = 1;
        
        if (!this.isOnMap(x, y, width, height)) {
            return false;
        }
        
        // TODO: Implement tile checking when Tile class is available
        // for (var dx = 0; dx < width; dx++) {
        //     for (var dy = 0; dy < height; dy++) {
        //         var tile = this.getTile(x + dx, y + dy);
        //         if (!tile || !tile.isPossibleToBuildOnType(buildType) || tile.getComponent()) {
        //             return false;
        //         }
        //     }
        // }
        
        return true;
    };

    /**
     * Export factory state to writer
     * @returns {Object} BinaryArrayWriter with factory data
     */
    Factory.prototype.exportToWriter = function() {
        // TODO: Implement BinaryArrayWriter when available
        console.log("Factory.exportToWriter - TODO: Implement BinaryArrayWriter");
        return null;
    };

    /**
     * Import factory state from reader
     * @param {Object} reader - BinaryArrayReader with factory data
     * @param {number} version - Save file version
     */
    Factory.prototype.importFromReader = function(reader, version) {
        // TODO: Implement BinaryArrayReader when available
        console.log("Factory.importFromReader - TODO: Implement BinaryArrayReader");
        
        // TODO: Trigger components changed event when import is complete
        // this.em.invokeEvent(FactoryEvent.FACTORY_COMPONENTS_CHANGED);
    };
    
    /**
     * Import factory state from JSON data
     * @param {Object} factoryData - JSON factory data
     */
    Factory.prototype.importFromJson = function(factoryData) {
        if (!factoryData) return;
        
        console.log("Factory.importFromJson called with:", factoryData);
        
        // Import factory state
        if (factoryData.isPaused !== undefined) {
            this.setPaused(factoryData.isPaused);
        }
        if (factoryData.isBought !== undefined) {
            this.setBought(factoryData.isBought);
        }
        
        // Import component positions
        if (factoryData.tiles) {
            this._importTilesFromJson(factoryData.tiles);
        }
        
        // Trigger components changed event like the original app
        if (this.em && this.em.invokeEvent) {
            this.em.invokeEvent("FACTORY_COMPONENTS_CHANGED");
        }
    };
    
    /**
     * Import tiles and component positions from JSON data
     * @param {Object} tilesData - JSON tiles data
     * @private
     */
    Factory.prototype._importTilesFromJson = function(tilesData) {
        if (!tilesData || !this.tiles) return;
        
        // Clear existing components first
        for (var i = 0; i < this.tiles.length; i++) {
            if (this.tiles[i] && this.tiles[i].setComponent) {
                this.tiles[i].setComponent(null);
            }
        }
        
        // Import component positions
        for (var tileKey in tilesData) {
            var tileData = tilesData[tileKey];
            if (tileData && tileData.x !== undefined && tileData.y !== undefined && tileData.componentId) {
                var tile = this.getTileAt(tileData.x, tileData.y);
                if (tile) {
                    // Get component meta from the game
                    var componentMeta = this.game.getComponentMeta ? this.game.getComponentMeta(tileData.componentId) : null;
                    if (componentMeta) {
                        // Create component using the Component class
                        if (typeof Component !== 'undefined') {
                            var component = new Component(this, tileData.x, tileData.y, componentMeta);
                            tile.setComponent(component);
                            console.log("Placed component:", tileData.componentId, "at position:", tileData.x, tileData.y);
                        } else {
                            console.warn("Component class not available for:", tileData.componentId);
                        }
                    } else {
                        console.warn("Component meta not found for:", tileData.componentId);
                    }
                }
            }
        }
    };

    return Factory;
});
