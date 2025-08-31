/**
 * Transport strategy class - handles resource transportation logic for components
 * Extracted from original_app.js
 */
define("game/strategy/Transport", [
    // TODO: These dependencies will need to be implemented as we extract more modules
    // "game/strategy/helper/TransportStackingQueue"
], function() {
    
    // Opposite direction mapping
    var OPPOSITE_DIRECTIONS = {
        top: "bottom",
        bottom: "top",
        left: "right",
        right: "left"
    };
    
    /**
     * Transport strategy constructor
     * @param {Object} component - Component instance
     * @param {Object} meta - Strategy metadata
     */
    var Transport = function(component, meta) {
        this.component = component;
        this.meta = meta;
        this.tile = this.component.getMainTile();
        this.reset();
    };
    
    /**
     * Clear all contents and reset state
     */
    Transport.prototype.clearContents = function() {
        this.updateInputsOutputs();
    };
    
    /**
     * Reset the transport strategy to initial state
     */
    Transport.prototype.reset = function() {
        this.inputQueueOffset = 0;
        this.inputQueuesList = [];
        this.inputQueues = {};
        this.outputQueueOffset = 0;
        this.outputQueuesList = [];
        this.outputQueues = {};
        this.isBridge = false;
    };
    
    /**
     * Get meta description data for transport strategy
     * @param {Object} meta - Component metadata
     * @param {Object} factory - Factory instance
     * @param {Object} strategy - Strategy instance
     * @returns {Object} Description data object
     */
    Transport.getMetaDescriptionData = function(meta, factory, strategy) {
        // TODO: Implement when needed
        return {};
    };
    
    /**
     * Get description data for this transport strategy
     * @returns {Object} Description data object
     */
    Transport.prototype.getDescriptionData = function() {
        return Transport.getMetaDescriptionData(this.component.getMeta(), this.component.getFactory(), this);
    };
    
    /**
     * Update input/output connections and queues
     */
    Transport.prototype.updateInputsOutputs = function() {
        this.reset();
        
        var mainTile = this.component.getMainTile();
        var inputsByDirection = mainTile.getInputOutputManager().getInputsByDirection();
        
        // Create input queues for connected input tiles
        for (var direction in inputsByDirection) {
            if (inputsByDirection[direction]) {
                // TODO: Use TransportStackingQueue when available
                // var queue = new TransportStackingQueue(this.meta.queueSize, this.tile);
                var queue = this._createPlaceholderQueue(this.meta.queueSize, this.tile);
                this.inputQueuesList.push(queue);
                this.inputQueues[direction] = queue;
            }
        }
        
        var outputsByDirection = mainTile.getInputOutputManager().getOutputsByDirection();
        
        // Create output queues for connected output tiles
        for (var direction in outputsByDirection) {
            if (outputsByDirection[direction]) {
                // TODO: Use TransportStackingQueue when available
                // var queue = new TransportStackingQueue(this.meta.queueSize, this.tile);
                var queue = this._createPlaceholderQueue(this.meta.queueSize, this.tile);
                this.outputQueuesList.push(queue);
                this.outputQueues[direction] = queue;
            }
        }
        
        // Check if this is a bridge (has both vertical and horizontal connections)
        var hasVerticalBridge = (this.outputQueues.top && this.inputQueues.bottom) || 
                               (this.outputQueues.bottom && this.inputQueues.top);
        var hasHorizontalBridge = (this.outputQueues.left && this.inputQueues.right) || 
                                 (this.outputQueues.right && this.inputQueues.left);
        
        this.isBridge = hasVerticalBridge && hasHorizontalBridge;
    };
    
    /**
     * Create a placeholder queue while TransportStackingQueue is not available
     * @param {number} size - Queue size
     * @param {Object} tile - Tile instance
     * @returns {Object} Placeholder queue object
     * @private
     */
    Transport.prototype._createPlaceholderQueue = function(size, tile) {
        return {
            queue: [],
            size: size,
            tile: tile,
            getFirst: function() { return this.queue[0] || null; },
            getLast: function() { return this.queue[this.queue.length - 1] || null; },
            setFirst: function(item) { this.queue.unshift(item); },
            unsetLast: function() { return this.queue.pop(); },
            forward: function() { /* TODO: Implement when TransportStackingQueue is available */ }
        };
    };
    
    /**
     * Get all output queues
     * @returns {Object} Object with direction keys mapping to queue objects
     */
    Transport.prototype.getOutputQueues = function() {
        return this.outputQueues;
    };
    
    /**
     * Get output queue for a specific direction
     * @param {string} direction - Direction to get queue for
     * @returns {Object|null} Queue object or null
     */
    Transport.prototype.getOutputQueue = function(direction) {
        return this.outputQueues[direction] || null;
    };
    
    /**
     * Get all input queues
     * @returns {Object} Object with direction keys mapping to queue objects
     */
    Transport.prototype.getInputQueues = function() {
        return this.inputQueues;
    };
    
    /**
     * Get input queue for a specific direction
     * @param {string} direction - Direction to get queue for
     * @returns {Object|null} Queue object or null
     */
    Transport.prototype.getInputQueue = function(direction) {
        return this.inputQueues[direction] || null;
    };
    
    /**
     * Calculate transport logic for this tick
     */
    Transport.prototype.calculateTransport = function() {
        if (this.isBridge) {
            // Bridge mode: move resources between opposite directions
            this.moveInternalInputsToOutputsBridge("top", "bottom");
            this.moveInternalInputsToOutputsBridge("left", "right");
        } else {
            // Normal mode: move resources from inputs to outputs
            this.moveInternalInputsToOutputs();
        }
        
        // Pull resources from outside to inputs
        this.pullFromOutsideToInputs("top", this.inputQueues.top);
        this.pullFromOutsideToInputs("right", this.inputQueues.right);
        this.pullFromOutsideToInputs("bottom", this.inputQueues.bottom);
        this.pullFromOutsideToInputs("left", this.inputQueues.left);
    };
    
    /**
     * Move resources between opposite directions in bridge mode
     * @param {string} direction1 - First direction
     * @param {string} direction2 - Second direction
     */
    Transport.prototype.moveInternalInputsToOutputsBridge = function(direction1, direction2) {
        // Ensure we have the correct input/output pairing
        if (this.inputQueues[direction2]) {
            var temp = direction1;
            direction1 = direction2;
            direction2 = temp;
        }
        
        var inputQueue = this.inputQueues[direction1];
        var outputQueue = this.outputQueues[direction2];
        
        if (inputQueue && outputQueue) {
            var lastItem = inputQueue.getLast();
            if (lastItem && !outputQueue.getFirst()) {
                outputQueue.setFirst(lastItem);
                inputQueue.unsetLast();
            }
            inputQueue.forward();
        }
    };
    
    /**
     * Move resources from inputs to outputs in normal mode
     */
    Transport.prototype.moveInternalInputsToOutputs = function() {
        var movedCount = 0;
        
        for (var i = 0; i < this.inputQueuesList.length; i++) {
            var inputQueue = this.inputQueuesList[(this.inputQueueOffset + i) % this.inputQueuesList.length];
            var lastItem = inputQueue.getLast();
            
            if (lastItem) {
                // Find an available output queue
                for (var j = 0; j < this.outputQueuesList.length; j++) {
                    var outputQueue = this.outputQueuesList[(this.outputQueueOffset + j) % this.outputQueuesList.length];
                    
                    if (!outputQueue.getFirst()) {
                        this.outputQueueOffset = (this.outputQueueOffset + 1) % this.outputQueuesList.length;
                        outputQueue.setFirst(lastItem);
                        inputQueue.unsetLast();
                        movedCount++;
                        break;
                    }
                }
            }
            
            inputQueue.forward();
        }
        
        this.inputQueueOffset = (this.inputQueueOffset + movedCount) % this.inputQueuesList.length;
    };
    
    /**
     * Pull resources from outside to input queues
     * @param {string} direction - Direction to pull from
     * @param {Object} inputQueue - Input queue to fill
     */
    Transport.prototype.pullFromOutsideToInputs = function(direction, inputQueue) {
        if (inputQueue) {
            var neighborTile = this.tile.getTileInDirection(direction);
            if (neighborTile) {
                var neighborComponent = neighborTile.getComponent();
                
                if (neighborComponent && neighborComponent.getMeta().strategy.type === "transport") {
                    var oppositeDirection = OPPOSITE_DIRECTIONS[direction];
                    var neighborOutputQueue = neighborComponent.getStrategy().getOutputQueue(oppositeDirection);
                    
                    if (neighborOutputQueue && !inputQueue.getFirst() && neighborOutputQueue.getLast()) {
                        inputQueue.setFirst(neighborOutputQueue.getLast());
                        neighborOutputQueue.unsetLast();
                    }
                    
                    neighborOutputQueue.forward();
                }
            }
        }
    };
    
    /**
     * Get string representation of the transport strategy
     * @returns {string} String representation
     */
    Transport.prototype.toString = function() {
        var result = "IN offset:" + this.inputQueueOffset + "<br />";
        
        for (var direction in this.inputQueues) {
            var queue = this.inputQueues[direction];
            var queueStr = "";
            
            if (queue && queue.getQueue) {
                var queueData = queue.getQueue();
                for (var i = 0; i < queueData.length; i++) {
                    queueStr += (queueData[i] ? queueData[i].getResourceId() : "") + ",";
                }
            }
            
            result += direction + ": " + queueStr + "<br />";
        }
        
        result += "<br />OUT offset:" + this.outputQueueOffset + "<br />";
        
        for (var direction in this.outputQueues) {
            var queue = this.outputQueues[direction];
            var queueStr = "";
            
            if (queue && queue.getQueue) {
                var queueData = queue.getQueue();
                for (var i = 0; i < queueData.length; i++) {
                    queueStr += (queueData[i] ? queueData[i].getResourceId() : "") + ",";
                }
            }
            
            result += direction + ": " + queueStr + "<br />";
        }
        
        return result;
    };
    
    /**
     * Export transport strategy data to writer
     * @param {Object} writer - BinaryArrayWriter instance
     */
    Transport.prototype.exportToWriter = function(writer) {
        var exportQueue = function(queue) {
            if (queue && queue.exportToWriter) {
                queue.exportToWriter(writer);
            }
        };
        
        writer.writeUint8(this.inputQueueOffset);
        writer.writeUint8(this.outputQueueOffset);
        
        exportQueue(this.inputQueues.top);
        exportQueue(this.inputQueues.right);
        exportQueue(this.inputQueues.bottom);
        exportQueue(this.inputQueues.left);
        
        exportQueue(this.outputQueues.top);
        exportQueue(this.outputQueues.right);
        exportQueue(this.outputQueues.bottom);
        exportQueue(this.outputQueues.left);
    };
    
    /**
     * Import transport strategy data from reader
     * @param {Object} reader - BinaryArrayReader instance
     * @param {number} version - Save file version
     */
    Transport.prototype.importFromReader = function(reader, version) {
        var importQueue = function(queue) {
            if (queue && queue.importFromReader) {
                queue.importFromReader(reader, version);
            }
        };
        
        this.inputQueueOffset = reader.readUint8();
        this.outputQueueOffset = reader.readUint8();
        
        importQueue(this.inputQueues.top);
        importQueue(this.inputQueues.right);
        importQueue(this.inputQueues.bottom);
        importQueue(this.inputQueues.left);
        
        importQueue(this.outputQueues.top);
        importQueue(this.outputQueues.right);
        importQueue(this.outputQueues.bottom);
        importQueue(this.outputQueues.left);
    };
    
    return Transport;
});
