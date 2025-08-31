/**
 * EventManager module - handles event registration, removal, and invocation
 * Extracted from original_app.js
 */
define("base/EventManager", [], function() {
    
    /**
     * EventManager constructor
     * @param {Array} handledEvents - Array of event types this manager can handle
     * @param {string} eventTag - Tag for logging purposes
     */
    var EventManager = function(handledEvents, eventTag) {
        this.handledEvents = handledEvents;
        this.eventTag = eventTag;
        this.events = {};
    };

    /**
     * Add an event listener for a specific event type
     * @param {string} listenerId - Unique identifier for the listener
     * @param {string} eventType - Type of event to listen for
     * @param {Function} callback - Function to call when event occurs
     */
    EventManager.prototype.addListener = function(listenerId, eventType, callback) {
        if (!this.handledEvents[eventType]) {
            console.warn(this.eventTag, "This event manager is not configured to handle event: " + eventType + ". " + listenerId + " tried to listen for it.");
            return;
        }
        
        if (!this.events[eventType]) {
            this.events[eventType] = {};
        }
        
        this.events[eventType][listenerId] = callback;
    };

    /**
     * Remove a specific event listener
     * @param {string} listenerId - ID of the listener to remove
     * @param {string} eventType - Type of event to remove listener from
     */
    EventManager.prototype.removeListener = function(listenerId, eventType) {
        if (this.events[eventType] && this.events[eventType][listenerId]) {
            delete this.events[eventType][listenerId];
        }
    };

    /**
     * Remove all listeners for a specific listener ID across all event types
     * @param {string} listenerId - ID of the listener to remove
     */
    EventManager.prototype.removeListenerForType = function(listenerId) {
        for (var eventType in this.events) {
            for (var id in this.events[eventType]) {
                if (id == listenerId) {
                    delete this.events[eventType][id];
                }
            }
        }
    };

    /**
     * Invoke an event, calling all registered listeners
     * @param {string} eventType - Type of event to invoke
     * @param {*} arg1 - First argument to pass to listeners
     * @param {*} arg2 - Second argument to pass to listeners
     * @param {*} arg3 - Third argument to pass to listeners
     * @param {*} arg4 - Fourth argument to pass to listeners
     * @param {*} arg5 - Fifth argument to pass to listeners
     */
    EventManager.prototype.invokeEvent = function(eventType, arg1, arg2, arg3, arg4, arg5) {
        if (this.events[eventType]) {
            for (var listenerId in this.events[eventType]) {
                if (this.events[eventType][listenerId]) {
                    this.events[eventType][listenerId](arg1, arg2, arg3, arg4, arg5);
                }
            }
        }
    };

    return EventManager;
});
