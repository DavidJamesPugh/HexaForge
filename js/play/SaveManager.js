/**
 * SaveManager - Handles game saves to both local storage and cloud (PlayFab)
 * Based on the original Factory Idle implementation
 */

define("play/SaveManager", ["../config/config", "./UrlHandler"], function(config, UrlHandler) {
    
    var SaveManager = function(api, userHash, localStorageKey) {
        this.api = api;
        this.localStorageKey = localStorageKey + "|" + userHash.getUserHash();
        this.cloudSaveName = "Main";
        this.cloudSaveIntervalMs = config.saveManager.cloudSaveIntervalMs;
        this.localSaveIntervalMs = config.saveManager.localSaveIntervalMs;
        this.cloudSaveInterval = null;
        this.localSaveInterval = null;
        
        var urlVars = UrlHandler.getUrlVars();
        this.useCloud = urlVars.cloud !== "0" && urlVars.cloud !== 0 && urlVars.cloud !== "false";
        
        if (!this.useCloud) {
            console.log("SaveManager: Cloud save disabled");
        }
    };
    
    SaveManager.prototype.getCloudSaveInterval = function() {
        return this.cloudSaveIntervalMs;
    };
    
    SaveManager.prototype.getLocalSaveInterval = function() {
        return this.localSaveIntervalMs;
    };
    
    SaveManager.prototype.setUpdateGameFromLoadedDataCallback = function(callback) {
        this.updateGameFromLoadedDataCallback = callback;
        return this;
    };
    
    SaveManager.prototype.setGetSaveDataCallback = function(callback) {
        this.saveDataCallback = callback;
        return this;
    };
    
    SaveManager.prototype.init = function(isDevMode, callback) {
        var self = this;
        var initCallback = function() {
            self._startInterval();
            console.log("SaveManager: Initialized");
            callback();
        };
        
        if (isDevMode) {
            this.saveAutoCloud(function() {});
            this.saveAutoLocal(function() {});
            initCallback();
        } else {
            this.loadAuto(function() {
                initCallback();
            });
        }
        
        return this;
    };
    
    SaveManager.prototype._startInterval = function() {
        this.cloudSaveInterval = setInterval(function() {
            this.saveAutoCloud(function() {
                //console.log("SaveManager: Auto saved to cloud");
            });
        }.bind(this), this.cloudSaveIntervalMs);
        
        this.localSaveInterval = setInterval(function() {
            this.saveAutoLocal(function() {
                //console.log("SaveManager: Auto saved to local");
            });
        }.bind(this), this.localSaveIntervalMs);
    };
    
    SaveManager.prototype.destroy = function() {
        if (this.cloudSaveInterval) {
            clearInterval(this.cloudSaveInterval);
        }
        if (this.localSaveInterval) {
            clearInterval(this.localSaveInterval);
        }
    };
    
    SaveManager.prototype.getSavesInfo = function(slotNames, callback) {
        this.api.getSavesInfo(slotNames, callback);
    };
    
    SaveManager.prototype.saveManual = function(slotName, callback) {
        this._saveCloud(slotName, callback);
    };
    
    SaveManager.prototype.saveAuto = function(callback) {
        this._saveLocal(this.cloudSaveName, function() {
            this._saveCloud(this.cloudSaveName, callback);
        }.bind(this));
    };
    
    SaveManager.prototype.saveAutoCloud = function(callback) {
        this._saveCloud(this.cloudSaveName, callback);
    };
    
    SaveManager.prototype.saveAutoLocal = function(callback) {
        this._saveLocal(this.cloudSaveName, callback);
    };
    
    SaveManager.prototype._saveCloud = function(slotName, callback) {
        if (this.useCloud) {
            this.api.save(slotName, this.saveDataCallback(), callback);
        } else {
            console.log("SaveManager: Cloud save skipped!");
            callback();
        }
    };
    
    SaveManager.prototype._saveLocal = function(slotName, callback) {
        window.localStorage[this.localStorageKey + "|" + slotName] = JSON.stringify(this.saveDataCallback());
        callback();
    };
    
    SaveManager.prototype.loadManual = function(slotName, callback) {
        this._loadCloud(slotName, function(saveData) {
            this.updateGameFromSaveData(saveData);
            this.saveAutoCloud(function() {});
            callback();
        }.bind(this));
    };
    
    SaveManager.prototype.loadAuto = function(callback) {
        console.log("SaveManager: loadAuto called - attempting to load save data");
        this._loadCloud(this.cloudSaveName, function(cloudData) {
            console.log("SaveManager: Cloud data loaded:", cloudData);
            this._loadLocal(this.cloudSaveName, function(localData) {
                console.log("SaveManager: Local data loaded:", localData);
                var preferredData = null;

                if (localData && cloudData) {
                    if (localData.meta.ver > cloudData.meta.ver) {
                        console.log("SaveManager: Preferred local save local ver:" + localData.meta.ver + " > cloud ver:" + cloudData.meta.ver);
                        preferredData = localData;
                    } else {
                        console.log("SaveManager: Preferred cloud save local ver:" + localData.meta.ver + " < cloud ver:" + cloudData.meta.ver);
                        preferredData = cloudData;
                    }
                } else if (localData) {
                    console.log("SaveManager: Using local data only");
                    preferredData = localData;
                } else if (cloudData) {
                    console.log("SaveManager: Using cloud data only");
                    preferredData = cloudData;
                } else {
                    console.log("SaveManager: No save data found");
                }

                if (preferredData) {
                    console.log("SaveManager: Loading preferred data:", preferredData);
                    this.updateGameFromSaveData(preferredData);
                } else {
                    console.log("SaveManager: No data to load");
                }
                callback();
            }.bind(this));
        }.bind(this));
    };
    
    SaveManager.prototype.updateGameFromSaveData = function(saveData) {
        if (this.updateGameFromLoadedDataCallback) {
            this.updateGameFromLoadedDataCallback(saveData);
        }
    };
    
    SaveManager.prototype._loadCloud = function(slotName, callback) {
        this.api.load(slotName, callback);
    };
    
    SaveManager.prototype._loadLocal = function(slotName, callback) {
        var data = null;
        try {
            data = JSON.parse(window.localStorage[this.localStorageKey + "|" + slotName]);
        } catch (e) {
            // Ignore parse errors
        }
        callback(data);
    };
    
    return SaveManager;
});
