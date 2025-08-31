/**
 * TransportStackingQueue Helper - Manages transport queues and package flow for components
 * Extracted from original_app.js
 */
define("game/strategy/helper/TransportStackingQueue", [
    "game/strategy/helper/Package"
], function(Package) {
    
    var TransportStackingQueue = function(length, tile) {
        this.queue = new Array(length);
        this.tile = tile;
    };
    
    /**
     * Reset the queue
     */
    TransportStackingQueue.prototype.reset = function() {
        for (var i = 0; i < this.queue.length; i++) {
            this.set(i, undefined);
        }
    };
    
    /**
     * Forward all packages in the queue
     */
    TransportStackingQueue.prototype.forward = function() {
        for (var i = this.queue.length - 2; i >= 0; i--) {
            if (this.queue[i + 1] === undefined && this.queue[i] !== undefined) {
                this.queue[i + 1] = this.queue[i];
                this.queue[i] = undefined;
            }
        }
    };
    
    /**
     * Set the first package in the queue
     * @param {Package} package - Package to set
     */
    TransportStackingQueue.prototype.setFirst = function(package) {
        this.queue[0] = package;
    };
    
    /**
     * Unset the first package in the queue
     */
    TransportStackingQueue.prototype.unsetFirst = function() {
        this.setFirst(undefined);
    };
    
    /**
     * Set the last package in the queue
     * @param {Package} package - Package to set
     */
    TransportStackingQueue.prototype.setLast = function(package) {
        this.queue[this.queue.length - 1] = package;
    };
    
    /**
     * Unset the last package in the queue
     */
    TransportStackingQueue.prototype.unsetLast = function() {
        this.setLast(undefined);
    };
    
    /**
     * Get the last package in the queue
     * @returns {Package|undefined} Last package or undefined
     */
    TransportStackingQueue.prototype.getLast = function() {
        return this.queue[this.queue.length - 1];
    };
    
    /**
     * Get the first package in the queue
     * @returns {Package|undefined} First package or undefined
     */
    TransportStackingQueue.prototype.getFirst = function() {
        return this.queue[0];
    };
    
    /**
     * Get the entire queue array
     * @returns {Array} Queue array
     */
    TransportStackingQueue.prototype.getQueue = function() {
        return this.queue;
    };
    
    /**
     * Get package at specific index
     * @param {number} index - Queue index
     * @returns {Package|undefined} Package at index or undefined
     */
    TransportStackingQueue.prototype.get = function(index) {
        return this.queue[index];
    };
    
    /**
     * Set package at specific index
     * @param {number} index - Queue index
     * @param {Package} package - Package to set
     */
    TransportStackingQueue.prototype.set = function(index, package) {
        this.queue[index] = package || undefined;
    };
    
    /**
     * Get queue length
     * @returns {number} Queue length
     */
    TransportStackingQueue.prototype.getLength = function() {
        return this.queue.length;
    };
    
    /**
     * Get string representation of the queue
     * @returns {string} Queue as comma-separated string
     */
    TransportStackingQueue.prototype.toString = function() {
        return this.queue.join(",");
    };
    
    /**
     * Export queue data to writer
     * @param {Object} writer - BinaryArrayWriter instance
     */
    TransportStackingQueue.prototype.exportToWriter = function(writer) {
        // TODO: Implement when BinaryArrayWriter is available
        for (var i = 0; i < this.queue.length; i++) {
            Package.staticExportData(this.queue[i], writer);
        }
    };
    
    /**
     * Import queue data from reader
     * @param {Object} reader - BinaryArrayReader instance
     * @param {Object} factory - Factory instance
     */
    TransportStackingQueue.prototype.importFromReader = function(reader, factory) {
        // TODO: Implement when BinaryArrayReader is available
        for (var i = 0; i < this.queue.length; i++) {
            this.set(i, Package.createFromExport(factory, reader, 1));
        }
    };
    
    /**
     * Test the TransportStackingQueue functionality
     * @static
     */
    TransportStackingQueue.test = function() {
        var assert = function(expected, testName) {
            var actual = queue.getQueue().join(",");
            var expectedStr = expected.join(",");
            if (actual !== expectedStr) {
                throw new Error("StackQueue test " + testName + " failed. Expected " + expectedStr + " but got " + actual);
            }
        };
        
        var queue = new TransportStackingQueue(3);
        
        queue.setFirst("A");
        assert(["A", null, null], 1);
        
        queue.forward();
        assert([null, "A", null], 2);
        
        queue.forward();
        assert([null, null, "A"], 3);
        
        queue.setFirst("B");
        assert(["B", null, "A"], 4);
        
        queue.forward();
        assert([null, "B", "A"], 5);
        
        queue.setLast(null);
        assert([null, "B", null], 6);
        
        queue.forward();
        assert([null, null, "B"], 7);
        
        queue.setLast(null);
        assert([null, null, null], 8);
        
        queue.forward();
        assert([null, null, null], 9);
        
        queue.forward();
        assert([null, null, null], 10);
        
        console.log("TransportStackingQueue tests passed!");
    };
    
    return TransportStackingQueue;
});
