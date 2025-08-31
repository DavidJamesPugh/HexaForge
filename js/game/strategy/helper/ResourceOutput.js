/**
 * ResourceOutput Helper - Manages resource output and distribution for components
 * Extracted from original_app.js
 */
define("game/strategy/helper/ResourceOutput", [
    "game/strategy/helper/Package"
], function(Package) {
    
    var ResourceOutput = function(component, handledResources, outputResourcesOrder) {
        this.component = component;
        this.handledResources = handledResources;
        this.outputResourcesOrder = outputResourcesOrder;
        this.reset();
    };
    
    /**
     * Reset the resource output manager
     */
    ResourceOutput.prototype.reset = function() {
        this.resources = {};
        
        // Initialize resources for each output resource type
        for (var i = 0; i < this.outputResourcesOrder.length; i++) {
            var resourceId = this.outputResourcesOrder[i];
            this.resources[resourceId] = 0;
        }
        
        this.outResourceSelectionIndex = 0;
        this.distributeTileIndex = 0;
    };
    
    /**
     * Update description data with current resource information
     * @param {Object} data - Description data object to update
     */
    ResourceOutput.prototype.updateWithDescriptionData = function(data) {
        if (!data.stock) {
            data.stock = [];
        }
        
        var game = this.component.getFactory().getGame();
        var resourcesById = game.getMeta().resourcesById;
        
        for (var resourceId in this.resources) {
            var resource = resourcesById[resourceId];
            var resourceName = resource ? resource.nameShort : resourceId;
            
            data.stock.push({
                resourceId: resourceId,
                resourceName: resourceName,
                amount: this.resources[resourceId],
                max: this.getMax(resourceId)
            });
        }
    };
    
    /**
     * Get maximum storage capacity for a resource
     * @param {string} resourceId - Resource identifier
     * @returns {number} Maximum storage capacity
     */
    ResourceOutput.prototype.getMax = function(resourceId) {
        var componentMeta = this.component.getMeta();
        var baseMax = this.handledResources[resourceId].max;
        
        // Get upgrade bonuses
        var upgradesManager = this.component.getFactory().getUpgradesManager();
        var componentBonuses = upgradesManager.getComponentBonuses(
            componentMeta.applyUpgradesFrom || componentMeta.id
        );
        var maxStorageBonus = componentBonuses.maxStorageBonus || 1;
        
        return baseMax * maxStorageBonus;
    };
    
    /**
     * Get meta output amount for a component
     * @param {Object} componentMeta - Component metadata
     * @param {Object} factory - Factory instance
     * @returns {number} Output amount
     */
    ResourceOutput.getMetaOutputAmount = function(componentMeta, factory) {
        var baseAmount = 1;
        
        // Get upgrade bonuses
        var upgradesManager = factory.getUpgradesManager();
        var globalBonuses = upgradesManager.getBonuses();
        var componentBonuses = upgradesManager.getComponentBonuses(componentMeta.id);
        
        var packageSizeBonus = (globalBonuses.packageSizeBonus || 0) + (componentBonuses.packageSizeBonus || 0);
        
        return baseAmount + packageSizeBonus;
    };
    
    /**
     * Get output amount for this component
     * @returns {number} Output amount
     */
    ResourceOutput.prototype.getOutputAmount = function() {
        return ResourceOutput.getMetaOutputAmount(this.component.getMeta(), this.component.getFactory());
    };
    
    /**
     * Distribute resources to surrounding output tiles
     */
    ResourceOutput.prototype.distribute = function() {
        var surroundedOutputTiles = this.component.getSurroundedOutputTiles();
        
        for (var i = 0; i < surroundedOutputTiles.length; i++) {
            var nextResource = this._getNextOutputResource();
            if (!nextResource) break;
            
            var tile = surroundedOutputTiles[this.distributeTileIndex];
            this.distributeTileIndex = (this.distributeTileIndex + 1) % surroundedOutputTiles.length;
            
            if (tile && tile.tile && tile.tile.getComponent()) {
                var component = tile.tile.getComponent();
                var strategy = component.getStrategy();
                
                if (strategy && strategy.getInputQueue) {
                    var inputQueue = strategy.getInputQueue(tile.oppositeDirection);
                    
                    if (inputQueue && inputQueue.getFirst && inputQueue.setFirst) {
                        if (inputQueue.getFirst() === null) {
                            var outputAmount = this.getOutputAmount();
                            
                            // Create package and add to input queue
                            var packageInstance = new Package(nextResource, outputAmount, this.component.getFactory());
                            inputQueue.setFirst(packageInstance);
                            
                            // Remove resources from storage and update indices
                            this.resources[nextResource] -= outputAmount;
                            this.outResourceSelectionIndex = (this.outResourceSelectionIndex + 1) % this.outputResourcesOrder.length;
                        }
                    }
                }
            }
        }
    };
    
    /**
     * Get the next available output resource
     * @returns {string|null} Resource ID or null if none available
     * @private
     */
    ResourceOutput.prototype._getNextOutputResource = function() {
        for (var i = 0; i < this.outputResourcesOrder.length; i++) {
            var resourceId = this.outputResourcesOrder[(this.outResourceSelectionIndex + i) % this.outputResourcesOrder.length];
            
            if (this.resources[resourceId] >= this.getOutputAmount()) {
                return resourceId;
            }
        }
        
        // Reset selection index and return null if no resources available
        this.outResourceSelectionIndex = 0;
        return null;
    };
    
    /**
     * Add resources to storage
     * @param {string} resourceId - Resource identifier
     * @param {number} amount - Amount to add
     */
    ResourceOutput.prototype.addResource = function(resourceId, amount) {
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
    ResourceOutput.prototype.getResource = function(resourceId) {
        return this.resources[resourceId] || 0;
    };
    
    /**
     * Get string representation of the resource output manager
     * @returns {string} String representation
     */
    ResourceOutput.prototype.toString = function() {
        var str = "OUT outIndex:" + this.distributeTileIndex + " resIndex:" + this.outResourceSelectionIndex + "<br />";
        
        for (var resourceId in this.resources) {
            str += resourceId + ": " + this.resources[resourceId] + "<br />";
        }
        
        return str;
    };
    
    /**
     * Export data to writer
     * @param {Object} writer - BinaryArrayWriter instance
     */
    ResourceOutput.prototype.exportToWriter = function(writer) {
        // TODO: Implement when BinaryArrayWriter is available
        // var count = 0;
        // for (var resourceId in this.resources) count++;
        // writer.writeUint8(count);
        // for (var resourceId in this.resources) {
        //     writer.writeUint32(this.resources[resourceId]);
        // }
        // writer.writeUint8(this.outResourceSelectionIndex);
        // writer.writeUint8(this.distributeTileIndex);
        console.log("ResourceOutput.exportToWriter - BinaryArrayWriter not yet extracted");
    };
    
    /**
     * Import data from reader
     * @param {Object} reader - BinaryArrayReader instance
     * @param {Object} factory - Factory instance
     */
    ResourceOutput.prototype.importFromReader = function(reader, factory) {
        // TODO: Implement when BinaryArrayReader is available
        // var count = reader.readUint8();
        // var i = 0;
        // for (var resourceId in this.resources) {
        //     if (i >= count) break;
        //     this.resources[resourceId] = reader.readUint32();
        //     i++;
        // }
        // this.outResourceSelectionIndex = reader.readUint8();
        // this.distributeTileIndex = reader.readUint8();
        console.log("ResourceOutput.importFromReader - BinaryArrayReader not yet extracted");
    };
    
    return ResourceOutput;
});
