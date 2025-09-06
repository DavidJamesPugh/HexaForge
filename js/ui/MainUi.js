/**
 * MainUi module - handles the main user interface and navigation
 * Extracted from original_app.js
 */
define("ui/MainUi", [
    "config/Meta",
    "config/config",
    "config/event/GlobalUiEvent",
    "base/EventManager",
    "ui/GameUi",
    "ui/SettingsUi"
    // Note: These dependencies will need to be implemented as we extract more modules
    // "game/Game", 
    // "ui/MissionsUi",
    // "ui/RunningInBackgroundInfoUi",
    // "ui/helper/AlertUi",
    // "ui/GoogleAddsUi",
    // "ui/IntroUi"
], function(meta, config, GlobalUiEvent, EventManager, GameUi, SettingsUi) {
    
    /**
     * Main UI controller class
     * @param {Object} play - The Play controller instance  
     * @param {Object} imageMap - The ImageMap instance
     * @constructor
     */
    var MainUi = function(play, imageMap) {
        // Create event manager for global UI events
        this.globalUiEm = new EventManager(GlobalUiEvent, "MainUi");
        
        this.play = play;
        this.imageMap = imageMap;
        this.container = null;
        this.currentUi = null;
        this.runningInBackgroundInfoUi = null;
        this.focusInterval = null;
    };

    /**
     * Setup focus checker to detect when window gains/loses focus
     */
    MainUi.prototype.setupFocusChecker = function() {
        var hasFocus = document.hasFocus();
        this.focusInterval = setInterval(function() {
            var currentFocus = document.hasFocus();
            if (hasFocus !== currentFocus) {
                hasFocus = currentFocus;
                if (hasFocus) {
                    this.globalUiEm.invokeEvent(GlobalUiEvent.FOCUS);
                } else {
                    this.globalUiEm.invokeEvent(GlobalUiEvent.BLUR);
                }
            }
        }.bind(this), 200);
    };

    /**
     * Display the main UI in the specified container
     * @param {jQuery} container - The container element to display the UI in
     */
    MainUi.prototype.display = function(container) {
        console.log("MainUi.display called with container:", container);
        
        this.container = container;
        
        // TODO: Implement when RunningInBackgroundInfoUi is available
        // this.runningInBackgroundInfoUi = new RunningInBackgroundInfoUi(this.globalUiEm);
        // this.runningInBackgroundInfoUi.init();
        
        // TODO: Implement when game state is available
        // if (this.play.getGame().getTicker().getNoOfTicks() < 1000) {
        //     new IntroUi().display();
        // }
        
        this.setupFocusChecker();
        
        // TODO: Implement when premium check is available  
        // if (this.play.getGame().getIsPremium()) {
        //     console.log("MainUi", "Premium version, skipping loading ads");
        // } else {
        //     GoogleAdsUi();
        // }
        
        var self = this;
        
        // Setup global event listeners
        window.addEventListener("keypress", function(event) {
            self.globalUiEm.invokeEvent(GlobalUiEvent.KEY_PRESS, event);
        }, false);
        
        window.addEventListener("beforeunload", function(event) {
            // TODO: Implement when SaveManager is available
            // this.play.getSaveManager().saveAuto();
            console.log("Window unloading - would save game here");
        }.bind(this));
        
        // Setup UI navigation event listeners
        this.globalUiEm.addListener("MainUi", GlobalUiEvent.SHOW_MAIN_GAME, function() {
            this._showUi("mainGame");
        }.bind(this));
        
        this.globalUiEm.addListener("MainUi", GlobalUiEvent.SHOW_MISSIONS, function() {
            this._showUi("missions");
        }.bind(this));
        
        this.globalUiEm.addListener("MainUi", GlobalUiEvent.SHOW_MISSION, function(missionData) {
            this._showUi("mission", missionData);
        }.bind(this));
        
        // Settings UI is now handled by GameUi to avoid duplicate modals
        // this.globalUiEm.addListener("MainUi", GlobalUiEvent.SHOW_SETTINGS, function() {
        //     this._showSettings();
        // }.bind(this));
        
        // TODO: Implement when Game events are available
        // this.play.getGame().getEventManager().addListener("MainUi", GameEvent.GAME_TICK, function() {
        //     if (config.main.warnToStoreUserHashAfterTicks[this.play.getGame().getTicker().getNoOfTicks()]) {
        //         var alertId = "userHashTmpAlert" + Math.round(Math.random() * 10000000000);
        //         var alertMessage = 'You seem to be enjoying the game! Here is a good tip that maybe will save the day once!<br />Make a copy of your user hash. User hash is used to find your save game and purchases if you have any. <br />Your user hash: <br /><input type="text" readonly="readonly" id="' +
        //             alertId +
        //             '" name="' +
        //             alertId +
        //             '" value="' +
        //             this.play.getUserHash().toString() +
        //             '" style="border: 1px solid red; background:black; color:red; font-weight:bold; padding: 4px; margin: 3px; width:280px; font-size:0.9em; text-align:center;"/><br /> If you lose this, there is pretty much no way to restore your game. Play safe and keep a backup!<br />You can find your user hash also in the settings. <br /><br />Ignore this reminder if you already did and have fun!<br />';
        //         new AlertUi("SAVE USER HASH TO A SAFE PLACE!", alertMessage).display();
        //         $("#" + alertId).click(function() {
        //             $(this).get(0).setSelectionRange(0, $(this).val().length);
        //         });
        //     }
        // }.bind(this));
        
        // Show the main game UI by default
        this._showUi("mainGame");
    };

    /**
     * Show a specific UI component
     * @param {string} uiType - The type of UI to show ("mainGame", "missions", "mission")
     * @param {*} data - Optional data to pass to the UI component
     * @private
     */
    MainUi.prototype._showUi = function(uiType, data) {
        console.log("MainUi._showUi called:", uiType, data);
        
        this._destroyCurrentUi();
        
        if (uiType === "mainGame") {
            // Create and display the main game UI
            this.currentUi = new GameUi(this.globalUiEm, this.play.getGame(), this.play, this.imageMap);
            this.currentUi.display(this.container);
            
        } else if (uiType === "missions") {
            // TODO: Implement when MissionsUi is available
            // this.currentUi = new MissionsUi(this.globalUiEm, meta.missions);
            console.log("Would show missions UI");
            this._showPlaceholderUi("Missions");
            
        } else if (uiType === "mission") {
            // TODO: Implement when GameUi is available for mission mode
            // this.currentUi = new GameUi(this.globalUiEm, this.play.getMission(data), this.play, this.imageMap);
            console.log("Would show mission UI:", data);
            this._showPlaceholderUi("Mission: " + data);
        }
        
        // TODO: Remove this placeholder when actual UI components are implemented
        // if (this.currentUi) {
        //     this.currentUi.display(this.container);
        // }
    };

    /**
     * Show the settings UI
     * @private
     */
    MainUi.prototype._showSettings = function() {
        console.log("MainUi._showSettings called");
        
        // Create and display the settings UI
        if (this.play && this.play.getSaveManager) {
            var saveManager = this.play.getSaveManager();
            if (saveManager) {
                console.log("SaveManager found, creating SettingsUi");
                // Create SettingsUi instance
                var settingsUi = new SettingsUi(
                    this.globalUiEm, 
                    this.play, 
                    this.play.getGame(), 
                    this.play.getUserHash(), 
                    saveManager
                );
                settingsUi.init();
                settingsUi.display();
            } else {
                console.log("SaveManager not available");
                this._showPlaceholderUi("Settings (SaveManager not available)");
            }
        } else {
            console.log("Play or getSaveManager not available");
            this._showPlaceholderUi("Settings (Play not available)");
        }
    };

    /**
     * Show a placeholder UI while actual components are being implemented
     * @param {string} uiName - Name of the UI being shown
     * @private
     */
    MainUi.prototype._showPlaceholderUi = function(uiName) {
        if (this.container && this.container.length > 0) {
            this.container.html(
                '<div style="padding: 40px; text-align: center; font-family: Arial, sans-serif;">' +
                '<h1 style="color: #4CAF50;">🎉 ' + uiName + ' UI Loaded!</h1>' +
                '<div style="padding: 20px; border-radius: 8px; margin: 20px 0;">' +
                '<h3>Frontend Extraction Progress:</h3>' +
                '<div style="text-align: left; max-width: 400px; margin: 0 auto;">' +
                '<p>✅ DOM Error Fixes</p>' +
                '<p>✅ Play Class Extracted</p>' +
                '<p>✅ MainUi Class Extracted</p>' +
                '<p>✅ ImageMap Class (Completed)</p>' +
                '<p>✅ Factory Class (Completed)</p>' +
                '<p>✅ Component Class (Completed)</p>' +
                '<p>✅ Tile Class (Completed)</p>' +
                '<p>✅ InputOutputManager (Completed)</p>' +
                '<p>✅ Buyer Strategy (Completed)</p>' +
                '<p>✅ Seller Strategy (Completed)</p>' +
                '<p>✅ Converter Strategy (Completed)</p>' +
                '<p>✅ Transport Strategy (Completed)</p>' +
                '<p>✅ Garbage Strategy (Completed)</p>' +
                '<p>✅ Sorter Strategy (Completed)</p>' +
                '<p>✅ GameUi Class (Completed)</p>' +
                '<p>✅ FactoriesUi (Completed)</p>' +
                '<p>✅ FactoryUi (Completed)</p>' +
                '<p>✅ ResearchUi (Completed)</p>' +
                '<p>✅ UpgradesUi (Completed)</p>' +
                                   '<p>✅ AchievementsUi (Completed)</p>' +
                   '<p>✅ Factory Management Modules (Completed)</p>' +
                   '<p>✅ Remaining Strategy Classes (Completed)</p>' +
                                      '<p>✅ Helper Modules (Completed)</p>' +
                   '<p>⏳ Game Managers (Next Priority)</p>' +
                   '</div>' +
                   '</div>' +
                   '<p style="color: #666;">🎉 <strong>FACTORY MAP IS NOW READY!</strong> You can see the factory and place components!</p>' +
                   '<p style="color: #666;">All core modules are working. Check the browser console for detailed logs.</p>' +
                   '</div>'
            );
        }
    };

    /**
     * Destroy the current UI component
     * @private
     */
    MainUi.prototype._destroyCurrentUi = function() {
        if (this.currentUi) {
            if (this.currentUi.destroy) {
                this.currentUi.destroy();
            }
            this.currentUi = null;
        }
    };

    /**
     * Destroy the MainUi and clean up resources
     */
    MainUi.prototype.destroy = function() {
        console.log("MainUi.destroy called");
        
        // Cleanup background info UI
        if (this.runningInBackgroundInfoUi) {
            this.runningInBackgroundInfoUi.destroy();
        }
        
        // Cleanup current UI
        this._destroyCurrentUi();
        
        // Cleanup event listeners
        this.globalUiEm.removeListenerForType("MainUi");
        
        // TODO: Implement when Game events are available
        // this.play.getGame().getEventManager().removeListenerForType("MainUi");
        
        // Cleanup focus checker
        if (this.focusInterval) {
            clearInterval(this.focusInterval);
            this.focusInterval = null;
        }
        
        this.container = null;
    };

    return MainUi;
});
