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
            var html = '';
            
            // Header section - exactly like original app
            html += '<div class="headerXX">';
            html += '    You have <span class="money">$<b id="money"></b></span> to spend. Isn\'t that nice.';
            html += '    Average total income <span class="money">$<b id="income"></b></span>.<br />';
            html += '    <span class="research"><b id="researchPoints"></b></span> research points.';
            html += '    Avg production <span class="research"><b id="researchIncome"></b></span>';
            html += '</div>';
            
            // Help section - exactly like original app
            html += '<div class="helpXX">';
            html += '    <div style="float:right"><span id="ticks"></span> ticks/sec</div>';
            html += '    Buy more land to create even bigger empire. Go ahead, buy some!';
            html += '</div>';
            
            // Factory selection - exactly like original app
            html += '<div id="factorySelection" class="factories">';
            
            for (var i = 0; i < factories.length; i++) {
                var factory = factories[i];
                
                html += '<div class="factoryButton" data-id="' + factory.id + '">';
                html += '    <div class="name">';
                html += '        ' + factory.name;
                html += '    </div>';
                html += '    <span class="paused">';
                if (factory.isPaused) {
                    html += '&lt;&lt; Paused &gt;&gt;';
                } else {
                    html += '&nbsp;';
                }
                html += '</span>';
                
                if (factory.isBought) {
                    html += '';
                    html += '    <div class="productionTitle">Income</div>';
                    html += '    <div class="textLine money" data-id="' + factory.id + '" data-key="income">-</div>';
                    html += '    <div class="productionTitle">Research</div>';
                    html += '    <div class="textLine research" data-id="' + factory.id + '" data-key="researchProduction">-</div>';
                    html += '    <div class="button selectButton" data-id="' + factory.id + '">SELECT</div>';
                    html += '';
                } else {
                    html += '';
                    html += '    <div class="productionTitle price">Price</div>';
                    html += '    <div class="textLine money">$' + factory.price + '</div>';
                    html += '    <div class="button buyButton" data-id="' + factory.id + '">BUY</div>';
                    html += '';
                }
                
                html += '</div>';
            }
            
            // Missions button - exactly like original app
            html += '    <div class="missionsButton" id="missionsButton">';
            html += '        <div class="name">';
            html += '            Challenges';
            html += '        </div>';
            html += '        <div class="description">';
            html += '            Test your knowledge with these custom scenarios. May cause brain injury!';
            html += '        </div>';
            html += '        <div class="button">PLAY</div>';
            html += '    </div>';
            
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
