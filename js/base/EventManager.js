export default class EventManager {
    constructor(handledEvents = [], eventTag = "") {
      this.handledEvents = handledEvents;
      this.eventTag = eventTag;
      this.events = {};
    }
    addListener(name, type, callback) {
      // Convert handledEvents to array if it's an object
      if (!type) console.warn("Trying to add listener with undefined type!", name);
      const handled = Array.isArray(this.handledEvents)
        ? this.handledEvents
        : Object.values(this.handledEvents);
    
      if (!handled.includes(type)) {
        console.warn(`${this.eventTag}: Event ${type} is not handled. ${name} tried to listen for it.`);
      }
    
      if (!this.events[type]) this.events[type] = {};
      this.events[type][name] = callback;
    }
    
    removeListener(name, type) {
      if (this.events[type] && this.events[type][name]) delete this.events[type][name];
    }
  
    removeListenerForType(name) {
      for (const type in this.events) {
        if (this.events[type][name]) delete this.events[type][name];
      }
    }
  
    invokeEvent(type, ...args) {
      if (args.length && typeof args[args.length - 1] === "function") {
        console.warn("invokeEvent should not receive callbacks as final arguments; ignoring last argument.");
        args = args.slice(0, -1);
      }
      if (!this.events[type]) return;
      for (const callbackName in this.events[type]) {
        const callback = this.events[type][callbackName];
        if (callback) callback(...args);
      }
    }
  }
  