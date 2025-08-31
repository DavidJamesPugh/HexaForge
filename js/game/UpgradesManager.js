/**
 * UpgradesManager - Manages factory upgrades and bonuses
 * Extracted from original_app.js
 */
define("game/UpgradesManager", [
    "./upgrades/Factory"
], function(FactoryUpgrade) {
    
    var UpgradesManager = function(factory) {
        this.factory = factory;
        this.game = factory.getGame();
        this.upgrades = {};
        this.isChanged = true;
    };
    
    /**
     * Build the upgrades bonus map
     * @returns {Object} Bonuses map with global and component-specific bonuses
     */
    UpgradesManager.prototype.buildMap = function() {
        var bonuses = {
            packageSizeBonus: 0,
            byComponent: {}
        };
        
        // Initialize component bonuses
        var componentsById = this.factory.getGame().getMeta().componentsById;
        if (componentsById) {
            for (var componentId in componentsById) {
                bonuses.byComponent[componentId] = {
                    runningCostPerTickIncrease: 1,
                    runningCostPerTickBonus: 1,
                    buyAmountBonus: 1,
                    maxStorageBonus: 1,
                    packageSizeBonus: 0,
                    convertAmountBonus: 1,
                    convertProduceMoreBonus: 1,
                    removeAmountBonus: 1,
                    researchPaperBonus: 1,
                    sellAmountBonus: 1,
                    sellPriceBonus: 1
                };
            }
        }
        
        // Apply upgrade strategies
        var upgrades = this.game.getMeta().upgrades;
        if (upgrades) {
            for (var upgradeId in upgrades) {
                var strategy = this.getStrategy(upgradeId);
                if (strategy && strategy.updateMap) {
                    strategy.updateMap(bonuses);
                }
            }
        }
        
        return bonuses;
    };
    
    /**
     * Get all bonuses (builds map if changed)
     * @returns {Object} Bonuses map
     */
    UpgradesManager.prototype.getBonuses = function() {
        if (this.isChanged) {
            this.bonuses = this.buildMap();
            this.isChanged = false;
        }
        return this.bonuses;
    };
    
    /**
     * Get bonuses for a specific component
     * @param {string} componentId - Component identifier
     * @returns {Object} Component bonuses
     */
    UpgradesManager.prototype.getComponentBonuses = function(componentId) {
        return this.getBonuses().byComponent[componentId];
    };
    
    /**
     * Set upgrade level
     * @param {string} upgradeId - Upgrade identifier
     * @param {number} level - Upgrade level
     */
    UpgradesManager.prototype.setUpgrade = function(upgradeId, level) {
        this.upgrades[upgradeId] = level;
        this.isChanged = true;
    };
    
    /**
     * Add to upgrade level
     * @param {string} upgradeId - Upgrade identifier
     * @param {number} amount - Amount to add
     */
    UpgradesManager.prototype.addUpgrade = function(upgradeId, amount) {
        this.setUpgrade(upgradeId, this.getUpgrade(upgradeId) + amount);
    };
    
    /**
     * Get current upgrade level
     * @param {string} upgradeId - Upgrade identifier
     * @returns {number} Current upgrade level
     */
    UpgradesManager.prototype.getUpgrade = function(upgradeId) {
        return this.upgrades[upgradeId] ? this.upgrades[upgradeId] : 0;
    };
    
    /**
     * Get upgrade strategy
     * @param {string} upgradeId - Upgrade identifier
     * @returns {Object} Upgrade strategy instance
     */
    UpgradesManager.prototype.getStrategy = function(upgradeId) {
        var upgradeMeta = this.game.getMeta().upgradesById[upgradeId];
        if (upgradeMeta) {
            return FactoryUpgrade.getStrategy(upgradeMeta, this.getUpgrade(upgradeId), this.factory);
        }
        return null;
    };
    
    /**
     * Get upgrade price for a specific level
     * @param {string} upgradeId - Upgrade identifier
     * @param {number} level - Upgrade level (defaults to current)
     * @returns {number} Upgrade price
     */
    UpgradesManager.prototype.getPrice = function(upgradeId, level) {
        if (level === undefined) {
            level = this.getUpgrade(upgradeId);
        }
        
        var upgradeMeta = this.game.getMeta().upgradesById[upgradeId];
        if (upgradeMeta && upgradeMeta.levels && upgradeMeta.levels[level]) {
            return upgradeMeta.levels[level].price;
        }
        return 0;
    };
    
    /**
     * Get sell price for an upgrade
     * @param {string} upgradeId - Upgrade identifier
     * @returns {number} Sell price
     */
    UpgradesManager.prototype.getSellPrice = function(upgradeId) {
        var upgradeMeta = this.game.getMeta().upgradesById[upgradeId];
        if (this.getUpgrade(upgradeId) <= 0 || !upgradeMeta || !upgradeMeta.refund) {
            return 0;
        }
        return this.getPrice(upgradeId, this.getUpgrade(upgradeId) - 1) * upgradeMeta.refund;
    };
    
    /**
     * Check if upgrade can be purchased
     * @param {string} upgradeId - Upgrade identifier
     * @returns {boolean} True if can purchase
     */
    UpgradesManager.prototype.canPurchase = function(upgradeId) {
        return this.couldPurchase(upgradeId) && 
               this.game.getMoney() >= this.getPrice(upgradeId) && 
               this.isVisible(upgradeId);
    };
    
    /**
     * Check if upgrade could be purchased (ignoring money and visibility)
     * @param {string} upgradeId - Upgrade identifier
     * @returns {boolean} True if could purchase
     */
    UpgradesManager.prototype.couldPurchase = function(upgradeId) {
        var upgradeMeta = this.game.getMeta().upgradesById[upgradeId];
        if (!upgradeMeta || !upgradeMeta.levels) {
            return false;
        }
        return this.getUpgrade(upgradeId) < upgradeMeta.levels.length;
    };
    
    /**
     * Check if upgrade is visible
     * @param {string} upgradeId - Upgrade identifier
     * @returns {boolean} True if visible
     */
    UpgradesManager.prototype.isVisible = function(upgradeId) {
        var upgradeMeta = this.game.getMeta().upgradesById[upgradeId];
        if (!upgradeMeta || !upgradeMeta.requiresResearch) {
            return true;
        }
        
        var researchManager = this.game.getResearchManager();
        return researchManager && researchManager.getResearch(upgradeMeta.requiresResearch) > 0;
    };
    
    /**
     * Check if upgrade can be sold
     * @param {string} upgradeId - Upgrade identifier
     * @returns {boolean} True if can sell
     */
    UpgradesManager.prototype.canSell = function(upgradeId) {
        if (this.getUpgrade(upgradeId) <= 0) {
            return false;
        }
        
        var upgradeMeta = this.game.getMeta().upgradesById[upgradeId];
        return upgradeMeta && upgradeMeta.refund !== undefined && 
               upgradeMeta.refund !== null && this.isVisible(upgradeId);
    };
    
    /**
     * Export upgrades data to writer
     * @returns {Object} BinaryArrayWriter with upgrades data
     */
    UpgradesManager.prototype.exportToWriter = function() {
        // TODO: Implement when BinaryArrayWriter is available
        var count = 0;
        for (var upgradeId in this.upgrades) {
            if (this.upgrades[upgradeId]) count++;
        }
        
        console.log("UpgradesManager.exportToWriter - BinaryArrayWriter not yet extracted");
        console.log("Would export " + count + " upgrades");
        return null;
    };
    
    /**
     * Import upgrades data from reader
     * @param {Object} reader - BinaryArrayReader with upgrades data
     * @param {Object} factory - Factory instance
     */
    UpgradesManager.prototype.importFromReader = function(reader, factory) {
        // TODO: Implement when BinaryArrayReader is available
        if (reader.getLength() !== 0) {
            this.upgrades = {};
            console.log("UpgradesManager.importFromReader - BinaryArrayReader not yet extracted");
            this.isChanged = true;
        }
    };
    
    return UpgradesManager;
});
