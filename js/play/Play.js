/**
 * Play controller module - manages the main game state and lifecycle
 * Extracted from original_app.js
 */
define("play/Play", [
    "config/config",
    "config/Meta",
    "game/Game",
    "play/SaveManager",
    "play/UserHash",
    "play/api/ApiFactory",
    "game/Component"
    // Note: These dependencies will need to be implemented as we extract more modules
    // "play/PurchasesManager",
    // "play/UrlHandler",
    // "play/ConfirmedTimestamp",
    // "game/action/IncentivizedAdCompletedAction"
], function(config, meta, Game, SaveManager, UserHash, ApiFactory, Component) {
    
    /**
     * Main Play controller class
     * @constructor
     */
    var Play = function() {
        this.userHash = new UserHash(config.userHash.key);
        this.userHash.init(); // Initialize and load from localStorage
        this.api = null; 
        this.saveManager = null;
        this.purchasesManager = null;
        this.confirmedTimestamp = null;
        this.game = null;
        this.missions = {};
    };

    /**
     * Get the game meta configuration
     * @returns {Object} Meta configuration object
     */
    Play.prototype.getMeta = function() {
        return meta;
    };

    /**
     * Get the main game instance
     * @returns {Object} Game instance
     */
    Play.prototype.getGame = function() {
        return this.game;
    };

    /**
     * Get a specific mission by ID
     * @param {string} missionId - The mission identifier
     * @returns {Object} Mission instance
     */
    Play.prototype.getMission = function(missionId) {
        return this.missions[missionId];
    };

    /**
     * Get the save manager instance
     * @returns {Object} SaveManager instance
     */
    Play.prototype.getSaveManager = function() {
        return this.saveManager;
    };

    /**
     * Get the purchases manager instance
     * @returns {Object} PurchasesManager instance
     */
    Play.prototype.getPurchasesManager = function() {
        return this.purchasesManager;
    };

    /**
     * Get the API instance
     * @returns {Object} API instance
     */
    Play.prototype.getApi = function() {
        return this.api;
    };

    /**
     * Get the user hash
     * @returns {Object} UserHash instance
     */
    Play.prototype.getUserHash = function() {
        return this.userHash;
    };
    
    /**
     * Get the user hash string
     * @returns {string} User hash string
     */
    Play.prototype.getUserHashString = function() {
        return this.userHash.getUserHash();
    };

    /**
     * Check if running in development mode
     * @returns {boolean} True if in development mode
     */
    Play.prototype.isDevMode = function() {
        // TODO: Implement proper site detection when UrlHandler is available
        // return "localhost" == UrlHandler.identifySite();
        
        // For now, check if we're running on localhost
        return window.location.hostname === 'localhost' || 
               window.location.hostname === '127.0.0.1';
    };

    /**
     * Initialize the Play controller
     * @param {boolean} isDevMode - Whether running in development mode
     * @param {Function} callback - Callback function when initialization is complete
     */
    Play.prototype.init = function(isDevMode, callback) {
        console.log("Play.init called - implementing step by step");
        
        // TODO: This is a simplified implementation while we extract other modules
        // The full implementation requires UserHash, ApiFactory, Game, etc.
        
        var placeholderTimestamp = { timestamp: Date.now() };

        this.game = new Game(meta.main, placeholderTimestamp);
        this.game.init();
        
        // Initialize API and SaveManager
        try {
            console.log("Initializing PlayFab API...");
            var apiFactory = new ApiFactory(config, this.userHash);
            this.api = apiFactory.createApi();
            
            // Initialize the API first
            this.api.init(function() {
                console.log("PlayFab API initialized successfully");
                
                // Create and initialize SaveManager with real API
                this.saveManager = this._createSaveManager();
                this.saveManager.init(isDevMode, function() {
                    console.log("SaveManager initialized successfully with PlayFab API");
                }.bind(this));
                
            }.bind(this));
            
        } catch (error) {
            console.error("Error initializing API/SaveManager:", error);
            // Create a mock SaveManager for now
            this.saveManager = {
                getSavesInfo: function(slotNames, callback) {
                    console.log("Mock getSavesInfo called with slots:", slotNames);
                    // Return mock save data for testing
                    var mockSaves = {};
                    slotNames.forEach(function(slotName) {
                        // Simulate some slots having saves
                        if (slotName === "slot1" || slotName === "slot2" || slotName === "slot3") {
                            mockSaves[slotName] = {
                                timestamp: Math.floor(Date.now() / 1000) - (slotName === "slot1" ? 3600 : slotName === "slot2" ? 7200 : 10800), // 1-3 hours ago
                                ver: Math.floor(Math.random() * 10000) + 1000 // Random tick count
                            };
                        }
                    });
                    callback(mockSaves);
                },
                saveManual: function(slotName, callback) {
                    console.log("Mock save to slot:", slotName);
                    // Simulate save delay
                    setTimeout(function() {
                        console.log("Mock save completed for slot:", slotName);
                        callback();
                    }, 500);
                },
                loadManual: function(slotName, callback) {
                    console.log("Mock load from slot:", slotName);
                    // Simulate load delay
                    setTimeout(function() {
                        console.log("Mock load completed for slot:", slotName);
                        callback();
                    }, 500);
                },
                updateGameFromSaveData: function(saveData) {
                    console.log("Mock updateGameFromSaveData called with:", saveData);
                    // This would normally update the game state from save data
                },
                getCloudSaveInterval: function() {
                    return 900000; // 15 minutes in milliseconds
                },
                getLocalSaveInterval: function() {
                    return 5000; // 5 seconds in milliseconds
                }
            };
            console.log("Mock SaveManager created:", this.saveManager);
        }
        
        // Wait for initialization to complete
        var self = this;
        var checkInit = function() {
            if (self.saveManager) {
                console.log("Play.init completed with Game instance and SaveManager");
                if (callback) {
                    callback();
                }
            } else {
                setTimeout(checkInit, 100);
            }
        };
        setTimeout(checkInit, 100);
        
        /* Original implementation requires these modules to be extracted first:
        
        this.userHash = new UserHash(config.userHash.key);
        this.userHash.init();
        this.api = ApiFactory(UrlHandler.identifySite(), this.userHash.getUserHash());
        
        this.api.init(function() {
            this.api.getEventManager().addListener("Play", ApiEvent.INCENTIVIZED_AD_COMPLETED, function() {
                new IncentivizedAdCompletedAction(this.getGame()).complete();
            }.bind(this));
            
            this.confirmedTimestamp = new ConfirmedTimestamp(this.api.getTimestamp.bind(this.api));
            this.confirmedTimestamp.init(function() {
                this.game = new Game(meta.main, this.confirmedTimestamp);
                this.missions = {};
                
                for (var missionId in meta.missions) {
                    this.missions[missionId] = new Game(meta.missions[missionId]);
                }
                
                this.saveManager = this._createSaveManager();
                this.saveManager.init(isDevMode, function() {
                    this.purchasesManager = new PurchasesManager(this);
                    this.purchasesManager.init(function() {
                        this.game.init();
                        console.log("Play", "Initialized");
                        callback();
                    }.bind(this));
                }.bind(this));
            }.bind(this));
        }.bind(this));
        */
    };

    /**
     * Create the save manager instance
     * @returns {Object} SaveManager instance
     * @private
     */
    Play.prototype._createSaveManager = function() {
        // Create API instance if not already created
        if (!this.api) {
            var apiFactory = new ApiFactory(config, this.userHash);
            this.api = apiFactory.createApi();
        }
        
        return new SaveManager(this.api, this.userHash, "HexaForgeSave")
            .setGetSaveDataCallback(function() {
                // Create proper save data
                var saveData = {
                    meta: {
                        ver: this.game ? this.game.getTicker().getNoOfTicks() : 0,
                        timestamp: Math.round(Date.now() / 1000),
                        date: this._dateToStr(new Date(), true)
                    },
                    data: this._createBinarySaveData()
                };
                //console.log("Created save data:", saveData);
                return saveData;
            }.bind(this))
            .setUpdateGameFromLoadedDataCallback(function(saveData) {
                console.log("Play", "Game loaded from save:", saveData);
                
                if (saveData && saveData.data) {
                    try {
                        // Use the proper binary import method like the original app
                        if (this.game && this.game.importFromReader) {
                            // TODO: Implement BinaryArrayReader when available
                            // var reader = new BinaryArrayReader(Base64ArrayBuffer.decode(saveData.data));
                            // this.importFromReader(reader);
                            // this.game.getTicker().addOfflineGains();
                            
                            // For now, fall back to JSON import
                            var decodedData = JSON.parse(atob(saveData.data));
                            console.log("Decoded save data:", decodedData);
                            
                            // Use the new Game.importFromJson method
                            if (this.game.importFromJson) {
                                this.game.importFromJson(decodedData);
                            } else {
                                this._importGameFromSaveData(decodedData);
                            }
                            
                            // Add offline gains like the original app
                            if (this.game.getTicker && this.game.getTicker().addOfflineGains) {
                                this.game.getTicker().addOfflineGains();
                            }
                        } else {
                            console.warn("Game importFromReader method not available");
                        }
                        
                    } catch (error) {
                        console.error("Error importing save data:", error);
                    }
                }
            }.bind(this));
    };
    
    /**
     * Create binary save data for the game
     * @returns {string} Base64 encoded save data
     * @private
     */
    Play.prototype._createBinarySaveData = function() {
        try {
            // Create comprehensive save data including factory component positions
            var gameData = {
                game: {
                    money: this.game ? this.game.getMoney() : 0,
                    researchPoints: this.game ? this.game.getResearchPoints() : 0,
                    tickCount: this.game ? this.game.getTicker().getNoOfTicks() : 0,
                    timestamp: Date.now()
                },
                factories: this._exportFactoriesData(),
                version: "1.0"
            };
            
           // console.log("Created comprehensive save data:", gameData);
            
            // Convert to base64 for storage
            return btoa(JSON.stringify(gameData));
        } catch (error) {
            console.error("Error creating save data:", error);
            return btoa(JSON.stringify({ error: "Failed to create save data" }));
        }
    };
    
    /**
     * Export factories data including component positions
     * @returns {Object} Factories data
     * @private
     */
    Play.prototype._exportFactoriesData = function() {
        if (!this.game) return {};

        var factoriesData = {};

        // Get all factories
        for (var factoryId in this.game.factories) {
            var factory = this.game.factories[factoryId];
            if (factory) {
                factoriesData[factoryId] = {
                    id: factoryId,
                    meta: factory.getMeta ? factory.getMeta().id : factoryId,
                    isPaused: factory.isPaused || false,
                    isBought: factory.isBought || false,
                    tiles: this._exportFactoryTiles(factory),
                    upgrades: this._safeExportToWriter(factory.getUpgradesManager),
                    areas: this._safeExportToWriter(factory.getAreasManager)
                };
            }
        }

        return factoriesData;
    };
    
    /**
     * Safely export data to writer, handling missing methods gracefully
     * @param {Object} manager - Manager object that might have exportToWriter
     * @returns {Object} Export data or empty object
     * @private
     */
    Play.prototype._safeExportToWriter = function(manager) {
        if (!manager) return {};
        if (typeof manager.exportToWriter === 'function') {
            try {
                return manager.exportToWriter();
            } catch (error) {
                console.warn("Error calling exportToWriter on manager:", error);
                return {};
            }
        }
        return {};
    };
    
    /**
     * Export factory tiles data including component positions
     * @param {Object} factory - Factory instance
     * @returns {Object} Tiles data
     * @private
     */
    Play.prototype._exportFactoryTiles = function(factory) {
        if (!factory || !factory.tiles) return {};

        var tilesData = {};

        // Export each tile with component information
        for (var i = 0; i < factory.tiles.length; i++) {
            var tile = factory.tiles[i];

            if (tile) {
                var component = tile.getComponent ? tile.getComponent() : null;

                if (component) {
                    var componentMeta = component.getMeta ? component.getMeta() : null;
                    var tileX = tile.getX ? tile.getX() : tile.x;
                    var tileY = tile.getY ? tile.getY() : tile.y;

                    // Check if this is the main component container (position matches)
                    var isMainContainer = tile.isMainComponentContainer ?
                        tile.isMainComponentContainer() :
                        (component.getX && component.getY &&
                         component.getX() == tileX &&
                         component.getY() == tileY);

                    if (isMainContainer) {
                        var tileKey = tile.getIdStr ? tile.getIdStr() : (tileX + ":" + tileY);
                        tilesData[tileKey] = {
                            x: tileX,
                            y: tileY,
                            componentId: componentMeta ? componentMeta.id : 'unknown',
                            componentType: componentMeta && componentMeta.strategy ? componentMeta.strategy.type : 'unknown',
                            inputOutput: this._safeExportToWriter(component.getInputOutputManager),
                            producer: this._safeExportToWriter(component.producer)
                        };
                    }
                }
            }
        }

        return tilesData;
    }
    
    /**
     * Import game state from save data
     * @param {Object} saveData - Decoded save data
     * @private
     */
    Play.prototype._importGameFromSaveData = function(saveData) {
        if (!saveData || !this.game) return;
        
        console.log("Importing game state from save data");
        
        // Import basic game state
        if (saveData.game) {
            if (saveData.game.money !== undefined) {
                this.game.setMoney(saveData.game.money);
            }
            if (saveData.game.researchPoints !== undefined) {
                this.game.setResearchPoints(saveData.game.researchPoints);
            }
        }
        
        // Import factories and component positions
        if (saveData.factories) {
            this._importFactoriesFromSaveData(saveData.factories);
        }
        
        console.log("Game state imported successfully");
    };
    
    /**
     * Import factories data including component positions
     * @param {Object} factoriesData - Factories data from save
     * @private
     */
    Play.prototype._importFactoriesFromSaveData = function(factoriesData) {
        if (!factoriesData || !this.game) return;
        
        console.log("Importing factories from save data:", factoriesData);
        
        // Import factory states and component positions
        for (var factoryId in factoriesData) {
            var factoryData = factoriesData[factoryId];
            console.log("Importing factory:", factoryId, factoryData);
            
            var factory = this.game.getFactory(factoryId);
            if (factory) {
                // Import factory state
                if (factoryData.isPaused !== undefined) {
                    factory.setPaused(factoryData.isPaused);
                }
                if (factoryData.isBought !== undefined) {
                    factory.setBought(factoryData.isBought);
                }
                
                // Import component positions
                if (factoryData.tiles) {
                    this._importFactoryTiles(factory, factoryData.tiles);
                }
            }
        }
        
        console.log("Factories imported successfully");
    };
    
    /**
     * Import factory tiles and component positions
     * @param {Object} factory - Factory instance
     * @param {Object} tilesData - Tiles data from save
     * @private
     */
    Play.prototype._importFactoryTiles = function(factory, tilesData) {
        if (!factory || !tilesData) return;
        
        for (var tileKey in tilesData) {
            var tileData = tilesData[tileKey];
            console.log("Importing tile:", tileKey, tileData);
            
            // Find the tile at the specified position
            var tile = factory.getTileAt(tileData.x, tileData.y);
            if (tile && tileData.componentId) {
                // Get component meta
                var componentMeta = this.game.getComponentMeta(tileData.componentId);
                if (componentMeta) {
                    // Create component using the Component class
                    if (typeof Component !== 'undefined') {
                        var component = new Component(factory, tileData.x, tileData.y, componentMeta);
                        tile.setComponent(component);
                        console.log("Placed component:", tileData.componentId, "at position:", tileData.x, tileData.y);
                    } else {
                        console.warn("Component class not available for:", tileData.componentId);
                    }
                } else {
                    console.warn("Component meta not found for:", tileData.componentId);
                }
            }
        }
    };
    
    /**
     * Helper method to format dates
     * @param {Date} date - Date to format
     * @param {boolean} utc - Whether to use UTC
     * @returns {string} Formatted date string
     * @private
     */
    Play.prototype._dateToStr = function(date, utc) {
        if (!date) return "";
        
        var year = utc ? date.getUTCFullYear() : date.getFullYear();
        var month = utc ? date.getUTCMonth() + 1 : date.getMonth() + 1;
        var day = utc ? date.getUTCDate() : date.getDate();
        var hours = utc ? date.getUTCHours() : date.getHours();
        var minutes = utc ? date.getUTCMinutes() : date.getMinutes();
        var seconds = utc ? date.getUTCSeconds() : date.getSeconds();
        
        month = (month < 10 ? "0" : "") + month;
        day = (day < 10 ? "0" : "") + day;
        hours = (hours < 10 ? "0" : "") + hours;
        minutes = (minutes < 10 ? "0" : "") + minutes;
        seconds = (seconds < 10 ? "0" : "") + seconds;
        
        return year + "." + month + "." + day + " " + hours + ":" + minutes + ":" + seconds;
    };

    /**
     * Destroy the Play controller and clean up resources
     */
    Play.prototype.destroy = function() {
        console.log("Play.destroy called");
        
        // TODO: Implement proper cleanup when all modules are available
        if (this.game) {
            this.game.destroy();
        }
        if (this.api) {
            this.api.destroy();
        }
        if (this.saveManager) {
            this.saveManager.destroy();
        }
        if (this.purchasesManager) {
            this.purchasesManager.destroy();
        }
        
        for (var missionId in this.missions) {
            if (this.missions[missionId] && this.missions[missionId].destroy) {
                this.missions[missionId].destroy();
            }
        }
    };

    /**
     * Export game data to a binary writer
     * @returns {Object} BinaryArrayWriter with game data
     */
    Play.prototype.exportToWriter = function() {
        // TODO: Implement when Game module is available
        if (this.game && this.game.exportToWriter) {
            return this.game.exportToWriter();
        }
        console.log("exportToWriter called - needs Game module");
        return null;
    };

    /**
     * Import game data from a binary reader
     * @param {Object} reader - BinaryArrayReader with game data
     */
    Play.prototype.importFromReader = function(reader) {
        if (this.game && this.game.importFromReader) {
            this.game.importFromReader(reader);
        } else {
            console.warn("Game importFromReader method not available");
        }
    };

    return Play;
});
