
define("ui/AchievementsUi", [
         "text!template/achievements.html",
         "lib/handlebars"
], function(achievementsTemplate, Handlebars) {
    

    var AchievementsUi = function(gameUiEm, game) {
        this.gameUiEm = gameUiEm;
        this.game = game;
        this.manager = this.game.getAchievementsManager();
        this.container = null;
    };
    
    AchievementsUi.prototype.display = function(container) {
        this.container = container;
        
        this.container.on("click", ".backButton", () => {
            this.gameUiEm.invokeEvent(GameUiEvent.SHOW_FACTORY);
        });
        
        var achievements = this._buildAchievementsList();
        
         this.container.html(Handlebars.compile(achievementsTemplate)({ achievements: achievements }));
        
        this._setupEventListeners();
        
        if (this.game.getEventManager) {
            this.game.getEventManager().addListener("achievementsUi", GameEvent.ACHIEVEMENT_RECEIVED, () => {
                this.update();
            });
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
             if (this.manager && this.manager.isVisible(achievement.id)) {
                var achievementData = {
                    id: achievement.id,
                    name: achievement.name,
                    requirements: this.manager.getTesterDescriptionText(achievement.id),
                    bonus: this.manager.getBonusDescriptionText(achievement.id)
                };
                
                achievements.push(achievementData);
            }
        }
        
        return achievements;
    };
    
    /**
     * Update the achievements UI display
     */
    AchievementsUi.prototype.update = function() {
        var self = this;
        
        // Update achievement items
        this.container.find(".item").each((_, item) => {
            const $item = $(item); // cache the jQuery object
            const achievementId = $item.attr("data-id");

            if (this.manager.getAchievement(achievementId)) {
                $item.addClass("achieved");
            } else {
                $item.removeClass("achieved");
            }
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
