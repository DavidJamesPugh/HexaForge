/**
 * BuyFactoryAction - handles factory purchasing logic
 * Extracted from original_app.js
 */
define("game/action/BuyFactoryAction", [], function() {

    /**
     * BuyFactoryAction constructor
     * @param {Object} game - Game instance
     * @param {string} factoryId - ID of the factory to buy
     */
    var BuyFactoryAction = function(game, factoryId) {
        this.game = game;
        this.factoryMeta = this.game.getMeta().factoriesById[factoryId];
        this.factoryId = factoryId;
    };

    /**
     * Check if the player can afford to buy this factory
     * @returns {boolean} True if purchase is possible
     */
    BuyFactoryAction.prototype.canBuy = function() {
        return this.game.getMoney() >= this.factoryMeta.price;
    };

    /**
     * Execute the factory purchase
     */
    BuyFactoryAction.prototype.buy = function() {
        // Deduct money from player
        this.game.addMoney(-this.factoryMeta.price);

        // Get the factory instance and mark it as bought
        var factory = this.game.getFactory(this.factoryMeta.id);
        factory.reset();
        factory.setIsBought(true);

        console.log("Factory bought:", this.factoryMeta.name, "for $" + this.factoryMeta.price);
    };

    /**
     * Get the factory metadata
     * @returns {Object} Factory metadata
     */
    BuyFactoryAction.prototype.getFactoryMeta = function() {
        return this.factoryMeta;
    };

    return BuyFactoryAction;
});
