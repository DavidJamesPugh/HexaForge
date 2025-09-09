/**
 * AchievementsUi class - achievement and reward system interface
 * Extracted from original_app.js
 */
define("ui/AchievementsUi", [
    // TODO: These dependencies will need to be implemented as we extract more modules
         "text!template/achievements.html",
         "lib/handlebars"
], function(achievementsTemplate, Handlebars) {
    
    /**
     * AchievementsUi constructor
     * @param {Object} gameUiEm - Game UI event manager
     * @param {Object} game - Game instance
     */
    var AchievementsUi = function(gameUiEm, game) {
        this.gameUiEm = gameUiEm;
        this.game = game;
        this.manager = this.game.getAchievementsManager ? this.game.getAchievementsManager() : null;
        this.container = null;
    };
    
    /**
     * Display the achievements UI in the specified container
     * @param {Object} container - Container element
     */
    AchievementsUi.prototype.display = function(container) {
        this.container = container;
        var self = this;
        this.container.on("click", ".backButton", function () {
            self.gameUiEm.invokeEvent(GameUiEvent.SHOW_FACTORY);
        }.bind(this));
        // TODO: Use Handlebars template when available
        // var achievements = [];
        // var gameAchievements = this.game.getMeta().achievements || [];
        
        // Build achievements list
        var achievements = this._buildAchievementsList();
        
        // TODO: Use template when available
         this.container.html(Handlebars.compile(achievementsTemplate)({ achievements: achievements }));
        
        
        // Setup event listeners
        this._setupEventListeners();
        
        // Setup achievement received listener
        if (this.game.getEventManager) {
            this.game.getEventManager().addListener("achievementsUi", "ACHIEVEMENT_RECEIVED", function() {
                this.update();
            }.bind(this));
        }
        
        this.update();
    };
    
    /**
     * Build achievements list from game meta
     * @returns {Array} Array of achievement data
     * @private
     */
    AchievementsUi.prototype._buildAchievementsList = function() {
        var achievements = [];
        var gameAchievements = this.game.getMeta().achievements || [];
        
        for (var i = 0; i < gameAchievements.length; i++) {
            var achievement = gameAchievements[i];
            
            // TODO: Check if achievement is visible when manager is available
            // if (this.manager && this.manager.isVisible(achievement.id)) {
            var achievementData = {
                id: achievement.id,
                name: achievement.name,
                requirements: this._getRequirementsText(achievement.id),
                bonus: this._getBonusText(achievement.id),
                icon: this._getAchievementIcon(achievement.id)
            };
            
            achievements.push(achievementData);
            // }
        }
        
        return achievements;
    };
    
    /**
     * Get achievement requirements text (placeholder)
     * @param {string} achievementId - Achievement identifier
     * @returns {string} Requirements text
     * @private
     */
    AchievementsUi.prototype._getRequirementsText = function(achievementId) {
        // TODO: Get actual requirements when manager is available
        // return this.manager.getTesterDescriptionText(achievementId);
        
        var requirements = {
            firstFactory: "Build your first factory",
            ironMaster: "Produce 1000 iron",
            researchPioneer: "Research your first technology",
            upgradeEnthusiast: "Purchase 5 upgrades",
            efficiencyExpert: "Achieve 100% efficiency in any production line",
            wasteManager: "Handle waste production effectively",
            conveyorMaster: "Build a complex conveyor network",
            profitKing: "Earn $10,000 in a single factory"
        };
        
        return requirements[achievementId] || "Complete specific game objectives";
    };
    
    /**
     * Get achievement bonus text (placeholder)
     * @param {string} achievementId - Achievement identifier
     * @returns {string} Bonus text
     * @private
     */
    AchievementsUi.prototype._getBonusText = function(achievementId) {
        // TODO: Get actual bonus when manager is available
        // return this.manager.getBonusDescriptionText(achievementId);
        
        var bonuses = {
            firstFactory: "+10% production speed",
            ironMaster: "+25% iron production",
            researchPioneer: "+15% research points",
            upgradeEnthusiast: "+20% upgrade effectiveness",
            efficiencyExpert: "+30% overall efficiency",
            wasteManager: "+25% waste handling",
            conveyorMaster: "+20% conveyor speed",
            profitKing: "+50% profit multiplier"
        };
        
        return bonuses[achievementId] || "+10% bonus to related activities";
    };
    
    /**
     * Get achievement icon (placeholder)
     * @param {string} achievementId - Achievement identifier
     * @returns {string} Icon class name
     * @private
     */
    AchievementsUi.prototype._getAchievementIcon = function(achievementId) {
        var icons = {
            firstFactory: "🏭",
            ironMaster: "⚒️",
            researchPioneer: "🔬",
            upgradeEnthusiast: "⚡",
            efficiencyExpert: "📈",
            wasteManager: "♻️",
            conveyorMaster: "🔄",
            profitKing: "💰"
        };
        
        return icons[achievementId] || "🏆";
    };
    
    /**
     * Setup event listeners for the achievements UI
     * @private
     */
    AchievementsUi.prototype._setupEventListeners = function() {
        var self = this;
        
        // Back button
        this.container.find("#backToFactory").click(function() {
            self.gameUiEm.invokeEvent("SHOW_FACTORY");
        });
        
        // Achievement items (for future interaction)
        this.container.find(".achievementItem").click(function() {
            var achievementId = $(this).attr("data-id");
            console.log("Achievement clicked:", achievementId);
            
            // TODO: Show achievement details when available
            // self._showAchievementDetails(achievementId);
        });
    };
    
    /**
     * Update the achievements UI display
     */
    AchievementsUi.prototype.update = function() {
        var self = this;
        var completedCount = 0;
        
        // Update achievement items
        this.container.find(".achievementItem").each(function() {
            var achievementId = $(this).attr("data-id");
            var statusElement = $(this).find(".achievementStatus");
            
            // TODO: Check actual achievement status when manager is available
            // var isAchieved = self.manager && self.manager.getAchievement(achievementId);
            var isAchieved = false; // Placeholder for now
            
            if (isAchieved) {
                statusElement.html('<span class="status achieved" style="background: #4CAF50; color: white; padding: 4px 8px; border-radius: 3px; font-size: 12px;">ACHIEVED</span>');
                $(this).addClass("achieved");
                completedCount++;
            } else {
                statusElement.html('<span class="status waiting" style="background: #FFC107; color: white; padding: 4px 8px; border-radius: 3px; font-size: 12px;">WAITING</span>');
                $(this).removeClass("achieved");
            }
        });
        
        // Update completion statistics
        var totalAchievements = this.container.find(".achievementItem").length;
        var completionRate = totalAchievements > 0 ? Math.round((completedCount / totalAchievements) * 100) : 0;
        
        this.container.find("#completedCount").html(completedCount);
        this.container.find("#completionRate").html(completionRate + "%");
        
        // Add visual feedback for completed achievements
        this.container.find(".achievementItem.achieved").css({
            "border-color": "#4CAF50",
            "background-color": "#f0f8f0"
        });
    };
    
    /**
     * Destroy the AchievementsUi and clean up resources
     */
    AchievementsUi.prototype.destroy = function() {
        // Remove event listeners
        if (this.game.getEventManager) {
            this.game.getEventManager().removeListenerForType("achievementsUi");
        }
        
        if (this.gameUiEm) {
            this.gameUiEm.removeListenerForType("achievementsUi");
        }
        
        // Clear container
        if (this.container) {
            this.container.html("");
            this.container = null;
        }
    };
    
    return AchievementsUi;
});
