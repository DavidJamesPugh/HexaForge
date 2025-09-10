export default class DelayedAction {
    constructor(interval) {
      this.interval = interval;
      this.calculateEfficiencyInterval = 50;
      this.reset();
    }
  
    reset() {
      this.timer = 0;
      this.efficiency = null;
      this.workingTime = 0;
      this.totalTime = 0;
    }
  
    updateWithDescriptionData(desc) {
      desc.effectivenessStr = this.efficiency !== null ? `${Math.round(this.efficiency)}%` : "-";
    }
  
    canStart() {
      throw new Error("canStart method should be overwritten");
    }
  
    start() {
      throw new Error("start method should be overwritten");
    }
  
    finished() {
      throw new Error("finished method should be overwritten");
    }
  
    getEfficiency() {
      return this.efficiency;
    }
  
    calculate(state) {
      if (this.timer > 0) {
        if (this.timer >= this.interval) {
          this.finished(state);
          this.timer = -1;
        }
        this.timer++;
      }
  
      if (this.timer === 0 && this.canStart()) {
        this.start(state);
        this.timer = 1;
      }
  
      if (this.totalTime >= this.calculateEfficiencyInterval) {
        this.efficiency = Math.round((100 * this.workingTime) / this.totalTime);
        this.totalTime = 0;
        this.workingTime = 0;
      }
  
      this.totalTime++;
      if (this.timer > 0) this.workingTime++;
    }
  
    toString() {
      let str = "PRODUCTION<br />";
      str += `Efficiency: ${this.efficiency === null ? "..." : this.efficiency + "%"}<br />`;
      str += this.timer === 0 ? "Idle<br />" : `${this.timer}/${this.interval}<br />`;
      return str;
    }
  
    exportToWriter(writer) {
      writer.writeUint8(this.timer);
    }
  
    importFromReader(reader) {
      this.timer = reader.readUint8();
    }
  }
  