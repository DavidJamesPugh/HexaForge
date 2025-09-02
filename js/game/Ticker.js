/**
 * Game ticker module - manages game timing and ticks
 * Extracted from original_app.js
 */
define("game/Ticker", ["../base/Benchmarker"], function(Benchmarker) {
    
    /**
     * Ticker class - manages game timing, ticks, and offline gains
     * @constructor
     * @param {Object} game - Game instance
     * @param {Object} confirmedTimestamp - Confirmed timestamp instance
     */
    var Ticker = function(game, confirmedTimestamp) {
        this.game = game;
        this.confirmedTimestamp = confirmedTimestamp;
        this.ticks = 0;
        this.bonusTicks = 0;
        this.timeTravelTickets = 1;
        this.focused = true;
        this.isPlaying = false;
        this.isFastActive = false;
        this.interval = null;
        this.noOfTicks = 0;
        this.purchaseBonusTicks = 0;
        this.lastSaveTimestamp = null;
        this.benchmarker = new Benchmarker(this.game.getMeta().id);
        this.backgroundModeTimeout = null;
        this.actualTicksPerSec = { ticks: 0, second: 0, actual: 0 };
    };
    
    /**
     * Initialize the ticker
     * @returns {Ticker} This ticker instance
     */
    Ticker.prototype.init = function() {
        this.start();
        
        // Add event listeners for focus/blur
        if (this.game.getEventManager) {
            this.game.getEventManager().addListener("Ticker", "FOCUS", function() {
                this.disableBackgroundMode();
            }.bind(this));
            
            this.game.getEventManager().addListener("Ticker", "BLUR", function() {
                this.startBackgroundModeTimer();
            }.bind(this));
            
            this.game.getEventManager().addListener("Ticker", "RESEARCH_BOUGHT", function() {
                this.updateInterval();
            }.bind(this));
        }
        
        console.log("Ticker: Ticker initialized for game " + this.game.getMeta().id);
        this.benchmarker.init();
        return this;
    };
    
    /**
     * Start background mode timer
     */
    Ticker.prototype.startBackgroundModeTimer = function() {
        if (this.backgroundModeTimeout) {
            clearTimeout(this.backgroundModeTimeout);
            this.backgroundModeTimeout = null;
        }
        
        this.backgroundModeTimeout = setTimeout(function() {
            var wasFocused = this.focused !== false;
            this.focused = false;
            if (wasFocused) {
                this.updateInterval();
            }
            if (this.game.getEventManager) {
                this.game.getEventManager().invokeEvent("BACKGROUND_MODE_ACTIVATED");
            }
        }.bind(this), 15000); // 15 seconds
    };
    
    /**
     * Disable background mode
     */
    Ticker.prototype.disableBackgroundMode = function() {
        if (this.backgroundModeTimeout) {
            clearTimeout(this.backgroundModeTimeout);
            this.backgroundModeTimeout = null;
        }
        
        var wasBackground = this.focused === false;
        this.focused = true;
        if (wasBackground) {
            this.updateInterval();
        }
        if (this.game.getEventManager) {
            this.game.getEventManager().invokeEvent("BACKGROUND_MODE_DISABLED");
        }
    };
    
    /**
     * Destroy the ticker and clean up resources
     */
    Ticker.prototype.destroy = function() {
        this.stop();
        if (this.game.getEventManager) {
            this.game.getEventManager().removeListenerForType("Ticker");
        }
        if (this.benchmarker) {
            this.benchmarker.destroy();
        }
    };
    
    /**
     * Get bonus ticks
     * @returns {number} Number of bonus ticks
     */
    Ticker.prototype.getBonusTicks = function() {
        return this.bonusTicks;
    };
    
    /**
     * Add bonus ticks
     * @param {number} ticks - Ticks to add
     */
    Ticker.prototype.addBonusTicks = function(ticks) {
        this.bonusTicks = Math.round(this.bonusTicks + ticks);
        if (this.game.getEventManager) {
            this.game.getEventManager().invokeEvent("BONUS_TICKS_UPDATED");
        }
    };
    
    /**
     * Set bonus ticks
     * @param {number} ticks - Number of ticks to set
     */
    Ticker.prototype.setBonusTicks = function(ticks) {
        this.bonusTicks = ticks;
        if (this.game.getEventManager) {
            this.game.getEventManager().invokeEvent("BONUS_TICKS_UPDATED");
        }
    };
    
    /**
     * Set purchase bonus ticks
     * @param {number} ticks - Number of purchase bonus ticks
     */
    Ticker.prototype.setPurchaseBonusTicks = function(ticks) {
        this.purchaseBonusTicks = ticks;
        this.updateInterval();
    };
    
    /**
     * Get time travel tickets
     * @returns {number} Number of time travel tickets
     */
    Ticker.prototype.getTimeTravelTickets = function() {
        return this.timeTravelTickets;
    };
    
    /**
     * Add time travel tickets
     * @param {number} tickets - Tickets to add
     */
    Ticker.prototype.addTimeTravelTickets = function(tickets) {
        this.timeTravelTickets = Math.round(this.timeTravelTickets + tickets);
        if (this.game.getEventManager) {
            this.game.getEventManager().invokeEvent("TIME_TRAVEL_TICKETS_UPDATED");
        }
    };
    
    /**
     * Set time travel tickets
     * @param {number} tickets - Number of tickets to set
     */
    Ticker.prototype.setTimeTravelTickets = function(tickets) {
        this.timeTravelTickets = tickets;
        if (this.game.getEventManager) {
            this.game.getEventManager().invokeEvent("TIME_TRAVEL_TICKETS_UPDATED");
        }
    };
    
    /**
     * Get last save timestamp
     * @returns {number} Last save timestamp
     */
    Ticker.prototype.getLastSaveTimestamp = function() {
        return this.lastSaveTimestamp;
    };
    
    /**
     * Check if playing
     * @returns {boolean} True if playing
     */
    Ticker.prototype.getIsPlaying = function() {
        return this.isPlaying;
    };
    
    /**
     * Check if fast mode is active
     * @returns {boolean} True if fast mode is active
     */
    Ticker.prototype.getIsFastActive = function() {
        return this.isFastActive;
    };
    
    /**
     * Check if focused
     * @returns {boolean} True if focused
     */
    Ticker.prototype.getIsFocused = function() {
        return this.focused;
    };
    
    /**
     * Get number of ticks
     * @returns {number} Number of ticks
     */
    Ticker.prototype.getNoOfTicks = function() {
        return this.noOfTicks;
    };
    
    /**
     * Add to number of ticks
     * @param {number} ticks - Ticks to add
     */
    Ticker.prototype.addNoOfTicks = function(ticks) {
        this.noOfTicks += ticks;
    };
    
    /**
     * Get normal ticks per second
     * @returns {number} Normal ticks per second
     */
    Ticker.prototype.getNormalTicksPerSec = function() {
        var baseTicks = 4;
        if (this.game.getResearchManager && this.game.getResearchManager().getResearch) {
            baseTicks += this.game.getResearchManager().getResearch("chronometer");
        }
        return baseTicks + this.purchaseBonusTicks;
    };
    
    /**
     * Get current ticks per second
     * @returns {number} Current ticks per second
     */
    Ticker.prototype.getTicksPerSec = function() {
        var ticksPerSec = this.getNormalTicksPerSec();
        if (this.isFastActive) {
            ticksPerSec = 200;
        }
        return ticksPerSec;
    };
    
    /**
     * Get actual ticks per second
     * @returns {number} Actual ticks per second
     */
    Ticker.prototype.getActualTicksPerSec = function() {
        return this.actualTicksPerSec.actual;
    };
    
    /**
     * Get tick data
     * @returns {Object} Tick data object
     */
    Ticker.prototype.getTickData = function() {
        var runs = 1;
        var ticksPerSec = this.getTicksPerSec();
        
        if (!this.focused) {
            runs = ticksPerSec;
            ticksPerSec = 1;
        }
        
        return { runs: runs, ticksPerSec: ticksPerSec };
    };
    
    /**
     * Update the interval
     */
    Ticker.prototype.updateInterval = function() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        
        if (this.isPlaying) {
            var tickData = this.getTickData();
            this.interval = setInterval(function() {
                if (this.benchmarker) {
                    this.benchmarker.start();
                }
                
                for (var i = 0; i < tickData.runs; i++) {
                    this.tick();
                }
                
                if (this.benchmarker) {
                    this.benchmarker.stop(tickData.runs);
                }
            }.bind(this), Math.round(1000 / tickData.ticksPerSec));
            
            if (this.game.getEventManager) {
                this.game.getEventManager().invokeEvent("TICKS_STARTED");
            }
        }
    };
    
    /**
     * Start the ticker
     */
    Ticker.prototype.start = function() {
        this.isPlaying = true;
        this.updateInterval();
    };
    
    /**
     * Stop the ticker
     */
    Ticker.prototype.stop = function() {
        this.isPlaying = false;
        this.isFastActive = false;
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        if (this.game.getEventManager) {
            this.game.getEventManager().invokeEvent("TICKS_STOPPED");
        }
    };
    
    /**
     * Start fast mode
     */
    Ticker.prototype.startFast = function() {
        if (this.bonusTicks > 0) {
            this.isPlaying = true;
            this.isFastActive = true;
            this.updateInterval();
        }
    };
    
    /**
     * Stop fast mode
     */
    Ticker.prototype.stopFast = function() {
        this.isFastActive = false;
        this.updateInterval();
    };
    
    /**
     * Calculate offline gains
     * @returns {number} Number of bonus ticks gained
     */
    Ticker.prototype.calculateOfflineGains = function() {
        var meta = this.game.getMeta();
        if (!this.lastSaveTimestamp || !meta.maxBonusTicks) {
            return 0;
        }
        
        var offlineTicks = (this.confirmedTimestamp.getConfirmedNow() - this.lastSaveTimestamp) * this.getNormalTicksPerSec();
        var bonusTicks = Math.round(offlineTicks / meta.offlineSlower);
        var maxBonusTicks = meta.maxBonusTicks * this.getNormalTicksPerSec();
        
        if (bonusTicks > maxBonusTicks) {
            bonusTicks = maxBonusTicks;
        }
        
        if (bonusTicks < meta.minBonusTicks) {
            bonusTicks = 0;
        }
        
        return bonusTicks;
    };
    
    /**
     * Add offline gains
     */
    Ticker.prototype.addOfflineGains = function() {
        var bonusTicks = this.calculateOfflineGains();
        console.log("Ticker: Bonus ticks gained: " + bonusTicks);
        this.addBonusTicks(bonusTicks);
    };
    
    /**
     * Process a single tick
     */
    Ticker.prototype.tick = function() {
        if (this.game.getCalculator && this.game.getCalculator().calculate) {
            var calculation = this.game.getCalculator().calculate();
            if (this.game.getEventManager) {
                this.game.getEventManager().invokeEvent("GAME_TICK", calculation);
            }
        }
        
        this.noOfTicks++;
        
        if (this.noOfTicks % 5 === 0 && this.game.getAchievementsManager && this.game.getAchievementsManager().testAll) {
            this.game.getAchievementsManager().testAll();
        }
        
        if (this.isFastActive) {
            this.addBonusTicks(-1);
            if (this.bonusTicks <= 0) {
                this.isFastActive = false;
                this.updateInterval();
            }
        }
        
        var currentSecond = Math.round(Date.now() / 1000);
        this.actualTicksPerSec.ticks++;
        
        if (currentSecond !== this.actualTicksPerSec.second) {
            this.actualTicksPerSec.actual = this.actualTicksPerSec.ticks;
            this.actualTicksPerSec.ticks = 0;
            this.actualTicksPerSec.second = currentSecond;
        }
    };
    
    /**
     * Export ticker data to binary writer
     * @param {Object} writer - BinaryArrayWriter instance
     * @returns {Object} BinaryArrayWriter instance
     */
    Ticker.prototype.exportToWriter = function(writer) {
        if (!writer) {
            // Create a placeholder writer if none provided
            writer = {
                writeUint32: function() { return this; },
                writeUint16: function() { return this; }
            };
        }
        
        writer.writeUint32(this.bonusTicks);
        writer.writeUint16(this.timeTravelTickets);
        writer.writeUint32(this.noOfTicks);
        
        var timestamp = this.confirmedTimestamp && this.confirmedTimestamp.getConfirmedNow ? 
                       this.confirmedTimestamp.getConfirmedNow() : Math.round(Date.now() / 1000);
        writer.writeUint32(timestamp);
        
        return writer;
    };
    
    /**
     * Import ticker data from binary reader
     * @param {Object} reader - BinaryArrayReader instance
     * @param {number} version - Save version
     */
    Ticker.prototype.importFromReader = function(reader, version) {
        if (!reader) return;
        
        this.setBonusTicks(reader.readUint32 ? reader.readUint32() : 0);
        
        if (version >= 5) {
            this.timeTravelTickets = reader.readUint16 ? reader.readUint16() : 1;
        }
        
        this.noOfTicks = reader.readUint32 ? reader.readUint32() : 0;
        this.lastSaveTimestamp = reader.readUint32 ? reader.readUint32() : Math.round(Date.now() / 1000);
    };
    
    return Ticker;
});

