import TransportStackingQueue from "./helper/TransportStackingQueue.js";

const OPPOSITE = { top: "bottom", bottom: "top", left: "right", right: "left" };

export default class Transport {
  constructor(component, meta) {
    this.component = component;
    this.meta = meta;
    this.tile = this.component.getMainTile();
    this.reset();
  }

  reset() {
    this.inputQueueOffset = 0;
    this.inputQueuesList = [];
    this.inputQueues = {};
    this.outputQueueOffset = 0;
    this.outputQueuesList = [];
    this.outputQueues = {};
    this.isBridge = false;
  }

  clearContents() {
    this.updateInputsOutputs();
  }

  static getMetaDescriptionData(meta, factory) {
    return {};
  }

  getDescriptionData() {
    return Transport.getMetaDescriptionData(this.component.getMeta(), this.component.getFactory());
  }

  updateInputsOutputs() {
    this.reset();
    const inputs = this.tile.getInputOutputManager().getInputsByDirection();
    for (const dir in inputs) if (inputs[dir]) {
      const queue = new TransportStackingQueue(this.meta.queueSize, this.tile);
      this.inputQueuesList.push(queue);
      this.inputQueues[dir] = queue;
    }

    const outputs = this.tile.getInputOutputManager().getOutputsByDirection();
    for (const dir in outputs) if (outputs[dir]) {
      const queue = new TransportStackingQueue(this.meta.queueSize, this.tile);
      this.outputQueuesList.push(queue);
      this.outputQueues[dir] = queue;
    }

    const a = (this.outputQueues.top && this.inputQueues.bottom) || (this.outputQueues.bottom && this.inputQueues.top);
    const u = (this.outputQueues.left && this.inputQueues.right) || (this.outputQueues.right && this.inputQueues.left);
    this.isBridge = a && u;
  }

  getOutputQueues() { return this.outputQueues; }
  getOutputQueue(dir) { return this.outputQueues[dir]; }
  getInputQueues() { return this.inputQueues; }
  getInputQueue(dir) { return this.inputQueues[dir]; }

  calculateTransport() {
    this.isBridge
      ? (this.moveInternalInputsToOutputsBridge("top", "bottom"), this.moveInternalInputsToOutputsBridge("left", "right"))
      : this.moveInternalInputsToOutputs();

    ["top", "right", "bottom", "left"].forEach(dir => this.pullFromOutsideToInputs(dir, this.inputQueues[dir]));
    
  }

  moveInternalInputsToOutputsBridge(e, t) {
    if (this.inputQueues[t]) [e, t] = [t, e];

    const inputQ = this.inputQueues[e];
    const outputQ = this.outputQueues[t];
    const last = inputQ.getLast();
    if (last && !outputQ.getFirst()) {
      outputQ.setFirst(last);
      inputQ.unsetLast();
    }
    inputQ.forward();
  }

  moveInternalInputsToOutputs() {
    let movedCount = 0;
    for (let t = 0; t < this.inputQueuesList.length; t++) {
      const inputQ = this.inputQueuesList[(this.inputQueueOffset + t) % this.inputQueuesList.length];
      const last = inputQ.getLast();
      if (!last) { inputQ.forward(); continue; }

      for (let r = 0; r < this.outputQueuesList.length; r++) {
        const outputIndex = (this.outputQueueOffset + r) % this.outputQueuesList.length;
        const outputQ = this.outputQueuesList[outputIndex];
        if (!outputQ.getFirst()) {
          this.outputQueueOffset = (this.outputQueueOffset + 1) % this.outputQueuesList.length;
          outputQ.setFirst(last);
          inputQ.unsetLast();
          movedCount++;
          break;
        }
      }
      inputQ.forward();
    }
    this.inputQueueOffset = (this.inputQueueOffset + movedCount) % this.inputQueuesList.length;
  }

  pullFromOutsideToInputs(dir, inputQ) {
    if (!inputQ) return;
    const neighborTile = this.tile.getTileInDirection(dir);
    const neighborComponent = neighborTile.getComponent();
    if (neighborComponent.getMeta().strategy.type === "transport") {
      const outputQ = neighborComponent.getStrategy().getOutputQueue(OPPOSITE[dir]);
      if (!inputQ.getFirst() && outputQ.getLast()) {
        inputQ.setFirst(outputQ.getLast());
        outputQ.unsetLast();
      }
      outputQ.forward();
    }
  }

  toString() {
    let str = `IN offset:${this.inputQueueOffset}<br />`;
    for (const dir in this.inputQueues) {
      str += dir + ": " + this.inputQueues[dir].getQueue().map(p => (p ? p.getResourceId() : "")).join(",") + "<br />";
    }

    str += `<br />OUT offset:${this.outputQueueOffset}<br />`;
    for (const dir in this.outputQueues) {
      str += dir + ": " + this.outputQueues[dir].getQueue().map(p => (p ? p.getResourceId() : "")).join(",") + "<br />";
    }

    return str;
  }

  exportToWriter(writer) {
    const exportQueue = q => q?.exportToWriter(writer);
    writer.writeUint8(this.inputQueueOffset);
    writer.writeUint8(this.outputQueueOffset);
    ["top", "right", "bottom", "left"].forEach(dir => exportQueue(this.inputQueues[dir]));
    ["top", "right", "bottom", "left"].forEach(dir => exportQueue(this.outputQueues[dir]));
  }

  importFromReader(reader) {
    const importQueue = q => q?.importFromReader(reader);
    this.inputQueueOffset = reader.readUint8();
    this.outputQueueOffset = reader.readUint8();
    ["top", "right", "bottom", "left"].forEach(dir => importQueue(this.inputQueues[dir]));
    ["top", "right", "bottom", "left"].forEach(dir => importQueue(this.outputQueues[dir]));
  }
}
