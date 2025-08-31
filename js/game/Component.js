/**
 * Component class - represents building blocks and game components
 * Extracted from original_app.js
 */
define("game/Component", [
    // TODO: These dependencies will need to be implemented as we extract more modules
    // "game/strategy/Factory"
], function() {
    
    /**
     * Component constructor
     * @param {Object} factory - Factory instance
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {Object} meta - Component metadata
     */
    var Component = function(factory, x, y, meta) {
        this.meta = meta;
        this.factory = factory;
        this.x = x;
        this.y = y;
        
        // TODO: Initialize strategy when strategy modules are available
        // this.strategy = Factory.getForComponent(this);
        this.strategy = this._createPlaceholderStrategy();
        
        this.surroundedInputTiles = [];
        this.surroundedOutputTiles = [];
    };

    /**
     * Get meta description data for a component
     * @param {Object} meta - Component metadata
     * @param {Object} factory - Factory instance
     * @param {Object} strategy - Component strategy
     * @returns {Object} Description data object
     */
    Component.getMetaDescriptionData = function(meta, factory, strategy) {
        // TODO: Implement when strategy factory is available
        // var data = Factory.getMetaDescriptionData(meta, factory, strategy);
        var data = {};
        Component._addCommonMetaDescriptionData(data, meta, factory, strategy);
        return data;
    };

    /**
     * Get description data for this component
     * @returns {Object} Description data object
     */
    Component.prototype.getDescriptionData = function() {
        // TODO: Implement when strategy is available
        // var data = this.strategy.getDescriptionData();
        var data = {};
        Component._addCommonMetaDescriptionData(data, this.meta, this.factory, this.strategy);
        return data;
    };

    /**
     * Add common meta description data
     * @param {Object} data - Data object to populate
     * @param {Object} meta - Component metadata
     * @param {Object} factory - Factory instance
     * @param {Object} strategy - Component strategy
     * @private
     */
    Component._addCommonMetaDescriptionData = function(data, meta, factory, strategy) {
        data.name = meta.name;
        data["is" + meta.strategy.type.ucFirst()] = true;
        data.description = meta.description;
        data.priceStr = "$" + (meta.price || 0);
        
        if (meta.runningCostPerTick) {
            data.runningCostStr = "$" + Component.getMetaRunningCostPerTick(meta, factory) + "/tick";
        }
    };

    /**
     * Calculate running cost per tick for a component
     * @param {Object} meta - Component metadata
     * @param {Object} factory - Factory instance
     * @returns {number} Running cost per tick
     */
    Component.getMetaRunningCostPerTick = function(meta, factory) {
        // TODO: Implement when upgrades manager is available
        var baseCost = meta.runningCostPerTick || 0;
        var upgradesBonus = 1; // TODO: Get from upgrades manager
        var profitMultiplier = factory.getGame().getProfitMultiplier();
        
        return baseCost * upgradesBonus * profitMultiplier;
    };

    /**
     * Get running cost per tick for this component
     * @returns {number} Running cost per tick
     */
    Component.prototype.getRunningCostPerTick = function() {
        return Component.getMetaRunningCostPerTick(this.meta, this.factory);
    };

    /**
     * Check for surrounded inputs/outputs in a specific direction
     * @param {number} x - X coordinate to check
     * @param {number} y - Y coordinate to check
     * @param {string} direction - Direction to check
     * @private
     */
    Component.prototype._checkForSurroundedInputsOutputs = function(x, y, direction) {
        // TODO: Implement when Tile and InputOutputManager are available
        // var tile = this.factory.getTile(x, y);
        // var outputTile = tile.getInputOutputManager().getOutputsByDirection()[direction];
        // var inputTile = tile.getInputOutputManager().getInputsByDirection()[direction];
        
        // if (outputTile) {
        //     this.surroundedOutputTiles.push({
        //         tile: outputTile,
        //         from: tile,
        //         direction: tile.getDirection(outputTile),
        //         oppositeDirection: outputTile.getDirection(tile)
        //     });
        // }
        
        // if (inputTile) {
        //     this.surroundedInputTiles.push({
        //         tile: inputTile,
        //         from: tile,
        //         direction: inputTile.getDirection(tile),
        //         oppositeDirection: tile.getDirection(inputTile)
        //     });
        // }
    };

    /**
     * Update the cache of surrounded tiles
     * @private
     */
    Component.prototype._updateSurroundedTilesCache = function() {
        this.surroundedInputTiles = [];
        this.surroundedOutputTiles = [];
        
        // Check all four sides of the component
        for (var x = this.x; x < this.x + this.meta.width; x++) {
            this._checkForSurroundedInputsOutputs(x, this.y, "top");
        }
        
        for (var y = this.y; y < this.y + this.meta.height; y++) {
            this._checkForSurroundedInputsOutputs(this.x + this.meta.width - 1, y, "right");
        }
        
        for (var x = this.x + this.meta.width - 1; x >= this.x; x--) {
            this._checkForSurroundedInputsOutputs(x, this.y + this.meta.height - 1, "bottom");
        }
        
        for (var y = this.y + this.meta.height - 1; y >= this.y; y--) {
            this._checkForSurroundedInputsOutputs(this.x, y, "left");
        }
    };

    /**
     * Handle when inputs/outputs change
     */
    Component.prototype.outputsInputsChanged = function() {
        this._updateSurroundedTilesCache();
        
        // TODO: Implement when strategy is available
        // this.getStrategy().clearContents();
        // if (this.getStrategy().updateInputsOutputs) {
        //     this.getStrategy().updateInputsOutputs();
        // }
    };

    /**
     * Get surrounded input tiles
     * @returns {Array} Array of input tile objects
     */
    Component.prototype.getSurroundedInputTiles = function() {
        return this.surroundedInputTiles;
    };

    /**
     * Get surrounded output tiles
     * @returns {Array} Array of output tile objects
     */
    Component.prototype.getSurroundedOutputTiles = function() {
        return this.surroundedOutputTiles;
    };

    /**
     * Calculate input tick costs
     * @param {Object} tickData - Tick data object
     */
    Component.prototype.calculateInputTick = function(tickData) {
        if (this.meta.runningCostPerTick > 0) {
            tickData.runningCosts += this.getRunningCostPerTick();
        }
    };

    /**
     * Get the factory instance
     * @returns {Object} Factory instance
     */
    Component.prototype.getFactory = function() {
        return this.factory;
    };

    /**
     * Get the component metadata
     * @returns {Object} Component metadata
     */
    Component.prototype.getMeta = function() {
        return this.meta;
    };

    /**
     * Get the component strategy
     * @returns {Object} Component strategy
     */
    Component.prototype.getStrategy = function() {
        return this.strategy;
    };

    /**
     * Get the X coordinate
     * @returns {number} X coordinate
     */
    Component.prototype.getX = function() {
        return this.x;
    };

    /**
     * Get the Y coordinate
     * @returns {number} Y coordinate
     */
    Component.prototype.getY = function() {
        return this.y;
    };

    /**
     * Get the main tile for this component
     * @returns {Object} Main tile object
     */
    Component.prototype.getMainTile = function() {
        return this.factory.getTile(this.x, this.y);
    };

    /**
     * Export component data to writer
     * @param {Object} writer - BinaryArrayWriter instance
     */
    Component.prototype.exportToWriter = function(writer) {
        // TODO: Implement when strategy is available
        // this.strategy.exportToWriter(writer);
        console.log("Component.exportToWriter - TODO: Implement strategy export");
    };

    /**
     * Import component data from reader
     * @param {Object} reader - BinaryArrayReader instance
     * @param {number} version - Save file version
     */
    Component.prototype.importFromReader = function(reader, version) {
        // TODO: Implement when strategy is available
        // this.strategy.importFromReader(reader, version);
        console.log("Component.importFromReader - TODO: Implement strategy import");
    };

    /**
     * Create a placeholder strategy until the real strategy factory is available
     * @returns {Object} Placeholder strategy object
     * @private
     */
    Component.prototype._createPlaceholderStrategy = function() {
        return {
            getDescriptionData: function() {
                return { name: "Placeholder Strategy" };
            },
            clearContents: function() {
                console.log("Placeholder strategy clearContents");
            },
            calculateInputTick: function(tick) {
                console.log("Placeholder strategy calculateInputTick", tick);
            },
            calculateOutputTick: function() {
                console.log("Placeholder strategy calculateOutputTick");
            },
            toString: function() {
                return "Placeholder Strategy";
            }
        };
    };

    return Component;
});
