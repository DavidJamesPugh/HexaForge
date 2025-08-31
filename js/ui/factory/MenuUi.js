/**
 * MenuUi - Factory navigation menu
 * Extracted from original_app.js
 */
define("ui/factory/MenuUi", [
    "base/EventManager",
    "config/event/GameEvent",
    "config/event/GameUiEvent",
    "config/event/GlobalUiEvent"
], function(EventManager, GameEvent, GameUiEvent, GlobalUiEvent) {
    
    var MenuUi = function(globalUiEm, gameUiEm, factory) {
        this.globalUiEm = globalUiEm;
        this.gameUiEm = gameUiEm;
        this.factory = factory;
        this.game = factory.getGame();
    };
    
    MenuUi.prototype.display = function(container) {
        var isMission = this.game.getMeta().isMission;
        this.container = container;
        
        // Create menu HTML with placeholder content
        var menuHtml = this._createMenuHtml({
            isMission: isMission,
            hasResearch: this.game.getMeta().research && this.game.getMeta().research.length > 0,
            hasUpgrades: this.game.getMeta().upgrades && this.game.getMeta().upgrades.length > 0,
            hasAchievements: this.game.getMeta().achievements && this.game.getMeta().achievements.length > 0,
            hasStatistics: !this.game.getMeta().isMission
        });
        
        this.container.html(menuHtml);
        
        // Set up event listeners
        this._setupEventListeners();
        
        // Add game tick listener for button updates
        this.game.getEventManager().addListener(
            "factoryMenuUi",
            GameEvent.GAME_TICK,
            function() {
                this.updateButtons();
            }.bind(this)
        );
        
        this.updateButtons();
    };
    
    MenuUi.prototype._createMenuHtml = function(data) {
        // Use exact same structure as original app's factory/menu.html
        var html = '<div class="menuBox">';
        
        if (data.isMission) {
            html += '<a href="javascript:void(0);" id="missionsButton">Challenges</a>';
            html += '<a href="javascript:void(0);" id="mainGameButton">Factories</a>';
        } else {
            html += '<a href="javascript:void(0);" id="factoriesButton">Factories</a>';
        }
        
        if (data.hasStatistics) {
            html += '<a href="javascript:void(0);" id="statisticsButton">Statistics</a>';
        }
        
        if (data.hasResearch) {
            html += '<a href="javascript:void(0);" id="researchButton">Research</a>';
        }
        
        if (data.hasUpgrades) {
            html += '<a href="javascript:void(0);" id="upgradesButton">Upgrades</a>';
        }
        
        if (data.hasAchievements) {
            html += '<a href="javascript:void(0);" id="achievementsButton">Achievements</a>';
        }
        
        html += '<a href="javascript:void(0);" id="extraButton">Extra</a>';
        html += '<a href="javascript:void(0);" id="timeTravelButton">Time travel</a>';
        html += '<a href="javascript:void(0);" id="settingsButton">Settings</a>';
        html += '<a href="javascript:void(0);" id="helpButton">Help</a>';
        
        html += '</div>';
        return html;
    };
    
    MenuUi.prototype._setupEventListeners = function() {
        var self = this;
        
        // All event listeners now work with <a> tags instead of buttons
        this.container.find("#missionsButton").click(function() {
            self.globalUiEm.invokeEvent(GlobalUiEvent.SHOW_MISSIONS);
        });
        
        this.container.find("#mainGameButton").click(function() {
            self.globalUiEm.invokeEvent(GlobalUiEvent.SHOW_MAIN_GAME);
        });
        
        this.container.find("#factoriesButton").click(function() {
            self.gameUiEm.invokeEvent(GameUiEvent.SHOW_FACTORIES);
        });
        
        this.container.find("#researchButton").click(function() {
            self.gameUiEm.invokeEvent(GameUiEvent.SHOW_RESEARCH, self.factory.getMeta().id);
        });
        
        this.container.find("#upgradesButton").click(function() {
            self.gameUiEm.invokeEvent(GameUiEvent.SHOW_UPGRADES, self.factory.getMeta().id);
        });
        
        this.container.find("#achievementsButton").click(function() {
            self.gameUiEm.invokeEvent(GameUiEvent.SHOW_ACHIEVEMENTS, self.factory.getMeta().id);
        });
        
        this.container.find("#helpButton").click(function() {
            self.globalUiEm.invokeEvent(GlobalUiEvent.SHOW_HELP);
        });
        
        this.container.find("#statisticsButton").click(function() {
            self.gameUiEm.invokeEvent(GameUiEvent.SHOW_STATISTICS);
        });
        
        this.container.find("#extraButton").click(function() {
            self.globalUiEm.invokeEvent(GlobalUiEvent.SHOW_PURCHASES);
        });
        
        this.container.find("#settingsButton").click(function() {
            self.globalUiEm.invokeEvent(GlobalUiEvent.SHOW_SETTINGS);
        });
        
        this.container.find("#timeTravelButton").click(function() {
            self.globalUiEm.invokeEvent(GlobalUiEvent.SHOW_TIME_TRAVEL);
        });
    };
    
    MenuUi.prototype.updateButtons = function() {
        // Check achievements to show/hide buttons
        var achievementsManager = this.factory.getGame().getAchievementsManager();
        
        if (achievementsManager && achievementsManager.getAchievement("makingProfit")) {
            this.container.find("#researchButton").show();
        } else {
            this.container.find("#researchButton").hide();
        }
        
        if (achievementsManager && achievementsManager.getAchievement("gettingSmarter")) {
            this.container.find("#upgradesButton").show();
        } else {
            this.container.find("#upgradesButton").hide();
        }
        
        if (achievementsManager && achievementsManager.getAchievement("collectingCash2")) {
            this.container.find("#statisticsButton").show();
        } else {
            this.container.find("#statisticsButton").hide();
        }
        
        if (achievementsManager && achievementsManager.getAchievement("collectingCash")) {
            this.container.find("#extraButton").show();
            this.container.find("#timeTravelButton").show();
        } else {
            this.container.find("#extraButton").hide();
            this.container.find("#timeTravelButton").hide();
        }
    };
    
    MenuUi.prototype.destroy = function() {
        this.game.getEventManager().removeListenerForType("factoryMenuUi");
        this.gameUiEm.removeListenerForType("factoryMenuUi");
        this.globalUiEm.removeListenerForType("factoryMenuUi");
        this.container.html("");
        this.container = null;
    };
    
    return MenuUi;
});
