/**
 * PlayFabApi - Handles cloud saves using PlayFab service
 * Based on the original Factory Idle implementation
 */

define("play/api/PlayFabApi", [], function() {
    
    var PlayFabApi = function(customId) {
        // Set PlayFab title ID (you'll need to replace this with your actual title ID)
        if (typeof PlayFab !== 'undefined') {
            PlayFab.settings.titleId = "1BFF70"; // Replace with your title ID
        }
        this.customId = customId;
    };
    
    PlayFabApi.prototype._getMetaVarName = function(slotName) {
        return slotName + "-meta";
    };
    
    PlayFabApi.prototype.init = function(callback) {
        console.log("PlayFabApi: Init");
        this.login(callback);
        
        var self = this;
        // Re-login every 12 hours
        setInterval(function() {
            self.login();
        }, 43200000);
    };
    
    PlayFabApi.prototype.login = function(callback) {
        console.log("PlayFabApi: Login with customId:", this.customId);
        
        if (typeof PlayFab === 'undefined') {
            console.error("PlayFabApi: PlayFab SDK not loaded");
            callback();
            return;
        }
        
        console.log("PlayFabApi: PlayFab SDK found, titleId:", PlayFab.settings.titleId);
        
        var loginRequest = {
            CustomId: this.customId,
            CreateAccount: true
        };
        
        console.log("PlayFabApi: Sending login request:", loginRequest);
        
        PlayFab.ClientApi.LoginWithCustomID(loginRequest, function(result, error) {
            console.log("PlayFabApi: Login response:", result, error);
            if (result && result.code === 200) {
                console.log("PlayFabApi: Logged in successfully!");
                callback();
            } else {
                console.error("PlayFabApi: Login failed!", [result, error]);
                callback();
            }
        }.bind(this));
    };
    
    PlayFabApi.prototype.load = function(slotName, callback) {
        if (typeof PlayFab === 'undefined') {
            console.error("PlayFabApi: PlayFab SDK not loaded");
            callback(null);
            return;
        }
        
        var keys = [slotName, this._getMetaVarName(slotName)];
        var request = { Keys: keys };
        
        PlayFab.ClientApi.GetUserData(request, function(result, error) {
            console.log("PlayFabApi: Loaded!", [result, error]);
            
            if (result && result.code === 200 && result.data && result.data.Data) {
                var saveData = null;
                try {
                    var metaKey = this._getMetaVarName(slotName);
                    var dataKey = slotName;
                    
                    // Check if both meta and data exist
                    if (result.data.Data[metaKey] && result.data.Data[metaKey].Value && 
                        result.data.Data[dataKey] && result.data.Data[dataKey].Value) {
                        
                        saveData = {
                            meta: JSON.parse(result.data.Data[metaKey].Value),
                            data: result.data.Data[dataKey].Value
                        };
                    } else {
                        console.log("PlayFabApi: Save data incomplete for slot:", slotName);
                    }
                } catch (e) {
                    console.error("PlayFabApi: Failed to parse save data", e);
                }
                callback(saveData);
            } else {
                console.error("PlayFabApi: Load failed!", [result, error]);
                callback(null);
            }
        }.bind(this));
    };
    
    PlayFabApi.prototype.save = function(slotName, saveData, callback) {
        console.log("PlayFabApi: Save called for slot:", slotName);
        console.log("PlayFabApi: Save data:", saveData);
        
        if (typeof PlayFab === 'undefined') {
            console.error("PlayFabApi: PlayFab SDK not loaded");
            callback(false);
            return;
        }
        
        var request = { Data: {} };
        request.Data[slotName] = saveData.data;
        request.Data[this._getMetaVarName(slotName)] = JSON.stringify(saveData.meta);
        
        console.log("PlayFabApi: Sending save request:", request);
        
        PlayFab.ClientApi.UpdateUserData(request, function(result, error) {
            console.log("PlayFabApi: Save response:", result, error);
            if (result && result.code === 200) {
                console.log("PlayFabApi: Saved " + slotName + " successfully!");
                callback(true);
            } else {
                console.error("PlayFabApi: Save failed!", [result, error]);
                callback(false);
            }
        }.bind(this));
    };
    
    PlayFabApi.prototype.submitStatistic = function(statName, value, callback) {
        // Placeholder for statistics
        callback();
    };
    
    PlayFabApi.prototype.getSavesInfo = function(slotNames, callback) {
        if (typeof PlayFab === 'undefined') {
            console.error("PlayFabApi: PlayFab SDK not loaded");
            // Return empty slots for all requested slots
            var emptySaves = {};
            for (var i = 0; i < slotNames.length; i++) {
                emptySaves[slotNames[i]] = null;
            }
            callback(emptySaves);
            return;
        }

        var metaKeys = [];
        for (var i = 0; i < slotNames.length; i++) {
            metaKeys.push(this._getMetaVarName(slotNames[i]));
        }

        var request = { Keys: metaKeys };

        PlayFab.ClientApi.GetUserData(request, function(result, error) {
            if (result && result.code === 200) {
                var savesInfo = {};
                for (var i = 0; i < slotNames.length; i++) {
                    var slotName = slotNames[i];
                    var metaKey = this._getMetaVarName(slotName);

                    // Always include the slot in the result, even if null
                    savesInfo[slotName] = null;

                    try {
                        if (result.data.Data && result.data.Data[metaKey] && result.data.Data[metaKey].Value) {
                            savesInfo[slotName] = JSON.parse(result.data.Data[metaKey].Value);
                        }
                    } catch (e) {
                        console.error("PlayFabApi: Failed to parse save info for", slotName, e);
                    }
                }
                callback(savesInfo);
            } else {
                console.error("PlayFabApi: getSavesInfo failed!", [result, error]);
                // Return empty slots for all requested slots
                var emptySaves = {};
                for (var i = 0; i < slotNames.length; i++) {
                    emptySaves[slotNames[i]] = null;
                }
                callback(emptySaves);
            }
        }.bind(this));
    };
    
    return PlayFabApi;
});
