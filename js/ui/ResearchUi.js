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
        
        // Show placeholder UI for now
        this._showPlaceholderUi();
        
        // Setup event listeners
        this._setupEventListeners();
        
        // Initial update
        this.update();
    };
    
    /**
     * Show placeholder UI while actual components are being implemented
     * @private
     */
    ResearchUi.prototype._showPlaceholderUi = function() {
        if (this.container && this.container.length > 0) {
            var html = '<div style="padding: 20px; font-family: Arial, sans-serif;">';
            html += '<h2 style="color: #9C27B0;">🔬 Research & Technology</h2>';
            
            html += '<div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 10px 0;">';
            html += '<h3>Research Status:</h3>';
            html += '<p><strong>Research Points:</strong> <span id="researchPoints" class="research">' + (this.game.getResearchPoints ? this.game.getResearchPoints() : 0) + '</span></p>';
            html += '<p><strong>Money:</strong> <span class="money">$<span id="money">' + (this.game.getMoney ? this.game.getMoney() : 0) + '</span></span></p>';
            html += '<p><strong>Research Progress:</strong> <span id="researchProgress">0 of 0</span> technologies researched</p>';
            html += '</div>';
            
            html += '<div style="margin: 20px 0;">';
            html += '<h3>Research Technologies (Placeholder):</h3>';
            html += '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">';
            html += '<div style="border: 1px solid #ddd; padding: 15px; border-radius: 5px;">';
            html += '<h4>⚡ Efficiency Boost</h4>';
            html += '<p>Improve factory efficiency by 25%</p>';
            html += '<p><strong>Cost:</strong> 100 Research Points</p>';
            html += '<button class="buyButton" style="background: #4CAF50; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">BUY</button>';
            html += '</div>';
            html += '<div style="border: 1px solid #ddd; padding: 15px; border-radius: 5px;">';
            html += '<h4>🚀 Production Speed</h4>';
            html += '<p>Increase production speed by 50%</p>';
            html += '<p><strong>Cost:</strong> 200 Research Points</p>';
            html += '<button class="buyButton" style="background: #4CAF50; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">BUY</button>';
            html += '</div>';
            html += '<div style="border: 1px solid #ddd; padding: 15px; border-radius: 5px;">';
            html += '<h4>💰 Profit Multiplier</h4>';
            html += '<p>Double your profit margins</p>';
            html += '<p><strong>Cost:</strong> 500 Research Points</p>';
            html += '<button class="buyButton" style="background: #4CAF50; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">BUY</button>';
            html += '</div>';
            html += '</div>';
            html += '</div>';
            
            html += '<div style="background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 10px 0;">';
            html += '<h3>ResearchUi Module Status:</h3>';
            html += '<div style="text-align: left; max-width: 400px; margin: 0 auto;">';
            html += '<p>✅ ResearchUi Class Extracted</p>';
            html += '<p>⏳ ResearchManager (Next Priority)</p>';
            html += '<p>⏳ BuyResearch Action (Pending)</p>';
            html += '<p>⏳ Research Templates (Pending)</p>';
            html += '</div>';
            html += '</div>';
            
            html += '<div style="text-align: center; margin: 20px 0;">';
            html += '<button id="backToFactory" style="background: #2196F3; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 16px;">← Back to Factory</button>';
            html += '</div>';
            
            html += '<p style="color: #666;">The ResearchUi framework is ready! Ready to integrate research management and technology progression.</p>';
            html += '</div>';
            
            this.container.html(html);
        }
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
