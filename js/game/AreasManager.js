/**
 * AreasManager - handles factory area purchasing and management
 * Extracted from original_app.js
 */
define("game/AreasManager", [], function() {

    /**
     * AreasManager constructor
     * @param {Object} factory - Factory instance
     */
    var AreasManager = function(factory) {
        this.factory = factory;
        this.game = factory.getGame();
        this.boughtAreas = {};
    };

    /**
     * Set whether an area is bought
     * @param {string} areaId - Area ID
     * @param {boolean} isBought - Whether the area is bought
     */
    AreasManager.prototype.setAreaBought = function(areaId, isBought) {
        this.boughtAreas[areaId] = isBought;
    };

    /**
     * Check if an area is bought
     * @param {string} areaId - Area ID
     * @returns {boolean} True if the area is bought
     */
    AreasManager.prototype.getIsAreaBought = function(areaId) {
        return !!this.boughtAreas[areaId];
    };

    /**
     * Get the price of an area
     * @param {string} areaId - Area ID
     * @returns {number} Area price
     */
    AreasManager.prototype.getPrice = function(areaId) {
        var areaMeta = this.factory.getMeta().areasById[areaId];
        return areaMeta ? areaMeta.price : 0;
    };

    /**
     * Check if an area can be purchased
     * @param {string} areaId - Area ID
     * @returns {boolean} True if the area can be purchased
     */
    AreasManager.prototype.canPurchase = function(areaId) {
        return !(this.game.getMoney() < this.getPrice(areaId));
    };

    return AreasManager;
});
