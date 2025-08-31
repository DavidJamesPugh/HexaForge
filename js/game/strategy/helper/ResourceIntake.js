/**
 * ResourceIntake Helper - Manages resource input and storage for components
 * Extracted from original_app.js
 */
define("game/strategy/helper/ResourceIntake", [], function() {
    
    var ResourceIntake = function(component, inputResources) {
        this.component = component;
        this.inputResources = inputResources;
        this.reset();
    };
    
    /**
     * Reset the resource intake manager
     */
    ResourceIntake.prototype.reset = function() {
        this.resources = {};
        this.inputTileIndex = [];
        
        // Initialize resources and input tile indices
        for (var resourceId in this.inputResources) {
            this.resources[resourceId] = 0;
            this.inputTileIndex.push({
                resource: resourceId,
                offset: 0
            });
        }
    };
    
    /**
     * Update description data with current resource information
     * @param {Object} data - Description data object to update
     */
    ResourceIntake.prototype.updateWithDescriptionData = function(data) {
        if (!data.stock) {
            data.stock = [];
        }
        
        var game = this.component.getFactory().getGame();
        var resourcesById = game.getMeta().resourcesById;
        
        for (var resourceId in this.inputResources) {
            var inputResource = this.inputResources[resourceId];
            var canUse = true;
            
            // Check if research is required
            if (inputResource.requiresResearch) {
                var researchManager = game.getResearchManager();
                if (researchManager) {
                    canUse = researchManager.getResearch(inputResource.requiresResearch) > 0;
                }
            }
            
            if (canUse) {
                var resource = resourcesById[resourceId];
                var resourceName = resource ? resource.nameShort : resourceId;
                
                data.stock.push({
                    resourceId: resourceId,
                    resourceName: resourceName,
                    amount: this.resources[resourceId],
                    max: this.getMax(resourceId)
                });
            }
        }
    };
    
    /**
     * Get maximum storage capacity for a resource
     * @param {string} resourceId - Resource identifier
     * @returns {number} Maximum storage capacity
     */
    ResourceIntake.prototype.getMax = function(resourceId) {
        var componentMeta = this.component.getMeta();
        var baseMax = this.inputResources[resourceId].max;
        
        // Get upgrade bonuses
        var upgradesManager = this.component.getFactory().getUpgradesManager();
        var componentBonuses = upgradesManager.getComponentBonuses(
            componentMeta.applyUpgradesFrom || componentMeta.id
        );
        var maxStorageBonus = componentBonuses.maxStorageBonus || 1;
        
        return baseMax * maxStorageBonus;
    };
    
    /**
     * Take in resources from surrounding input tiles
     */
    ResourceIntake.prototype.takeIn = function() {
        var surroundedInputTiles = this.component.getSurroundedInputTiles();
        
        // Process each input resource type
        for (var i = 0; i < this.inputTileIndex.length; i++) {
            var resourceId = this.inputTileIndex[i].resource;
            var offset = this.inputTileIndex[i].offset;
            var newOffset = offset;
            
            // Check each surrounding input tile
            for (var j = 0; j < surroundedInputTiles.length && this.resources[resourceId] < this.getMax(resourceId); j++) {
                var tileIndex = (offset + j) % surroundedInputTiles.length;
                var tile = surroundedInputTiles[tileIndex];
                
                if (tile && tile.tile && tile.tile.getComponent()) {
                    var component = tile.tile.getComponent();
                    var strategy = component.getStrategy();
                    
                    if (strategy && strategy.getOutputQueue) {
                        var outputQueue = strategy.getOutputQueue(tile.direction);
                        
                        if (outputQueue && outputQueue.getLast) {
                            var lastPackage = outputQueue.getLast();
                            
                            if (lastPackage && lastPackage.getResourceId() === resourceId) {
                                // Remove package from queue and add to storage
                                outputQueue.unsetLast();
                                newOffset = (offset + j + 1) % surroundedInputTiles.length;
                                this.resources[lastPackage.getResourceId()] += lastPackage.getAmount();
                            }
                        }
                    }
                }
            }
            
            this.inputTileIndex[i].offset = newOffset;
        }
        
        // Forward all output queues
        for (var k = 0; k < surroundedInputTiles.length; k++) {
            var tile = surroundedInputTiles[k];
            if (tile && tile.tile && tile.tile.getComponent()) {
                var component = tile.tile.getComponent();
                var strategy = component.getStrategy();
                
                if (strategy && strategy.getOutputQueue) {
                    var outputQueue = strategy.getOutputQueue(tile.direction);
                    if (outputQueue && outputQueue.forward) {
                        outputQueue.forward();
                    }
                }
            }
        }
    };
    
    /**
     * Add resources to storage
     * @param {string} resourceId - Resource identifier
     * @param {number} amount - Amount to add
     */
    ResourceIntake.prototype.addResource = function(resourceId, amount) {
        if (!this.resources[resourceId]) {
            this.resources[resourceId] = 0;
        }
        this.resources[resourceId] += amount;
    };
    
    /**
     * Get current resource amount
     * @param {string} resourceId - Resource identifier
     * @returns {number} Current resource amount
     */
    ResourceIntake.prototype.getResource = function(resourceId) {
        return this.resources[resourceId] || 0;
    };
    
    /**
     * Get string representation of the resource intake manager
     * @returns {string} String representation
     */
    ResourceIntake.prototype.toString = function() {
        var str = "IN<br />";
        
        for (var i = 0; i < this.inputTileIndex.length; i++) {
            var index = this.inputTileIndex[i];
            var resourceId = index.resource;
            var amount = this.resources[resourceId] || 0;
            var offset = index.offset;
            
            str += resourceId + ": " + amount + " (offset:" + offset + ")<br />";
        }
        
        return str;
    };
    
    /**
     * Export data to writer
     * @param {Object} writer - BinaryArrayWriter instance
     */
    ResourceIntake.prototype.exportToWriter = function(writer) {
        // TODO: Implement when BinaryArrayWriter is available
        // writer.writeUint8(this.inputTileIndex.length);
        // for (var i = 0; i < this.inputTileIndex.length; i++) {
        //     var index = this.inputTileIndex[i];
        //     writer.writeUint32(this.resources[index.resource]);
        //     writer.writeUint8(index.offset);
        // }
        console.log("ResourceIntake.exportToWriter - BinaryArrayWriter not yet extracted");
    };
    
    /**
     * Import data from reader
     * @param {Object} reader - BinaryArrayReader instance
     * @param {Object} factory - Factory instance
     */
    ResourceIntake.prototype.importFromReader = function(reader, factory) {
        // TODO: Implement when BinaryArrayReader is available
        // var count = Math.min(this.inputTileIndex.length, reader.readUint8());
        // for (var i = 0; i < count; i++) {
        //     this.resources[this.inputTileIndex[i].resource] = reader.readUint32();
        //     this.inputTileIndex[i].offset = reader.readUint8();
        // }
        console.log("ResourceIntake.importFromReader - BinaryArrayReader not yet extracted");
    };
    
    return ResourceIntake;
});
