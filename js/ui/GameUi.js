/**
 * GameUi class - main game interface and UI management
 * Extracted from original_app.js
 */
define("ui/GameUi", [
    "base/EventManager",
    "config/event/GameEvent",
    "config/event/GlobalUiEvent",
    "ui/FactoriesUi",
    "ui/FactoryUi",
    "ui/ResearchUi",
    "ui/UpgradesUi",
    "ui/AchievementsUi",
    "ui/SettingsUi",
    "ui/TimeTravelUi"
    // TODO: These dependencies will need to be implemented as we extract more modules
    // "ui/AchievementPopupUi",
    // "ui/HelpUi",
    // "ui/StatisticsUi",
    // "ui/PurchasesUi"
], function(EventManager, GameEvent, GlobalUiEvent, FactoriesUi, FactoryUi, ResearchUi, UpgradesUi, AchievementsUi, SettingsUi, TimeTravelUi) {
    
    /**
     * GameUi constructor
     * @param {Object} globalUiEm - Global UI event manager
     * @param {Object} game - Game instance
     * @param {Object} play - Play controller instance
     * @param {Object} imageMap - ImageMap instance
     */
    var GameUi = function(globalUiEm, game, play, imageMap) {
        this.globalUiEm = globalUiEm;
        this.gameUiEm = new EventManager(GameUiEvent, "GameUi");
        this.play = play;
        this.game = game;
        this.imageMap = imageMap;
        this.focusInterval = null;
        
        // TODO: Initialize UI components when their modules are extracted
        // this.helpUi = null;
        // this.purchasesUi = null;
        this.settingsUi = null;
        this.timeTravelUi = null;
        
        this.currentUi = null;
        this.container = null;
    };
    
    /**
     * Display the game UI in the specified container
     * @param {Object} container - Container element
     */
    GameUi.prototype.display = function(container) {
        // Initialize mission if this is a mission game
        if (this.game.getMeta().isMission) {
            this.game.init();
        }
        
        this.container = container;
        this.setupEvents();
        
        // TODO: Initialize UI components when their modules are extracted
        // this.helpUi = new HelpUi(this.gameUiEm, this.game).init();
        // this.purchasesUi = new PurchasesUi(this.gameUiEm, this.play).init();
        this.settingsUi = new SettingsUi(this.gameUiEm, this.play, this.game, this.play.getUserHash(), this.play.getSaveManager()).init();
        this.timeTravelUi = new TimeTravelUi(this.gameUiEm, this.play).init();
        
        // Show factories UI by default
        this._showUi("factories");
        
        // Show factory for mission games
        if (this.game.getMeta().isMission) {
            this.gameUiEm.invokeEvent(GameUiEvent.SHOW_FACTORY, "mission");
        }
    };
    
    /**
     * Setup event listeners for UI navigation
     */
    GameUi.prototype.setupEvents = function() {
        var lastFactoryId = null;
        
        // Show factory UI
        this.gameUiEm.addListener("GameUi", GameUiEvent.SHOW_FACTORY, function(factoryId) {
            console.log("SHOW_FACTORY event received with factoryId:", factoryId);
            if (factoryId) {
                lastFactoryId = factoryId;
            } else {
                factoryId = lastFactoryId;
            }
            console.log("Calling _showUi with factory and factoryId:", factoryId);
            this._showUi("factory", factoryId);
        }.bind(this));
        
        // Show factories list UI
        this.gameUiEm.addListener("GameUi", GameUiEvent.SHOW_FACTORIES, function() {
            this._showUi("factories");
        }.bind(this));
        
        // Show research UI
        this.gameUiEm.addListener("GameUi", GameUiEvent.SHOW_RESEARCH, function() {
            this._showUi("research");
        }.bind(this));
        
        // Show upgrades UI
        this.gameUiEm.addListener("GameUi", GameUiEvent.SHOW_UPGRADES, function(factoryId) {
            if (factoryId) {
                lastFactoryId = factoryId;
            } else {
                factoryId = lastFactoryId;
            }
            this._showUi("upgrades", factoryId);
        }.bind(this));
        
        // Show achievements UI
        this.gameUiEm.addListener("GameUi", GameUiEvent.SHOW_ACHIEVEMENTS, function() {
            this._showUi("achievements");
        }.bind(this));
        
        // Show statistics UI
        this.gameUiEm.addListener("GameUi", GameUiEvent.SHOW_STATISTICS, function() {
            this._showUi("statistics", lastFactoryId);
        }.bind(this));
        
        // Handle achievement received events
        this.game.getEventManager().addListener("GameUi", GameEvent.ACHIEVEMENT_RECEIVED, function(achievement) {
            // TODO: Show achievement popup when AchievementPopupUi is available
            // new AchievementPopupUi(this.game, achievement).display();
            console.log("Achievement received:", achievement);
        }.bind(this));
        
        // Handle focus/blur events
        this.globalUiEm.addListener("GameUi", GlobalUiEvent.FOCUS, function() {
            this.game.getEventManager().invokeEvent(GameEvent.FOCUS);
        }.bind(this));
        
        this.globalUiEm.addListener("GameUi", GlobalUiEvent.BLUR, function() {
            this.game.getEventManager().invokeEvent(GameEvent.BLUR);
        }.bind(this));

        // Add global debugging function
        window.debugShowFactory = function(factoryId) {
            console.log("Manually triggering SHOW_FACTORY for:", factoryId);
            this.gameUiEm.invokeEvent(GameUiEvent.SHOW_FACTORY, factoryId || "level1");
        }.bind(this);

    };
    
    /**
     * Show a specific UI component
     * @param {string} uiType - Type of UI to show
     * @param {*} data - Optional data for the UI
     * @private
     */
    GameUi.prototype._showUi = function(uiType, data) {
        console.log("_showUi called with uiType:", uiType, "data:", data);
        this._destroyCurrentUi();

        if (uiType === "factory") {
            console.log("Creating FactoryUi for factory:", data);
            var factory = this.game.getFactory(data);
            console.log("Factory retrieved:", factory);
            console.log("Factory isBought:", factory ? factory.getIsBought() : "N/A");

            // Create and display the factory UI
            this.currentUi = new FactoryUi(this.globalUiEm, this.gameUiEm, factory, this.play, this.imageMap);
            console.log("FactoryUi created, calling display...");
            this.currentUi.display(this.container);
            console.log("FactoryUi.display completed");
            
        } else if (uiType === "factories") {
            // Create and display the factories list UI
            this.currentUi = new FactoriesUi(this.globalUiEm, this.gameUiEm, this.game);
            this.currentUi.display(this.container);
            
        } else if (uiType === "research") {
            // Create and display the research UI
            this.currentUi = new ResearchUi(this.gameUiEm, this.game);
            this.currentUi.display(this.container);
            
        } else if (uiType === "upgrades") {
            // Create and display the upgrades UI
            this.currentUi = new UpgradesUi(this.gameUiEm, this.game.getFactory(data));
            this.currentUi.display(this.container);
            
        } else if (uiType === "achievements") {
            // Create and display the achievements UI
            this.currentUi = new AchievementsUi(this.gameUiEm, this.game);
            this.currentUi.display(this.container);
            
        } else if (uiType === "statistics") {
            // TODO: Create StatisticsUi when available
            // this.currentUi = new StatisticsUi(this.gameUiEm, this.game.getFactory(data), this.imageMap);

        }
        
        // TODO: Display actual UI when components are available
        // if (this.currentUi) {
        //     this.currentUi.display(this.container);
        // }
    };
    
   
    /**
     * Destroy the current UI component
     * @private
     */
    GameUi.prototype._destroyCurrentUi = function() {
        if (this.currentUi) {
            if (this.currentUi.destroy) {
                this.currentUi.destroy();
            }
            this.currentUi = null;
        }
    };
    
    /**
     * Destroy the GameUi and clean up resources
     */
    GameUi.prototype.destroy = function() {
        this._destroyCurrentUi();
        
        // TODO: Destroy UI components when they are available
        // if (this.helpUi) this.helpUi.destroy();
        // if (this.purchasesUi) this.purchasesUi.destroy();
        if (this.settingsUi) this.settingsUi.destroy();
        if (this.timeTravelUi) this.timeTravelUi.destroy();
        
        // Destroy mission game if applicable
        if (this.game.getMeta().isMission) {
            this.game.destroy();
        }
        
        // Remove event listeners
        this.globalUiEm.removeListenerForType("GameUi");
        this.gameUiEm.removeListenerForType("GameUi");
        this.game.getEventManager().removeListenerForType("GameUi");
        
        this.container = null;
        
        if (this.focusInterval) {
            clearInterval(this.focusInterval);
        }
    };
    
    return GameUi;
});
