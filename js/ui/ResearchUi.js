/**
 * ResearchUi class - research and technology management interface
 * Extracted from original_app.js
 */
define("ui/ResearchUi", [
    // TODO: These dependencies will need to be implemented as we extract more modules
    // "text!template/research.html",
    // "game/action/BuyResearch"
], function() {
    
    /**
     * ResearchUi constructor
     * @param {Object} gameUiEm - Game UI event manager
     * @param {Object} game - Game instance
     */
    var ResearchUi = function(gameUiEm, game) {
        this.gameUiEm = gameUiEm;
        this.game = game;
        this.container = null;
    };
    
    /**
     * Display the research UI in the specified container
     * @param {Object} container - Container element
     */
    ResearchUi.prototype.display = function(container) {
        this.container = container;
        
        // TODO: Use Handlebars template when available
        // var researchManager = this.game.getResearchManager();
        // var totalMax = 0;
        // var totalHave = 0;
        
        // Calculate totals
        // for (var researchId in this.game.getMeta().research) {
        //     var researchMeta = this.game.getMeta().research[researchId];
        //     totalMax += researchMeta.max;
        //     totalHave += researchManager.getResearch(researchId);
        // }
        
        // Build research items array
        // var researchItems = [];
        // for (var i = 0; i < this.game.getMeta().research.length; i++) {
        //     var researchMeta = this.game.getMeta().research[i];
        //     if (researchManager.isVisible(researchMeta.id)) {
        //         var canBuy = !researchMeta.max || this.game.getResearchManager().getResearch(researchMeta.id) < researchMeta.max;
        //         researchItems.push({
        //             id: researchMeta.id,
        //             name: researchMeta.name,
        //             description: researchMeta.description,
        //             price: canBuy ? nf(researchManager.getPrice(researchMeta.id)) : null,
        //             priceResearchPoints: canBuy ? nf(researchManager.getPriceResearchPoints(researchMeta.id)) : null,
        //             max: researchMeta.max,
        //             showBoughtAndMax: researchMeta.max > 1,
        //             iconStyle: "background-position: -" + 26 * researchMeta.iconX + "px -" + 26 * researchMeta.iconY + "px"
        //         });
        //     }
        // }
        
        // TODO: Use template when available
        // this.container.html(Handlebars.compile(template)({ 
        //     research: researchItems, 
        //     max: totalMax, 
        //     have: totalHave 
        // }));
        
        // Setup event listeners
        this._setupEventListeners();
        
        // Initial update
        this.update();
    };
    
    
    
    /**
     * Setup event listeners for the research UI
     * @private
     */
    ResearchUi.prototype._setupEventListeners = function() {
        var self = this;
        
        // Back button
        this.container.find("#backToFactory").click(function() {
            self.gameUiEm.invokeEvent("SHOW_FACTORY");
        });
        
        // Research item buy buttons
        this.container.find(".buyButton").click(function() {
            // TODO: Implement BuyResearch action when available
            console.log("Research purchase clicked - BuyResearch action not yet implemented");
        });
        
        // Game tick updates
        if (this.game.getEventManager) {
            this.game.getEventManager().addListener("researchUi", "GAME_TICK", function() {
                self.update();
            });
        }
    };
    
    /**
     * Refresh the research UI view
     */
    ResearchUi.prototype.refreshView = function() {
        var container = this.container;
        this.destroy();
        this.display(container);
    };
    
    /**
     * Update the research UI display
     */
    ResearchUi.prototype.update = function() {
        var self = this;
        
        // Update research points display
        var researchPointsElement = this.container.find("#researchPoints");
        if (researchPointsElement.length > 0 && this.game.getResearchPoints) {
            researchPointsElement.html(this._formatNumber(this.game.getResearchPoints()));
        }
        
        // Update money display
        var moneyElement = this.container.find("#money");
        if (moneyElement.length > 0 && this.game.getMoney) {
            moneyElement.html(this._formatNumber(this.game.getMoney()));
        }
        
        // Update research progress
        var progressElement = this.container.find("#researchProgress");
        if (progressElement.length > 0) {
            // TODO: Get actual research progress when ResearchManager is available
            progressElement.html("0 of 0");
        }
        
        // Update research items
        this.container.find(".researchItem").each(function() {
            var researchId = $(this).attr("data-id");
            var boughtElement = $(this).find(".bought");
            var buyButton = $(this).find(".buyButton");
            
            // TODO: Update with actual research data when ResearchManager is available
            if (boughtElement.length > 0) {
                boughtElement.html("0"); // Placeholder
            }
            
            if (buyButton.length > 0) {
                // TODO: Check if research can be purchased
                buyButton.show();
                buyButton.removeClass("cantBuy");
            }
        });
    };
    
    /**
     * Format numbers for display (placeholder for nf function)
     * @param {number} num - Number to format
     * @returns {string} Formatted number string
     * @private
     */
    ResearchUi.prototype._formatNumber = function(num) {
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
     * Destroy the ResearchUi and clean up resources
     */
    ResearchUi.prototype.destroy = function() {
        // Remove event listeners
        if (this.game.getEventManager) {
            this.game.getEventManager().removeListenerForType("researchUi");
        }
        
        if (this.gameUiEm) {
            this.gameUiEm.removeListenerForType("researchUi");
        }
        
        // Clear container
        if (this.container) {
            this.container.html("");
            this.container = null;
        }
    };
    
    return ResearchUi;
});
