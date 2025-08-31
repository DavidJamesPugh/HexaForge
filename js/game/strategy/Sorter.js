/**
 * Sorter strategy class - handles resource sorting and distribution logic for components
 * Extracted from original_app.js
 */
define("game/strategy/Sorter", [
    // TODO: These dependencies will need to be implemented as we extract more modules
    // "Game/strategy/helper/ResourceIntake",
    // "Game/strategy/helper/ResourceOutput",
    // "Game/strategy/helper/DelayedAction",
    // "game/strategy/helper/Package"
], function() {
    
    /**
     * Sorter strategy constructor
     * @param {Object} component - Component instance
     * @param {Object} meta - Strategy metadata
     */
    var Sorter = function(component, meta) {
        this.component = component;
        this.meta = meta;
        this.inputTileIndex = 0;
        this.inItem = null;
        this.inSortingItem = null;
        this.outItem = null;
        this.distributeTileIndexes = { default: 0 };
        this.sortingIndex = {};
        
        // Initialize sorting index for allowed outputs
        for (var outputId in this.component.getMeta().allowedOutputs) {
            this.sortingIndex[outputId] = null;
        }
        
        // TODO: Use DelayedAction when available
        // this.producer = new DelayedAction(this.meta.interval);
        // this.producer.canStart = this.canStartSorting.bind(this);
        // this.producer.start = this.startSorting.bind(this);
        // this.producer.finished = this.finishedSorting.bind(this);
        
        // Placeholder producer for now
        this.producer = this._createPlaceholderProducer();
    };
    
    /**
     * Create a placeholder producer while DelayedAction is not available
     * @returns {Object} Placeholder producer object
     * @private
     */
    Sorter.prototype._createPlaceholderProducer = function() {
        return {
            reset: function() { /* TODO: Implement when DelayedAction is available */ },
            calculate: function() { /* TODO: Implement when DelayedAction is available */ },
            updateWithDescriptionData: function(data) { /* TODO: Implement when DelayedAction is available */ },
            exportToWriter: function(writer) { /* TODO: Implement when DelayedAction is available */ },
            importFromReader: function(reader, version) { /* TODO: Implement when DelayedAction is available */ },
            toString: function() { return "Placeholder Producer"; }
        };
    };
    
    /**
     * Clear all contents and reset state
     */
    Sorter.prototype.clearContents = function() {
        this.inputTileIndex = 0;
        this.inItem = null;
        this.inSortingItem = null;
        this.outItem = null;
        this.distributeTileIndexes = { default: 0 };
        
        // Reset distribute indexes for sorting resources
        for (var resourceId in this.sortingIndex) {
            if (this.sortingIndex[resourceId]) {
                this.distributeTileIndexes[this.sortingIndex[resourceId]] = 0;
            }
        }
        
        if (this.producer && this.producer.reset) {
            this.producer.reset();
        }
    };
    
    /**
     * Get meta description data for sorter strategy
     * @param {Object} meta - Component metadata
     * @param {Object} factory - Factory instance
     * @param {Object} strategy - Strategy instance
     * @returns {Object} Description data object
     */
    Sorter.getMetaDescriptionData = function(meta, factory, strategy) {
        return {};
    };
    
    /**
     * Get description data for this sorter strategy
     * @returns {Object} Description data object
     */
    Sorter.prototype.getDescriptionData = function() {
        var data = Sorter.getMetaDescriptionData(this.component.getMeta(), this.component.getFactory(), this);
        
        if (this.producer && this.producer.updateWithDescriptionData) {
            this.producer.updateWithDescriptionData(data);
        }
        
        return data;
    };
    
    /**
     * Get the sorting index mapping
     * @returns {Object} Sorting index object
     */
    Sorter.prototype.getSortingIndex = function() {
        return this.sortingIndex;
    };
    
    /**
     * Set sorting resource for a specific direction
     * @param {string} direction - Direction string
     * @param {string} resourceId - Resource identifier
     * @param {string} targetResourceId - Target resource identifier
     */
    Sorter.prototype.setSortingResource = function(direction, resourceId, targetResourceId) {
        this.sortingIndex[direction + ":" + resourceId] = targetResourceId;
        this.clearContents();
    };
    
    /**
     * Get sorting resource for a specific direction
     * @param {string} direction - Direction string
     * @param {string} resourceId - Resource identifier
     * @returns {string|null} Target resource identifier or null
     */
    Sorter.prototype.getSortingResource = function(direction, resourceId) {
        return this.sortingIndex[direction + ":" + resourceId];
    };
    
    /**
     * Calculate input for a game tick
     */
    Sorter.prototype.calculateInputTick = function() {
        if (this.inItem === null) {
            var inputTiles = this.component.getSurroundedInputTiles();
            var newInputTileIndex = this.inputTileIndex;
            
            for (var i = 0; i < inputTiles.length; i++) {
                var inputTile = inputTiles[(this.inputTileIndex + i) % inputTiles.length];
                var outputQueue = inputTile.tile.getComponent().getStrategy().getOutputQueue(inputTile.direction);
                
                if (outputQueue && outputQueue.getLast) {
                    var lastItem = outputQueue.getLast();
                    if (lastItem && !this.inItem) {
                        outputQueue.unsetLast();
                        newInputTileIndex = (this.inputTileIndex + i + 1) % inputTiles.length;
                        this.inItem = lastItem;
                    }
                    
                    if (outputQueue.forward) {
                        outputQueue.forward();
                    }
                }
            }
            
            this.inputTileIndex = newInputTileIndex;
        }
    };
    
    /**
     * Calculate output for a game tick
     */
    Sorter.prototype.calculateOutputTick = function() {
        if (this.producer && this.producer.calculate) {
            this.producer.calculate();
        }
        this.moveItemOut();
    };
    
    /**
     * Move item to output
     */
    Sorter.prototype.moveItemOut = function() {
        if (this.outItem) {
            var resourceId = this.outItem.getResourceId();
            
            // Use default if resource not found in distribute indexes
            if (this.distributeTileIndexes[resourceId] === undefined) {
                resourceId = "default";
            }
            
            var outputTiles = this.component.getSurroundedOutputTiles();
            
            for (var i = 0; i < outputTiles.length; i++) {
                var outputTile = outputTiles[this.distributeTileIndexes[resourceId]];
                this.distributeTileIndexes[resourceId] = (this.distributeTileIndexes[resourceId] + 1) % outputTiles.length;
                
                var directionX = outputTile.from.getX() - this.component.getX();
                var directionY = outputTile.from.getY() - this.component.getY();
                var sortingResource = this.sortingIndex[directionX + ":" + directionY];
                
                // Check if sorting rules allow this resource
                if ((sortingResource && sortingResource !== this.outItem.getResourceId()) || 
                    (!sortingResource && this.distributeTileIndexes[this.outItem.getResourceId()] !== undefined)) {
                    continue;
                }
                
                var inputQueue = outputTile.tile.getComponent().getStrategy().getInputQueue(outputTile.oppositeDirection);
                
                if (inputQueue && inputQueue.getFirst && inputQueue.getFirst() === null) {
                    if (inputQueue.setFirst) {
                        inputQueue.setFirst(this.outItem);
                    }
                    this.outItem = null;
                    break;
                }
            }
        }
    };
    
    /**
     * Check if sorting can start
     * @returns {boolean} True if sorting can start
     */
    Sorter.prototype.canStartSorting = function() {
        return !this.outItem && this.inItem;
    };
    
    /**
     * Start sorting process
     */
    Sorter.prototype.startSorting = function() {
        this.inSortingItem = this.inItem;
        this.inItem = null;
    };
    
    /**
     * Finish sorting process
     */
    Sorter.prototype.finishedSorting = function() {
        this.outItem = this.inSortingItem;
        this.inSortingItem = null;
        this.moveItemOut();
    };
    
    /**
     * Get string representation of the sorter strategy
     * @returns {string} String representation
     */
    Sorter.prototype.toString = function() {
        var result = "";
        result += "Next: " + (this.inItem ? this.inItem.getResourceId() : "-") + "<br />";
        result += "Sorting: " + (this.inSortingItem ? this.inSortingItem.getResourceId() : "-") + "<br />";
        result += "Out: " + (this.outItem ? this.outItem.getResourceId() : "-") + "<br />";
        
        if (this.producer && this.producer.toString) {
            result += this.producer.toString() + "<br />";
        }
        
        result += "Sort rules: <br />";
        for (var rule in this.sortingIndex) {
            result += rule + ": " + this.sortingIndex[rule] + "<br />";
        }
        
        result += "<br />";
        result += "Input index: " + this.inputTileIndex + "<br />";
        result += "Out indexes: <br />";
        for (var resourceId in this.distributeTileIndexes) {
            result += resourceId + ": " + this.distributeTileIndexes[resourceId] + "<br />";
        }
        
        return result;
    };
    
    /**
     * Export sorter strategy data to writer
     * @param {Object} writer - BinaryArrayWriter instance
     */
    Sorter.prototype.exportToWriter = function(writer) {
        writer.writeUint8(this.inputTileIndex);
        
        // TODO: Use Package helper when available
        // Package.staticExportData(this.inItem, writer);
        // Package.staticExportData(this.inSortingItem, writer);
        // Package.staticExportData(this.outItem, writer);
        
        writer.writeUint8(this.distributeTileIndexes.default);
        
        for (var resourceId in this.sortingIndex) {
            var resource = this.sortingIndex[resourceId];
            var resourceIdNum = 0;
            var distributeIndex = 0;
            
            if (resource) {
                // TODO: Get resource ID number when meta is available
                // resourceIdNum = this.component.getFactory().getGame().getMeta().resourcesById[resource].idNum;
                distributeIndex = this.distributeTileIndexes[resource];
            }
            
            writer.writeUint8(resourceIdNum);
            writer.writeUint8(distributeIndex);
        }
        
        if (this.producer && this.producer.exportToWriter) {
            this.producer.exportToWriter(writer);
        }
    };
    
    /**
     * Import sorter strategy data from reader
     * @param {Object} reader - BinaryArrayReader instance
     * @param {number} version - Save file version
     */
    Sorter.prototype.importFromReader = function(reader, version) {
        this.inputTileIndex = reader.readUint8();
        
        // TODO: Use Package helper when available
        // this.inItem = Package.createFromExport(this.component.getFactory(), reader, version);
        // this.inSortingItem = Package.createFromExport(this.component.getFactory(), reader, version);
        // this.outItem = Package.createFromExport(this.component.getFactory(), reader, version);
        
        this.distributeTileIndexes = {};
        this.distributeTileIndexes.default = reader.readUint8();
        
        for (var resourceId in this.sortingIndex) {
            var resourceIdNum = reader.readUint8();
            // TODO: Set resource when meta is available
            // this.sortingIndex[resourceId] = resourceIdNum ? this.component.getFactory().getGame().getMeta().resourcesByIdNum[resourceIdNum].id : null;
            this.distributeTileIndexes[this.sortingIndex[resourceId]] = reader.readUint8();
        }
        
        if (this.producer && this.producer.importFromReader) {
            this.producer.importFromReader(reader, version);
        }
    };
    
    return Sorter;
});
