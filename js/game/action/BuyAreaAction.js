/**
 * BuyAreaAction - handles factory area purchasing logic
 * Extracted from original_app.js
 */
define("game/action/BuyAreaAction", [], function() {

    /**
     * BuyAreaAction constructor
     * @param {Object} factory - Factory instance
     * @param {string} areaId - ID of the area to buy
     */
    var BuyAreaAction = function(factory, areaId) {
        this.factory = factory;
        this.areaId = areaId;
        this.areaMeta = factory.getMeta().areasById[areaId];
    };

    /**
     * Check if the player can afford to buy this area
     * @returns {boolean} True if purchase is possible
     */
    BuyAreaAction.prototype.canBuy = function() {
        return !(this.areaMeta.price > this.factory.getGame().getMoney());
    };

    /**
     * Execute the area purchase
     */
    BuyAreaAction.prototype.buy = function() {
        // Deduct money from player
        this.factory.getGame().addMoney(-this.areaMeta.price);

        // Mark area as bought
        this.factory.getAreasManager().setAreaBought(this.areaId, true);

        console.log("Area bought:", this.areaMeta.name, "for $" + this.areaMeta.price);
    };

    return BuyAreaAction;
});
