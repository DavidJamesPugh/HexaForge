/**
 * InputOutputManager class - manages resource input/output connections between tiles
 * Extracted from original_app.js
 */
define("game/InputOutputManager", [], function() {
    
    // Opposite direction mapping
    var OPPOSITE_DIRECTIONS = {
        top: "bottom",
        bottom: "top",
        left: "right",
        right: "left"
    };
    
    /**
     * InputOutputManager constructor
     * @param {Object} tile - Tile instance
     * @param {Function} changedCallback - Callback when connections change
     */
    var InputOutputManager = function(tile, changedCallback) {
        this.tile = tile;
        this.changedCallback = changedCallback;
        
        // Initialize input/output lists and direction mappings
        this.inputsList = [];
        this.inputsByDirection = {
            top: null,
            right: null,
            bottom: null,
            left: null
        };
        
        this.outputsList = [];
        this.outputsByDirection = {
            top: null,
            right: null,
            bottom: null,
            left: null
        };
        
        this.reset();
    };
    
    /**
     * Reset all input/output connections
     */
    InputOutputManager.prototype.reset = function() {
        this.clearInput("top");
        this.clearInput("right");
        this.clearInput("bottom");
        this.clearInput("left");
        this.clearOutput("top");
        this.clearOutput("right");
        this.clearOutput("bottom");
        this.clearOutput("left");
    };
    
    /**
     * Set an input connection in a specific direction
     * @param {string} direction - Direction for the input
     */
    InputOutputManager.prototype.setInput = function(direction) {
        if (!this.inputsByDirection[direction]) {
            // Clear any existing output in this direction
            this.clearOutput(direction);
            
            // Get the tile in the specified direction
            var targetTile = this.tile.getTileInDirection(direction);
            if (targetTile) {
                this.inputsByDirection[direction] = targetTile;
                this._updateInputOutputLists();
                
                // Set the corresponding output on the target tile
                var oppositeDirection = OPPOSITE_DIRECTIONS[direction];
                targetTile.getInputOutputManager().setOutput(oppositeDirection);
                
                // Notify that connections have changed
                this.changedCallback();
            }
        }
    };
    
    /**
     * Set an output connection in a specific direction
     * @param {string} direction - Direction for the output
     */
    InputOutputManager.prototype.setOutput = function(direction) {
        if (!this.outputsByDirection[direction]) {
            // Clear any existing input in this direction
            this.clearInput(direction);
            
            // Get the tile in the specified direction
            var targetTile = this.tile.getTileInDirection(direction);
            if (targetTile) {
                this.outputsByDirection[direction] = targetTile;
                this._updateInputOutputLists();
                
                // Set the corresponding input on the target tile
                var oppositeDirection = OPPOSITE_DIRECTIONS[direction];
                targetTile.getInputOutputManager().setInput(oppositeDirection);
                
                // Notify that connections have changed
                this.changedCallback();
            }
        }
    };
    
    /**
     * Clear an input connection in a specific direction
     * @param {string} direction - Direction to clear input from
     */
    InputOutputManager.prototype.clearInput = function(direction) {
        if (this.inputsByDirection[direction]) {
            var targetTile = this.inputsByDirection[direction];
            this.inputsByDirection[direction] = null;
            
            // Clear the corresponding output on the target tile
            var oppositeDirection = OPPOSITE_DIRECTIONS[direction];
            targetTile.getInputOutputManager().clearOutput(oppositeDirection);
            
            this._updateInputOutputLists();
            this.changedCallback();
        }
    };
    
    /**
     * Clear an output connection in a specific direction
     * @param {string} direction - Direction to clear output from
     */
    InputOutputManager.prototype.clearOutput = function(direction) {
        if (this.outputsByDirection[direction]) {
            var targetTile = this.outputsByDirection[direction];
            this.outputsByDirection[direction] = null;
            
            // Clear the corresponding input on the target tile
            var oppositeDirection = OPPOSITE_DIRECTIONS[direction];
            targetTile.getInputOutputManager().clearInput(oppositeDirection);
            
            this._updateInputOutputLists();
            this.changedCallback();
        }
    };
    
    /**
     * Update the input/output lists based on current connections
     * @private
     */
    InputOutputManager.prototype._updateInputOutputLists = function() {
        // Update inputs list
        this.inputsList = [];
        if (this.inputsByDirection.top) {
            this.inputsList.push(this.inputsByDirection.top);
        }
        if (this.inputsByDirection.right) {
            this.inputsList.push(this.inputsByDirection.top);
        }
        if (this.inputsByDirection.bottom) {
            this.inputsList.push(this.inputsByDirection.bottom);
        }
        if (this.inputsByDirection.left) {
            this.inputsList.push(this.inputsByDirection.left);
        }
        
        // Update outputs list
        this.outputsList = [];
        if (this.outputsByDirection.top) {
            this.outputsList.push(this.outputsByDirection.top);
        }
        if (this.outputsByDirection.right) {
            this.outputsList.push(this.outputsByDirection.right);
        }
        if (this.outputsByDirection.bottom) {
            this.outputsList.push(this.outputsByDirection.bottom);
        }
        if (this.outputsByDirection.left) {
            this.outputsList.push(this.outputsByDirection.left);
        }
    };
    
    /**
     * Get the list of input tiles
     * @returns {Array} Array of input tile objects
     */
    InputOutputManager.prototype.getInputsList = function() {
        return this.inputsList;
    };
    
    /**
     * Get inputs organized by direction
     * @returns {Object} Object with direction keys mapping to tile objects
     */
    InputOutputManager.prototype.getInputsByDirection = function() {
        return this.inputsByDirection;
    };
    
    /**
     * Get the list of output tiles
     * @returns {Array} Array of output tile objects
     */
    InputOutputManager.prototype.getOutputsList = function() {
        return this.outputsList;
    };
    
    /**
     * Get outputs organized by direction
     * @returns {Object} Object with direction keys mapping to tile objects
     */
    InputOutputManager.prototype.getOutputsByDirection = function() {
        return this.outputsByDirection;
    };
    
    /**
     * Export input/output manager data to writer
     * @param {Object} writer - BinaryArrayWriter instance
     */
    InputOutputManager.prototype.exportToWriter = function(writer) {
        // TODO: Implement BinaryBoolean when available
        // var booleanData = new BinaryBoolean().writeAll(
        //     this.inputsByDirection.top,
        //     this.inputsByDirection.right,
        //     this.inputsByDirection.bottom,
        //     this.inputsByDirection.left,
        //     this.outputsByDirection.top,
        //     this.outputsByDirection.right,
        //     this.outputsByDirection.bottom,
        //     this.outputsByDirection.left
        // );
        // writer.writeBooleanMap(booleanData);
        
        console.log("InputOutputManager.exportToWriter - TODO: Implement BinaryBoolean");
    };
    
    /**
     * Import input/output manager data from reader
     * @param {Object} reader - BinaryArrayReader instance
     * @param {number} version - Save file version
     */
    InputOutputManager.prototype.importFromReader = function(reader, version) {
        // TODO: Implement BinaryBoolean when available
        // var booleanData = reader.readBooleanMap();
        // 
        // if (booleanData.readBoolean()) this.setInput("top");
        // if (booleanData.readBoolean()) this.setInput("right");
        // if (booleanData.readBoolean()) this.setInput("bottom");
        // if (booleanData.readBoolean()) this.setInput("left");
        // if (booleanData.readBoolean()) this.setOutput("top");
        // if (booleanData.readBoolean()) this.setOutput("right");
        // if (booleanData.readBoolean()) this.setOutput("bottom");
        // if (booleanData.readBoolean()) this.setOutput("left");
        
        console.log("InputOutputManager.importFromReader - TODO: Implement BinaryBoolean");
    };
    
    return InputOutputManager;
});
