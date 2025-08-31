/**
 * DelayedAction Helper - Manages timed actions and production cycles for components
 * Extracted from original_app.js
 */
define("game/strategy/helper/DelayedAction", [], function() {
    
    var DelayedAction = function(interval) {
        this.interval = interval;
        this.reset();
        this.calculateEfficiencyInterval = 50;
    };
    
    /**
     * Reset the delayed action manager
     */
    DelayedAction.prototype.reset = function() {
        this.timer = 0;
        this.efficiency = null;
        this.workingTime = 0;
        this.totalTime = 0;
    };
    
    /**
     * Update description data with efficiency information
     * @param {Object} data - Description data object to update
     */
    DelayedAction.prototype.updateWithDescriptionData = function(data) {
        if (this.efficiency !== null) {
            data.effectivenessStr = Math.round(this.efficiency) + "%";
        } else {
            data.effectivenessStr = "-";
        }
    };
    
    /**
     * Check if the action can start (to be overridden by subclasses)
     * @throws {Error} Always throws - method should be overridden
     */
    DelayedAction.prototype.canStart = function() {
        throw new Error("canStart method should be overwritten");
    };
    
    /**
     * Start the action (to be overridden by subclasses)
     * @throws {Error} Always throws - method should be overridden
     */
    DelayedAction.prototype.start = function() {
        throw new Error("start method should be overwritten");
    };
    
    /**
     * Finish the action (to be overridden by subclasses)
     * @throws {Error} Always throws - method should be overridden
     */
    DelayedAction.prototype.finished = function() {
        throw new Error("finished method should be overwritten");
    };
    
    /**
     * Get current efficiency percentage
     * @returns {number|null} Efficiency percentage or null if not calculated
     */
    DelayedAction.prototype.getEfficiency = function() {
        return this.efficiency;
    };
    
    /**
     * Calculate the next step of the delayed action
     * @param {Object} context - Context object passed to finished method
     */
    DelayedAction.prototype.calculate = function(context) {
        // Handle active timer
        if (this.timer > 0) {
            if (this.timer >= this.interval) {
                // Action completed
                this.finished(context);
                this.timer = -1; // Mark as finished
            } else {
                this.timer++;
            }
        }
        
        // Check if action can start
        if (this.timer === 0 && this.canStart()) {
            this.start(context);
            this.timer = 1;
        }
        
        // Calculate efficiency periodically
        if (this.totalTime >= this.calculateEfficiencyInterval) {
            this.efficiency = Math.round((100 * this.workingTime) / this.totalTime);
            this.totalTime = 0;
            this.workingTime = 0;
        }
        
        this.totalTime++;
        
        // Update working time if action is active
        if (this.timer > 0) {
            this.workingTime++;
        }
    };
    
    /**
     * Get string representation of the delayed action
     * @returns {string} String representation
     */
    DelayedAction.prototype.toString = function() {
        var str = "PRODUCTION<br />";
        
        if (this.efficiency !== null) {
            str += "Efficiency: " + this.efficiency + "%<br />";
        } else {
            str += "Efficiency: ...<br />";
        }
        
        if (this.timer === 0) {
            str += "Idle<br />";
        } else {
            str += this.timer + "/" + this.interval + "<br />";
        }
        
        return str;
    };
    
    /**
     * Export data to writer
     * @param {Object} writer - BinaryArrayWriter instance
     */
    DelayedAction.prototype.exportToWriter = function(writer) {
        // TODO: Implement when BinaryArrayWriter is available
        // writer.writeUint8(this.timer);
        console.log("DelayedAction.exportToWriter - BinaryArrayWriter not yet extracted");
    };
    
    /**
     * Import data from reader
     * @param {Object} reader - BinaryArrayReader instance
     * @param {Object} factory - Factory instance
     */
    DelayedAction.prototype.importFromReader = function(reader, factory) {
        // TODO: Implement when BinaryArrayReader is available
        // this.timer = reader.readUint8();
        console.log("DelayedAction.importFromReader - BinaryArrayReader not yet extracted");
    };
    
    return DelayedAction;
});
