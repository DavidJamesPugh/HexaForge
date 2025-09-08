/**
 * FactoriesUi class - factory list and selection interface
 * Extracted from original_app.js
 */
define("ui/FactoriesUi", [
    // TODO: These dependencies will need to be implemented as we extract more modules
    // "text!template/factories.html",
    // "ui/helper/AlertUi",
    "game/action/BuyFactoryAction"
], function(BuyFactoryAction) {
    
    // Number formatting from original app
    var names = {
        6: " million",
        9: " billion",
        12: " trillion",
        15: " quadrillion",
        18: " quintillion",
        21: " sextillion",
        24: " septillion",
        27: " octillion",
        30: " nonillion",
        33: " decillion",
        36: " undecillion",
        39: " duodecillion",
        42: " tredecillion",
        45: " quattuordecillion",
        48: " quindecillion",
        51: " sexdecillion",
        54: " septendecillion",
        57: " octodecillion",
        60: " novemdecillion",
        63: " vigintillion"
    };
    
    var numberFormat = {
        format: function(num) {
            if (num === undefined || num === null) return "?";
            if (Math.abs(num) < 10) return Math.round(100 * num) / 100;
            if (Math.abs(num) < 1e3) return Math.round(10 * num) / 10;
            if (Math.abs(num) < 1e6) {
                return Number(num)
                    .toFixed(0)
                    .replace(/\d(?=(\d{3})+$)/g, "$& ");
            }
            
            var parts = num.toString().split("e+", 2);
            var mantissa = parts[0];
            var decimalPlaces = mantissa < 0 ? 2 : 1;
            var power = 3 * Math.floor((Number(mantissa).toFixed(0).length - decimalPlaces) / 3);
            var totalPower = power + (parts[1] ? Number(parts[1]) : 0);
            var remainder = totalPower % 3;
            
            mantissa *= Math.pow(10, remainder - power);
            totalPower -= remainder;
            
            return Math.round(100 * mantissa) / 100 + (names[totalPower] ? names[totalPower] : "e" + totalPower);
        }
    };
    
    // Shortcut function like original app
    var nf = function(num) {
        return numberFormat.format(num);
    };
    
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
        
        // Setup event listeners
        console.log("Setting up event listeners for factories...");
        this._setupEventListeners();
        console.log("Event listeners set up. SELECT buttons found:", this.container.find(".selectButton").length);
        
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
     * Setup event listeners for factory interactions
     * @private
     */
    FactoriesUi.prototype._setupEventListeners = function() {
        var self = this;
        
        // Factory selection
        this.container.find(".selectButton").click(function(event) {
            var factoryId = $(event.target).attr("data-id");
            console.log("SELECT button clicked for factory:", factoryId);
            console.log("Invoking SHOW_FACTORY event with:", factoryId);
            self.gameUiEm.invokeEvent(GameUiEvent.SHOW_FACTORY, factoryId);
        });
        
        // Factory purchase
        this.container.find(".buyButton").click(function(event) {
            var factoryId = $(event.target).attr("data-id");

            // Use BuyFactoryAction for proper purchasing
            var buyAction = new BuyFactoryAction(self.game, factoryId);
            if (buyAction.canBuy()) {
                buyAction.buy();
                self.gameUiEm.invokeEvent(GameUiEvent.SHOW_FACTORY, factoryId);
            } else {
                // TODO: Use AlertUi when available
                // new AlertUi("", "You don't have enough money to buy this factory!").display();
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
        var avgResearchProduction = this.statistics ? this.statistics.getAvgResearchPointsProduction() : null;
        this.container.find("#researchIncome").html(avgResearchProduction ? this._formatNumber(avgResearchProduction) : "?");
        
        // Update factory buttons
        this.container.find(".factoryButton").each(function() {
            var factoryId = $(this).attr("data-id");
            
            // Update income display
            var factoryAvgProfit = self.statistics ? self.statistics.getAvgProfit() : null;
            $(this).find(".money[data-key='income']").html(factoryAvgProfit ? self._formatNumber(factoryAvgProfit) : "?");

            // Update research production display
            var factoryAvgResearchProduction = self.statistics ? self.statistics.getAvgResearchPointsProduction() : null;
            $(this).find(".research[data-key='researchProduction']").html(factoryAvgResearchProduction ? self._formatNumber(factoryAvgResearchProduction) : "?");
            
            // Update buy button state
            var buyAction = new BuyFactoryAction(self.game, factoryId);
            if (buyAction.canBuy()) {
                $(this).find(".buyButton").removeClass("cantBuy").html("BUY");
            } else {
                $(this).find(".buyButton").addClass("cantBuy").html("TOO EXPENSIVE");
            }
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
        return numberFormat.format(num);
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
