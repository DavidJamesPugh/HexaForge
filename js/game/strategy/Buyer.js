/**
 * Buyer strategy class - handles resource buying logic for components
 * Extracted from original_app.js
 */
define("game/strategy/Buyer", [
    // TODO: These dependencies will need to be implemented as we extract more modules
    // "game/strategy/helper/ResourceOutput",
    // "game/strategy/helper/DelayedAction"
], function() {
    
    /**
     * Buyer strategy constructor
     * @param {Object} component - Component instance
     * @param {Object} meta - Strategy metadata
     */
    var Buyer = function(component, meta) {
        this.component = component;
        this.game = this.component.getFactory().getGame();
        this.meta = meta;
        
        // TODO: Initialize managers when their modules are extracted
        // this.outResourcesManager = new ResourceOutput(component, meta.purchaseResources, meta.outputResourcesOrder);
        // this.producer = new DelayedAction(this.meta.interval);
        
        // TODO: Set up producer callbacks when DelayedAction is available
        // this.producer.canStart = this.canBuy.bind(this);
        // this.producer.start = this.preparePurchase.bind(this);
        // this.producer.finished = this.finishPurchase.bind(this);
    };

    /**
     * Get meta buy price for a resource
     * @param {Object} meta - Component metadata
     * @param {string} resourceId - Resource identifier
     * @param {Object} factory - Factory instance
     * @returns {number} Buy price for the resource
     */
    Buyer.getMetaBuyPrice = function(meta, resourceId, factory) {
        var basePrice = meta.strategy.purchaseResources[resourceId].price;
        var profitMultiplier = factory.getGame().getProfitMultiplier();
        return basePrice * profitMultiplier;
    };

    /**
     * Get buy price for a specific resource
     * @param {string} resourceId - Resource identifier
     * @returns {number} Buy price for the resource
     */
    Buyer.prototype.getBuyPrice = function(resourceId) {
        return Buyer.getMetaBuyPrice(this.component.getMeta(), resourceId, this.component.getFactory());
    };

    /**
     * Get meta buy amount for a resource
     * @param {Object} meta - Component metadata
     * @param {string} resourceId - Resource identifier
     * @param {Object} factory - Factory instance
     * @returns {number} Buy amount for the resource
     */
    Buyer.getMetaBuyAmount = function(meta, resourceId, factory) {
        var baseAmount = meta.strategy.purchaseResources[resourceId].amount;
        // TODO: Get from upgrades manager when available
        var buyAmountBonus = 1; // factory.getUpgradesManager().getComponentBonuses(meta.id).buyAmountBonus;
        return baseAmount * buyAmountBonus;
    };

    /**
     * Get buy amount for a specific resource
     * @param {string} resourceId - Resource identifier
     * @returns {number} Buy amount for the resource
     */
    Buyer.prototype.getBuyAmount = function(resourceId) {
        return Buyer.getMetaBuyAmount(this.component.getMeta(), resourceId, this.component.getFactory());
    };

    /**
     * Get meta description data for buyer strategy
     * @param {Object} meta - Component metadata
     * @param {Object} factory - Factory instance
     * @param {Object} strategy - Strategy instance
     * @returns {Object} Description data object
     */
    Buyer.getMetaDescriptionData = function(meta, factory, strategy) {
        var strategyMeta = meta.strategy;
        var purchaseResources = [];
        var totalPrice = 0;
        var resourcesById = factory.getGame().getMeta().resourcesById || {};
        var maxAmount = 0;
        
        for (var resourceId in strategyMeta.purchaseResources) {
            var amount = Buyer.getMetaBuyAmount(meta, resourceId, factory);
            var price = Buyer.getMetaBuyPrice(meta, resourceId, factory);
            totalPrice += amount * price;
            
            var resourceName = resourcesById[resourceId] ? resourcesById[resourceId].name : resourceId;
            purchaseResources.push("<span class='" + resourceId + "'><b>" + amount + "</b> " + resourceName + "</span>");
            maxAmount = Math.max(maxAmount, amount);
        }
        
        // TODO: Calculate output amount when ResourceOutput is available
        var outputAmount = 1; // strategy.getMetaOutputAmount(meta, factory);
        var noOfOutputs = Math.ceil(maxAmount / strategyMeta.interval / outputAmount);
        
        return {
            interval: strategyMeta.interval,
            purchasePrice: totalPrice.toFixed(2),
            buyStr: purchaseResources.join(", "),
            noOfOutputs: noOfOutputs
        };
    };

    /**
     * Get description data for this buyer strategy
     * @returns {Object} Description data object
     */
    Buyer.prototype.getDescriptionData = function() {
        var data = Buyer.getMetaDescriptionData(this.component.getMeta(), this.component.getFactory(), this);
        
        // TODO: Update managers when they are available
        // this.producer.updateWithDescriptionData(data);
        // this.outResourcesManager.updateWithDescriptionData(data);
        
        return data;
    };

    /**
     * Clear all contents and reset state
     */
    Buyer.prototype.clearContents = function() {
        // TODO: Reset managers when they are available
        // this.outResourcesManager.reset();
        // this.producer.reset();
    };

    /**
     * Calculate output for a game tick
     * @param {Object} tickData - Tick data object
     */
    Buyer.prototype.calculateOutputTick = function(tickData) {
        // TODO: Calculate when managers are available
        // this.producer.calculate(tickData);
        // this.outResourcesManager.distribute();
    };

    /**
     * Calculate the total purchase price for all resources
     * @returns {number} Total purchase price
     */
    Buyer.prototype.calculatePurchasePrice = function() {
        var totalPrice = 0;
        
        for (var resourceId in this.meta.purchaseResources) {
            var amount = this.getBuyAmount(resourceId);
            var price = this.getBuyPrice(resourceId);
            totalPrice += amount * price;
        }
        
        return totalPrice;
    };

    /**
     * Check if the component can buy resources
     * @returns {boolean} True if buying is possible
     */
    Buyer.prototype.canBuy = function() {
        // TODO: Implement when ResourceOutput is available
        // for (var resourceId in this.meta.purchaseResources) {
        //     var currentAmount = this.outResourcesManager.getResource(resourceId);
        //     var buyAmount = this.getBuyAmount(resourceId);
        //     var maxAmount = this.outResourcesManager.getMax(resourceId);
        //     
        //     if (currentAmount + buyAmount > maxAmount) {
        //         return false;
        //     }
        // }
        
        return true;
    };

    /**
     * Prepare for a purchase (calculate costs)
     * @param {Object} tickData - Tick data object
     */
    Buyer.prototype.preparePurchase = function(tickData) {
        tickData.resourceCosts += this.calculatePurchasePrice();
    };

    /**
     * Finish a purchase (add resources)
     * @param {Object} tickData - Tick data object
     */
    Buyer.prototype.finishPurchase = function(tickData) {
        // TODO: Add resources when ResourceOutput is available
        // for (var resourceId in this.meta.purchaseResources) {
        //     var amount = this.getBuyAmount(resourceId);
        //     this.outResourcesManager.addResource(resourceId, amount);
        // }
    };

    /**
     * Get string representation of the buyer strategy
     * @returns {string} String representation
     */
    Buyer.prototype.toString = function() {
        var result = "";
        
        // TODO: Add manager strings when they are available
        // result += this.outResourcesManager.toString() + "<br />";
        // result += this.producer.toString() + "<br />";
        
        return result;
    };

    /**
     * Export buyer strategy data to writer
     * @param {Object} writer - BinaryArrayWriter instance
     */
    Buyer.prototype.exportToWriter = function(writer) {
        // TODO: Export managers when they are available
        // this.outResourcesManager.exportToWriter(writer);
        // this.producer.exportToWriter(writer);
        console.log("Buyer.exportToWriter - TODO: Implement manager export");
    };

    /**
     * Import buyer strategy data from reader
     * @param {Object} reader - BinaryArrayReader instance
     * @param {number} version - Save file version
     */
    Buyer.prototype.importFromReader = function(reader, version) {
        // TODO: Import managers when they are available
        // this.outResourcesManager.importFromReader(reader, version);
        // this.producer.importFromReader(reader, version);
        console.log("Buyer.importFromReader - TODO: Implement manager import");
    };

    return Buyer;
});
