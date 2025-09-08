/**
 * UpgradesUi class - factory upgrades and improvements interface
 * Extracted from original_app.js
 */
define("ui/UpgradesUi", [
    // TODO: These dependencies will need to be implemented as we extract more modules
    // "text!template/upgrades.html",
    // "../game/action/BuyUpgrade",
    // "game/action/SellUpgrade",
    // "ui/helper/TipUi"
], function() {
    
    /**
     * UpgradesUi constructor
     * @param {Object} gameUiEm - Game UI event manager
     * @param {Object} factory - Factory instance
     */
    var UpgradesUi = function(gameUiEm, factory) {
        this.gameUiEm = gameUiEm;
        this.factory = factory;
        this.game = factory.getGame();
        this.container = null;
    };
    
    /**
     * Display the upgrades UI in the specified container
     * @param {Object} container - Container element
     */
    UpgradesUi.prototype.display = function(container) {
        this.container = container;
        
        // TODO: Use Handlebars template when available
        // var upgradesManager = this.factory.getUpgradesManager();
        // var upgradeGroups = [];
        
        // Build upgrade groups from meta configuration
        var upgradeGroups = this._buildUpgradeGroups();
        
        // TODO: Use template when available
        // this.container.html(Handlebars.compile(template)({ groups: upgradeGroups }));
        
        
        // Setup event listeners
        this._setupEventListeners();
        
        // Setup game tick listener for updates
        if (this.game.getEventManager) {
            this.game.getEventManager().addListener("upgradeUi", "GAME_TICK", function() {
                this.update();
            }.bind(this));
        }
        
        this.update();
    };
    
    /**
     * Build upgrade groups from meta configuration
     * @returns {Array} Array of upgrade groups
     * @private
     */
    UpgradesUi.prototype._buildUpgradeGroups = function() {
        var upgradeGroups = [];
        var upgradesLayout = this.game.getMeta().upgradesLayout || [];
        
        for (var i = 0; i < upgradesLayout.length; i++) {
            var group = upgradesLayout[i];
            
            if (group.type === "break") {
                upgradeGroups.push({ isBreak: true });
            } else {
                var upgrades = [];
                
                for (var j = 0; j < group.items.length; j++) {
                    var itemId = group.items[j];
                    
                    if (itemId === "_") {
                        if (upgrades.length > 0) {
                            upgrades.push({ isSeparator: true });
                        }
                    } else {
                        // TODO: Get upgrade data when upgradesById is available
                        var upgradeData = {
                            id: itemId,
                            action: "buy",
                            isBuy: true,
                            isMaxed: false,
                            buyPrice: this._getUpgradePrice(itemId),
                            title: this._getUpgradeTitle(itemId),
                            description: this._getUpgradeDescription(itemId),
                            iconStyle: "background-position: -" + 26 * (group.iconX || 0) + "px -" + 26 * (group.iconY || 0) + "px"
                        };
                        
                        upgrades.push(upgradeData);
                    }
                }
                
                if (upgrades.length > 0) {
                    upgradeGroups.push({
                        name: group.name,
                        upgrades: upgrades,
                        iconStyle: "background-position: -" + 26 * (group.iconX || 0) + "px -" + 26 * (group.iconY || 0) + "px"
                    });
                }
            }
        }
        
        return upgradeGroups;
    };
    
    /**
     * Get upgrade price (placeholder)
     * @param {string} upgradeId - Upgrade identifier
     * @returns {string} Formatted price
     * @private
     */
    UpgradesUi.prototype._getUpgradePrice = function(upgradeId) {
        // TODO: Get actual upgrade price when upgradesById is available
        var prices = {
            efficiency: 100,
            speed: 200,
            quality: 300,
            profit: 500,
            discount: 150,
            investment: 1000
        };
        return "$" + (prices[upgradeId] || 100);
    };
    
    /**
     * Get upgrade title (placeholder)
     * @param {string} upgradeId - Upgrade identifier
     * @returns {string} Upgrade title
     * @private
     */
    UpgradesUi.prototype._getUpgradeTitle = function(upgradeId) {
        // TODO: Get actual upgrade title when upgradesById is available
        var titles = {
            efficiency: "Efficiency Boost",
            speed: "Production Speed",
            quality: "Quality Improvement",
            profit: "Profit Multiplier",
            discount: "Cost Reduction",
            investment: "Investment Return"
        };
        return titles[upgradeId] || "Upgrade";
    };
    
    /**
     * Get upgrade description (placeholder)
     * @param {string} upgradeId - Upgrade identifier
     * @returns {string} Upgrade description
     * @private
     */
    UpgradesUi.prototype._getUpgradeDescription = function(upgradeId) {
        // TODO: Get actual upgrade description when upgradesById is available
        var descriptions = {
            efficiency: "Improve factory efficiency by 25%",
            speed: "Increase production speed by 50%",
            quality: "Enhance product quality and value",
            profit: "Double your profit margins",
            discount: "Reduce component costs by 30%",
            investment: "Get better returns on investments"
        };
        return descriptions[upgradeId] || "Improve factory performance";
    };
    
    /**
     * Setup event listeners for the upgrades UI
     * @private
     */
    UpgradesUi.prototype._setupEventListeners = function() {
        var self = this;
        
        // Back button
        this.container.find("#backToFactory").click(function() {
            self.gameUiEm.invokeEvent("SHOW_FACTORY");
        });
        
        // Upgrade buttons
        this.container.find(".upgradeButton").click(function() {
            var upgradeId = $(this).closest(".upgradeItem").attr("data-id");
            var action = $(this).closest(".upgradeItem").attr("data-action");
            
            // TODO: Implement BuyUpgrade/SellUpgrade actions when available
            if (action === "buy") {
                console.log("Would buy upgrade:", upgradeId);
                // var buyAction = new BuyUpgrade(self.factory, upgradeId);
                // if (buyAction.canBuy()) {
                //     buyAction.buy();
                //     self.refreshView();
                // }
            } else if (action === "sell") {
                console.log("Would sell upgrade:", upgradeId);
                // var sellAction = new SellUpgrade(self.factory, upgradeId);
                // if (sellAction.canSell()) {
                //     sellAction.sell();
                //     self.refreshView();
                // }
            }
        });
    };
    
    /**
     * Refresh the upgrades UI view
     */
    UpgradesUi.prototype.refreshView = function() {
        var container = this.container;
        this.destroy();
        this.display(container);
    };
    
    /**
     * Update the upgrades UI display
     */
    UpgradesUi.prototype.update = function() {
        var self = this;
        
        // Update money display
        var moneyElement = this.container.find("#money");
        if (moneyElement.length > 0 && this.game.getMoney) {
            moneyElement.html("$" + this._formatNumber(this.game.getMoney()));
        }
        
        // Update upgrade items
        this.container.find(".upgradeItem").each(function() {
            var upgradeId = $(this).attr("data-id");
            var action = $(this).attr("data-action");
            
            // TODO: Update with actual upgrade data when UpgradesManager is available
            if (action === "buy") {
                // Check if upgrade can be purchased
                // var canPurchase = self.factory.getUpgradesManager().canPurchase(upgradeId);
                // var couldPurchase = self.factory.getUpgradesManager().couldPurchase(upgradeId);
                
                // if (!couldPurchase) {
                //     $(this).addClass("upgradeItemMaxed");
                // } else if (!canPurchase) {
                //     $(this).addClass("upgradeItemCantBuy");
                // } else {
                //     $(this).removeClass("upgradeItemMaxed upgradeItemCantBuy");
                // }
            } else if (action === "sell") {
                // Check if upgrade can be sold
                // var canSell = self.factory.getUpgradesManager().canSell(upgradeId);
                
                // if (canSell) {
                //     $(this).removeClass("upgradeItemCantSell");
                // } else {
                //     $(this).addClass("upgradeItemCantSell");
                // }
            }
        });
    };
    
    /**
     * Format numbers for display (placeholder for nf function)
     * @param {number} num - Number to format
     * @returns {string} Formatted number string
     * @private
     */
    UpgradesUi.prototype._formatNumber = function(num) {
        // TODO: Use actual nf function when available
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + "M";
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + "K";
        } else {
            return num.toString();
        }
    };
    
    /**
     * Destroy the UpgradesUi and clean up resources
     */
    UpgradesUi.prototype.destroy = function() {
        // Remove event listeners
        if (this.game.getEventManager) {
            this.game.getEventManager().removeListenerForType("upgradeUi");
        }
        
        if (this.gameUiEm) {
            this.gameUiEm.removeListenerForType("upgradeUi");
        }
        
        // Clear container
        if (this.container) {
            this.container.html("");
            this.container = null;
        }
    };
    
    return UpgradesUi;
});
