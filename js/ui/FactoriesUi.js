/**
 * FactoriesUi class - factory list and selection interface
 * Extracted from original_app.js
 */
define("ui/FactoriesUi", [
    // TODO: These dependencies will need to be implemented as we extract more modules
    // "text!template/factories.html",
    // "ui/helper/AlertUi",
    // "game/action/BuyFactoryAction"
], function() {
    
    /**
     * FactoriesUi constructor
     * @param {Object} globalUiEm - Global UI event manager
     * @param {Object} gameUiEm - Game UI event manager
     * @param {Object} game - Game instance
     */
    var FactoriesUi = function(globalUiEm, gameUiEm, game) {
        this.globalUiEm = globalUiEm;
        this.gameUiEm = gameUiEm;
        this.game = game;
        this.statistics = game.getStatistics();
        this.container = null;
    };
    
    /**
     * Display the factories UI in the specified container
     * @param {Object} container - Container element
     */
    FactoriesUi.prototype.display = function(container) {
        var self = this;
        this.container = container;
        
        // Build factories list
        var factories = [];
        var gameFactories = this.game.getMeta().factories;
        
        for (var factoryId in gameFactories) {
            var factoryMeta = gameFactories[factoryId];
            var factory = this.game.getFactory(factoryMeta.id);
            
            factories.push({
                id: factoryMeta.id,
                name: factoryMeta.name,
                price: this._formatNumber(factoryMeta.price),
                isBought: factory.getIsBought(),
                isPaused: this.game.getFactory(factoryMeta.id).getIsPaused()
            });
        }
        
        // TODO: Use Handlebars template when available
        // this.container.html(Handlebars.compile(template)({ 
        //     factories: factories, 
        //     researchBought: !!this.game.getResearchManager().getResearch("researchCenter") 
        // }));
        
        // Show placeholder UI for now
        this._showPlaceholderUi(factories);
        
        // Setup event listeners
        this._setupEventListeners();
        
        // Setup game tick listener for updates
        this.game.getEventManager().addListener("factoriesUi", GameEvent.GAME_TICK, function() {
            this.update();
        }.bind(this));
        
        this.update();
        
        // Setup missions button
        $("#missionsButton").click(function() {
            self.globalUiEm.invokeEvent(GlobalUiEvent.SHOW_MISSIONS);
        });
        
        // Hide missions button for now
        $("#missionsButton").hide();
    };
    
    /**
     * Show placeholder UI while template is being implemented
     * @param {Array} factories - Array of factory data
     * @private
     */
    FactoriesUi.prototype._showPlaceholderUi = function(factories) {
        if (this.container && this.container.length > 0) {
            var html = '<div style="padding: 20px; font-family: Arial, sans-serif;">';
            html += '<h2 style="color: #2196F3;">🏭 Factories List</h2>';
            html += '<div style="padding: 15px; border-radius: 5px; margin: 10px 0;">';
            html += '<h3>Game Statistics:</h3>';
            html += '<p><strong>Money:</strong> <span id="money">$0</span></p>';
            html += '<p><strong>Research Points:</strong> <span id="researchPoints">0</span></p>';
            html += '<p><strong>Income:</strong> <span id="income">$0</span></p>';
            html += '<p><strong>Research Income:</strong> <span id="researchIncome">0</span></p>';
            html += '<p><strong>Ticks:</strong> <span id="ticks">0</span></p>';
            html += '</div>';
            
            html += '<div style="margin: 20px 0;">';
            html += '<h3>Available Factories:</h3>';
            
            for (var i = 0; i < factories.length; i++) {
                var factory = factories[i];
                html += '<div class="factoryButton" data-id="' + factory.id + '" style="border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 5px;">';
                html += '<h4>' + factory.name + '</h4>';
                html += '<p><strong>Price:</strong> ' + factory.price + '</p>';
                html += '<p><strong>Status:</strong> ' + (factory.isBought ? 'Owned' : 'Available') + '</p>';
                if (factory.isBought) {
                    html += '<p><strong>Paused:</strong> ' + (factory.isPaused ? 'Yes' : 'No') + '</p>';
                    html += '<button class="selectButton" data-id="' + factory.id + '" style="background: #4CAF50; color: white; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer;">SELECT</button>';
                } else {
                    html += '<button class="buyButton" data-id="' + factory.id + '" style="background: #2196F3; color: white; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer;">BUY</button>';
                }
                html += '</div>';
            }
            
            html += '</div>';
            html += '</div>';
            
            this.container.html(html);
        }
    };
    
    /**
     * Setup event listeners for factory interactions
     * @private
     */
    FactoriesUi.prototype._setupEventListeners = function() {
        var self = this;
        
        // Factory selection
        this.container.find(".selectButton").click(function(event) {
            var factoryId = $(event.target).attr("data-id");
            self.gameUiEm.invokeEvent(GameUiEvent.SHOW_FACTORY, factoryId);
        });
        
        // Factory purchase
        this.container.find(".buyButton").click(function(event) {
            var factoryId = $(event.target).attr("data-id");
            
            // TODO: Use BuyFactoryAction when available
            // var buyAction = new BuyFactoryAction(self.game, factoryId);
            // if (buyAction.canBuy()) {
            //     buyAction.buy();
            //     self.gameUiEm.invokeEvent(GameUiEvent.SHOW_FACTORY, factoryId);
            // } else {
            //     new AlertUi("", "You don't have enough money to buy this factory!").display();
            // }
            
            // Placeholder implementation
            if (self.game.getMoney() >= 1000) { // Simple check for now
                console.log("Would buy factory:", factoryId);
                self.gameUiEm.invokeEvent(GameUiEvent.SHOW_FACTORY, factoryId);
            } else {
                alert("You don't have enough money to buy this factory!");
            }
        });
    };
    
    /**
     * Update the UI with current game state
     */
    FactoriesUi.prototype.update = function() {
        var self = this;
        
        // Update money and research points
        this.container.find("#money").html(this._formatNumber(this.game.getMoney()));
        this.container.find("#researchPoints").html(this._formatNumber(this.game.getResearchPoints()));
        
        // Update income statistics
        var avgProfit = this.statistics ? this.statistics.getAvgProfit() : null;
        this.container.find("#income").html(avgProfit ? this._formatNumber(avgProfit) : "?");
        
        // Update research income
        var avgResearchProduction = this.statistics ? this.statistics.getFactoryAvgResearchPointsProduction() : null;
        this.container.find("#researchIncome").html(avgResearchProduction ? this._formatNumber(avgResearchProduction) : "?");
        
        // Update factory buttons
        this.container.find(".factoryButton").each(function() {
            var factoryId = $(this).attr("data-id");
            
            // Update income display
            var factoryAvgProfit = self.statistics ? self.statistics.getFactoryAvgProfit(factoryId) : null;
            $(this).find(".money[data-key='income']").html(factoryAvgProfit ? self._formatNumber(factoryAvgProfit) : "?");
            
            // Update research production display
            var factoryAvgResearchProduction = self.statistics ? self.statistics.getFactoryAvgResearchPointsProduction(factoryId) : null;
            $(this).find(".research[data-key='researchProduction']").html(factoryAvgResearchProduction ? self._formatNumber(factoryAvgResearchProduction) : "?");
            
            // Update buy button state
            // TODO: Use BuyFactoryAction when available
            // var buyAction = new BuyFactoryAction(self.game, factoryId);
            // if (buyAction.canBuy()) {
            //     $(this).find(".buyButton").removeClass("cantBuy").html("BUY");
            // } else {
            //     $(this).find(".buyButton").addClass("cantBuy").html("TOO EXPENSIVE");
            // }
        });
        
        // Update ticks display
        var ticker = this.game.getTicker();
        if (ticker) {
            this.container.find("#ticks").html(this._formatNumber(ticker.getActualTicksPerSec()));
        }
    };
    
    /**
     * Format number for display
     * @param {number} num - Number to format
     * @returns {string} Formatted number string
     * @private
     */
    FactoriesUi.prototype._formatNumber = function(num) {
        // TODO: Use proper number formatting when available
        // return nf(num);
        return num ? num.toString() : "0";
    };
    
    /**
     * Destroy the FactoriesUi and clean up resources
     */
    FactoriesUi.prototype.destroy = function() {
        this.globalUiEm.removeListenerForType("factoriesUi");
        this.gameUiEm.removeListenerForType("factoriesUi");
        this.game.getEventManager().removeListenerForType("factoriesUi");
        
        if (this.container) {
            this.container.html("");
            this.container = null;
        }
    };
    
    return FactoriesUi;
});
