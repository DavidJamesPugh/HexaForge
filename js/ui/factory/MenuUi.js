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
        var html = '<div class="factoryMenu">';
        
        if (data.hasResearch) {
            html += '<button id="researchButton" class="menuButton">Research</button>';
        }
        
        if (data.hasUpgrades) {
            html += '<button id="upgradesButton" class="menuButton">Upgrades</button>';
        }
        
        if (data.hasAchievements) {
            html += '<button id="achievementsButton" class="menuButton">Achievements</button>';
        }
        
        if (data.hasStatistics) {
            html += '<button id="statisticsButton" class="menuButton">Statistics</button>';
        }
        
        html += '<button id="mainGameButton" class="menuButton">Main Game</button>';
        html += '<button id="factoriesButton" class="menuButton">Factories</button>';
        html += '<button id="helpButton" class="menuButton">Help</button>';
        html += '<button id="extraButton" class="menuButton">Purchases</button>';
        html += '<button id="settingsButton" class="menuButton">Settings</button>';
        html += '<button id="timeTravelButton" class="menuButton">Time Travel</button>';
        
        if (data.isMission) {
            html += '<button id="missionsButton" class="menuButton">Missions</button>';
        }
        
        html += '</div>';
        return html;
    };
    
    MenuUi.prototype._setupEventListeners = function() {
        var self = this;
        
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
            self.gameUiEm.invokeEvent(GameUiEvent.SHOW_HELP);
        });
        
        this.container.find("#statisticsButton").click(function() {
            self.gameUiEm.invokeEvent(GameUiEvent.SHOW_STATISTICS);
        });
        
        this.container.find("#extraButton").click(function() {
            self.gameUiEm.invokeEvent(GameUiEvent.SHOW_PURCHASES);
        });
        
        this.container.find("#settingsButton").click(function() {
            self.gameUiEm.invokeEvent(GameUiEvent.SHOW_SETTINGS);
        });
        
        this.container.find("#timeTravelButton").click(function() {
            self.gameUiEm.invokeEvent(GameUiEvent.SHOW_TIME_TRAVEL);
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
