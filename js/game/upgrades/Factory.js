/**
 * Factory Upgrade Strategy - Manages different upgrade types for components
 * Extracted from original_app.js
 */
define("game/upgrades/Factory", [
    "./strategy/BuyerUpgrade",
    "./strategy/ConverterUpgrade",
    "./strategy/ConverterProduceMoreUpgrade",
    "./strategy/GarbageUpgrade",
    "./strategy/PackageSize",
    "./strategy/ResearchCenterBonusUpgrade",
    "./strategy/ResearchCenterMaxStock",
    "./strategy/RunningCostUpgrade",
    "./strategy/SellerSellAmountUpgrade",
    "./strategy/SellerSellPriceUpgrade"
], function(BuyerUpgrade, ConverterUpgrade, ConverterProduceMoreUpgrade, GarbageUpgrade, PackageSize, ResearchCenterBonusUpgrade, ResearchCenterMaxStock, RunningCostUpgrade, SellerSellAmountUpgrade, SellerSellPriceUpgrade) {
    
    // Map of upgrade types to their strategy classes
    var upgradeStrategies = {
        buyer: BuyerUpgrade,
        converter: ConverterUpgrade,
        converterProduceMore: ConverterProduceMoreUpgrade,
        garbage: GarbageUpgrade,
        packageSize: PackageSize,
        researchCenterBonus: ResearchCenterBonusUpgrade,
        researchCenterMaxStock: ResearchCenterMaxStock,
        runningCost: RunningCostUpgrade,
        sellerSellAmount: SellerSellAmountUpgrade,
        sellerSellPrice: SellerSellPriceUpgrade
    };
    
    /**
     * Get strategy class for a specific upgrade type
     * @param {string} type - Upgrade type
     * @returns {Function} Strategy class constructor
     */
    function getStrategyClass(type) {
        var strategyClass = upgradeStrategies[type];
        if (!strategyClass) {
            throw new Error("Unknown component strategy " + type);
        }
        return strategyClass;
    }
    
    /**
     * Get strategy instance for an upgrade
     * @param {Object} upgradeMeta - Upgrade metadata
     * @param {number} level - Current upgrade level
     * @param {Object} factory - Factory instance
     * @returns {Object} Strategy instance
     */
    function getStrategy(upgradeMeta, level, factory) {
        var strategyClass = getStrategyClass(upgradeMeta.type);
        return new strategyClass(upgradeMeta, level, factory);
    }
    
    return {
        getStrategyClass: getStrategyClass,
        getStrategy: getStrategy
    };
});
