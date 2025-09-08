/**
 * SettingsUi - Displays the settings modal with save/load functionality
 * Based on the original Factory Idle implementation
 */

define("ui/SettingsUi", [
    "ui/helper/LoadingUi", 
    "ui/helper/ConfirmUi",
    //"text!template/settings.html",
    "lib/handlebars",
    "config/event/GameUiEvent"
], function(LoadingUi, ConfirmUi, Handlebars, GameUiEvent) {
    
    var SettingsUi = function(gameUiEm, play, game, userHash, saveManager) {
        this.gameUiEm = gameUiEm;
        this.play = play;
        this.game = game;
        this.userHash = userHash;
        this.saveManager = saveManager;
        this.isVisible = false;
    };
    
    SettingsUi.prototype.init = function() {
        this.gameUiEm.addListener("settingsUi", GameUiEvent.SHOW_SETTINGS, function() {
            this.display();
        }.bind(this));
        
        return this;
    };
    
    SettingsUi.prototype.display = function() {
        if (!this.isVisible) {
            // Ensure any existing modals are removed first
            this.hide();
            
            var cancelled = false;
            var loading = new LoadingUi()
                .setClickCallback(function() {
                    cancelled = true;
                }.bind(this))
                .display();
            
            this.saveManager.getSavesInfo(["slot1", "slot2", "slot3"], function(savesInfo) {
                if (!cancelled) {
                    loading.hide();
                    this._display(savesInfo);
                }
            }.bind(this));
        }
    };
    
    SettingsUi.prototype._display = function(savesInfo) {

        // Check if saveManager has required methods
        if (!this.saveManager.getCloudSaveInterval || !this.saveManager.getLocalSaveInterval) {
            console.error("SaveManager missing required methods:", this.saveManager);
            return;
        }

        var saveSlots = [];
        for (var i = 1; i <= 3; i++) {
            var slotName = "slot" + i;
            var slot = savesInfo[slotName];
            saveSlots.push({
                id: slotName,
                name: "Slot " + i,
                hasSave: !!slot,
                lastSave: slot ? this._dateToStr(new Date(slot.timestamp * 1000), false) : "-",
                ticks: slot ? slot.ver : "-"
            });
        }
        
        var templateData = {
            userHash: this.userHash.getUserHash(),
            cloudSaveInterval: Math.ceil(this.saveManager.getCloudSaveInterval() / 60000) + " minutes",
            localSaveInterval: Math.ceil(this.saveManager.getLocalSaveInterval() / 1000) + " seconds",
            saveSlots: saveSlots,
            devMode: this.play.isDevMode()
        };

        // Use Handlebars to compile the template with data
        var html = Handlebars.compile(settingsTemplate)(templateData);
        $("body").append(html);
        
        this.isVisible = true;
        var self = this;
        var settingsElement = $("#settings");
        
        // Center the modal
        settingsElement.css("left", ($("html").width() - settingsElement.outerWidth()) / 2);
        
        // Close button
        settingsElement.find(".closeButton").click(function() {
            self.hide();
        });
        
        // User hash click to select
        settingsElement.find("#userHash").click(function() {
            $(this).get(0).setSelectionRange(0, $(this).val().length);
        });
        
        // Update user hash
        settingsElement.find("#updateUserHashButton").click(function() {
            var newHash = settingsElement.find("#updateUserHash").val();
            if (newHash) {
                self.userHash.updateUserHash(newHash);
                document.location = document.location;
            }
        });
        
        // Copy to clipboard
        settingsElement.find("#copyToClipboardButton").click(function() {
            $("#userHash").get(0).select();
            try {
                var successful = document.execCommand("copy");
                var msg = successful ? "successful" : "unsuccessful";
                console.log("Copying text command was " + msg);
            } catch (err) {
                console.log("Oops, unable to copy");
            }
        });
        
        // Save to slot
        settingsElement.find(".saveToSlot").click(function() {
            var slotId = $(this).attr("data-id");
            console.log("Save button clicked for slot:", slotId);
            console.log("SaveManager:", self.saveManager);
            
            self.saveManager.saveManual(slotId, function() {
                console.log("Save completed for slot:", slotId);
                self.hide();
            });
        });
        
        // Load from slot
        settingsElement.find(".loadSlot").click(function() {
            var slotId = $(this).attr("data-id");
            new ConfirmUi("Load game", "Are you sure you want to load game?")
                .setCancelTitle("Yes, load game")
                .setOkTitle("Nooooo!!!")
                .setCancelCallback(function() {
                    self.saveManager.loadManual(slotId, function() {
                        self.hide();
                        self.gameUiEm.invokeEvent(GameUiEvent.SHOW_FACTORIES);
                    });
                })
                .display();
        });
        
        // Load from data
        settingsElement.find("#loadDataButton").click(function() {
            var data = settingsElement.find("#loadData").val();
            self.saveManager.updateGameFromSaveData({ data: data });
            self.hide();
            self.gameUiEm.invokeEvent(GameUiEvent.SHOW_FACTORIES);
        });
        
        // Reset game
        settingsElement.find("#resetGame").click(function() {
            new ConfirmUi("Reset game", "Are you sure you want to reset the game?")
                .setCancelTitle("Yes, RESET GAME")
                .setOkTitle("Nooooo!!!")
                .setCancelCallback(function() {
                    // Reset the game by destroying and reinitializing MainInstance
                    if (typeof MainInstance !== 'undefined' && MainInstance) {
                        console.log("Resetting game...");
                        MainInstance.destroy();
                        MainInstance.init(true, function() {
                            console.log("Game reset completed");
                        });
                    } else {
                        console.log("MainInstance not available for reset");
                        // Fallback: reload the page
                        document.location = document.location;
                    }
                    self.hide();
                })
                .display();
        });
        
        // Background click to close
        $("#settingsBg").click(function() {
            self.hide();
        });
    };
    
    SettingsUi.prototype._dateToStr = function(date, utc) {
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
    
    SettingsUi.prototype.hide = function() {
        this.isVisible = false;
        // Remove only the specific settings modal elements
        $("#settings").remove();
        $("#settingsBg").remove();
        // Don't remove the settings button - it has a different ID
    };
    
    SettingsUi.prototype.destroy = function() {
        this.hide();
        this.game.getEventManager().removeListenerForType("settingsUi");
        this.gameUiEm.removeListenerForType("settingsUi");
    };
    
    return SettingsUi;
});
