/**
 * Seller strategy class - handles resource selling logic for components
 * Extracted from original_app.js
 */
define("game/strategy/Seller", [
    // TODO: These dependencies will need to be implemented as we extract more modules
    // "game/strategy/helper/ResourceIntake",
    // "game/strategy/helper/DelayedAction"
], function() {
    
    /**
     * Seller strategy constructor
     * @param {Object} component - Component instance
     * @param {Object} meta - Strategy metadata
     */
    var Seller = function(component, meta) {
        this.component = component;
        this.meta = meta;
        this.game = this.component.getFactory().getGame();
        
        // TODO: Initialize managers when their modules are extracted
        // this.inResourcesManager = new ResourceIntake(component, meta.resources);
        // this.producer = new DelayedAction(this.meta.interval);
        
        // TODO: Set up producer callbacks when DelayedAction is available
        // this.producer.canStart = this.canStartSaleProcess.bind(this);
        // this.producer.start = this.startSale.bind(this);
        // this.producer.finished = this.finishSale.bind(this);
    };
    
    /**
     * Clear all contents and reset state
     */
    Seller.prototype.clearContents = function() {
        // TODO: Reset managers when they are available
        // this.inResourcesManager.reset();
        // this.producer.reset();
    };
    
    /**
     * Get meta sell amount for a resource
     * @param {Object} meta - Component metadata
     * @param {string} resourceId - Resource identifier
     * @param {Object} factory - Factory instance
     * @returns {number} Sell amount for the resource
     */
    Seller.getMetaSellAmount = function(meta, resourceId, factory) {
        var baseAmount = meta.strategy.resources[resourceId].amount;
        // TODO: Get from upgrades manager when available
        var sellAmountBonus = 1; // factory.getUpgradesManager().getComponentBonuses(meta.id).sellAmountBonus;
        return baseAmount * sellAmountBonus;
    };
    
    /**
     * Get sell amount for a specific resource
     * @param {string} resourceId - Resource identifier
     * @returns {number} Sell amount for the resource
     */
    Seller.prototype.getSellAmount = function(resourceId) {
        return Seller.getMetaSellAmount(this.component.getMeta(), resourceId, this.component.getFactory());
    };
    
    /**
     * Get meta sell price for a resource
     * @param {Object} meta - Component metadata
     * @param {string} resourceId - Resource identifier
     * @param {Object} factory - Factory instance
     * @returns {number} Sell price for the resource
     */
    Seller.getMetaSellPrice = function(meta, resourceId, factory) {
        var basePrice = meta.strategy.resources[resourceId].sellPrice;
        var sellMargin = meta.strategy.resources[resourceId].sellMargin || 0;
        // TODO: Get from upgrades manager when available
        var sellPriceBonus = 1; // factory.getUpgradesManager().getComponentBonuses(meta.id).sellPriceBonus;
        var profitMultiplier = factory.getGame().getProfitMultiplier();
        
        return basePrice * (1 + sellMargin) * sellPriceBonus * profitMultiplier;
    };
    
    /**
     * Get sell price for a specific resource
     * @param {string} resourceId - Resource identifier
     * @returns {number} Sell price for the resource
     */
    Seller.prototype.getSellPrice = function(resourceId) {
        return Seller.getMetaSellPrice(this.component.getMeta(), resourceId, this.component.getFactory());
    };
    
    /**
     * Get meta description data for seller strategy
     * @param {Object} meta - Component metadata
     * @param {Object} factory - Factory instance
     * @param {Object} strategy - Strategy instance
     * @returns {Object} Description data object
     */
    Seller.getMetaDescriptionData = function(meta, factory, strategy) {
        var strategyMeta = meta.strategy;
        var regularResources = [];
        var bonusResources = [];
        var totalPrice = 0;
        var resourcesById = factory.getGame().getMeta().resourcesById || {};
        
        for (var resourceId in strategyMeta.resources) {
            var sellAmount = Seller.getMetaSellAmount(meta, resourceId, factory);
            var sellPrice = Seller.getMetaSellPrice(meta, resourceId, factory);
            var totalValue = sellAmount * sellPrice;
            
            var resourceName = resourcesById[resourceId] ? resourcesById[resourceId].name : resourceId;
            var resourceSpan = "<span class='" + resourceId + "'><b>" + sellAmount + "</b> " + resourceName + "</span>";
            
            // Check if research is required
            var canSell = true;
            if (strategyMeta.resources[resourceId].requiresResearch) {
                // TODO: Check research when ResearchManager is available
                // canSell = factory.getGame().getResearchManager().getResearch(strategyMeta.resources[resourceId].requiresResearch) > 0;
            }
            
            if (strategyMeta.resources[resourceId].bonus) {
                if (canSell) {
                    bonusResources.push(resourceSpan + " adds <b class='money'>$" + totalValue.toFixed(2) + "</b>");
                }
            } else {
                if (canSell) {
                    totalPrice += totalValue;
                    regularResources.push(resourceSpan);
                }
            }
        }
        
        return {
            isSeller: true,
            interval: strategyMeta.interval,
            sellPrice: totalPrice.toFixed(2),
            sellStr: regularResources.join(", "),
            bonusStr: bonusResources.join(", ")
        };
    };
    
    /**
     * Get description data for this seller strategy
     * @returns {Object} Description data object
     */
    Seller.prototype.getDescriptionData = function() {
        var data = Seller.getMetaDescriptionData(this.component.getMeta(), this.component.getFactory(), this);
        
        // TODO: Update managers when they are available
        // this.producer.updateWithDescriptionData(data);
        // this.inResourcesManager.updateWithDescriptionData(data);
        
        return data;
    };
    
    /**
     * Calculate input for a game tick
     * @param {Object} tickData - Tick data object
     */
    Seller.prototype.calculateInputTick = function(tickData) {
        // TODO: Calculate when managers are available
        // this.inResourcesManager.takeIn();
        // this.producer.calculate(tickData);
    };
    
    /**
     * Check if the sale process can start
     * @returns {boolean} True if sale process can start
     */
    Seller.prototype.canStartSaleProcess = function() {
        // TODO: Implement when ResourceIntake is available
        // for (var resourceId in this.meta.resources) {
        //     if (!this.meta.resources[resourceId].bonus) {
        //         var currentAmount = this.inResourcesManager.getResource(resourceId);
        //         var sellAmount = this.getSellAmount(resourceId);
        //         
        //         if (currentAmount < sellAmount) {
        //             return false;
        //         }
        //     }
        // }
        
        return true;
    };
    
    /**
     * Start the sale process
     * @param {Object} tickData - Tick data object
     */
    Seller.prototype.startSale = function(tickData) {
        // TODO: Implement when needed
    };
    
    /**
     * Finish the sale process
     * @param {Object} tickData - Tick data object
     */
    Seller.prototype.finishSale = function(tickData) {
        // TODO: Implement when ResourceIntake is available
        // for (var resourceId in this.meta.resources) {
        //     var sellAmount = this.getSellAmount(resourceId);
        //     var currentAmount = this.inResourcesManager.getResource(resourceId);
        //     
        //     if (currentAmount >= sellAmount) {
        //         this.inResourcesManager.addResource(resourceId, -sellAmount);
        //         tickData.resourceSales += sellAmount * this.getSellPrice(resourceId);
        //     }
        // }
    };
    
    /**
     * Get string representation of the seller strategy
     * @returns {string} String representation
     */
    Seller.prototype.toString = function() {
        var result = "";
        
        // TODO: Add manager strings when they are available
        // result += this.inResourcesManager.toString() + "<br />";
        // result += this.producer.toString() + "<br />";
        
        return result;
    };
    
    /**
     * Export seller strategy data to writer
     * @param {Object} writer - BinaryArrayWriter instance
     */
    Seller.prototype.exportToWriter = function(writer) {
        // TODO: Export managers when they are available
        // this.inResourcesManager.exportToWriter(writer);
        // this.producer.exportToWriter(writer);
        console.log("Seller.exportToWriter - TODO: Implement manager export");
    };
    
    /**
     * Import seller strategy data from reader
     * @param {Object} reader - BinaryArrayReader instance
     * @param {number} version - Save file version
     */
    Seller.prototype.importFromReader = function(reader, version) {
        // TODO: Import managers when they are available
        // this.inResourcesManager.importFromReader(reader, version);
        // this.producer.importFromReader(reader, version);
        console.log("Seller.importFromReader - TODO: Implement manager import");
    };
    
    return Seller;
});
