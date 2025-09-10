// game/calculator/TransportCalculator.js
export default class TransportCalculator {
    constructor(factory) {
      this.factory = factory;
      this.endTiles = [];
      this.doneIndex = [];
      this.queue = [];
      this.queueChecked = 0;
    }
  
    calculate() {
      this.doneIndex.length = 0;
      this.queue.length = 0;
      this.queueChecked = 0;
  
      for (const tile of this.endTiles) {
        this.queue.push(tile);
        this.log(`${tile.getIdStr()} added to queue as end tile`);
      }
  
      while (this.queue.length > this.queueChecked) {
        this.step(this.queue[this.queueChecked]);
        this.queueChecked++;
      }
    }
  
    log(msg) {
      // optional logging
    }
  
    step(tile) {
      if (!this.doneIndex[tile.getId()]) {
        const outputs = tile.getInputOutputManager().getOutputsList();
        if (outputs.length > 1) {
          const doneCount = outputs.filter(o => this.doneIndex[o.getId()]).length;
          if (doneCount !== outputs.length) {
            this.log(`${tile.getIdStr()} skipped, not all outputs calculated!`);
            return;
          }
        }
  
        this.doneIndex[tile.getId()] = true;
        this.log(`Calculate ${tile.getIdStr()}`);
  
        const strategy = tile.getComponent().getStrategy();
        strategy.calculateTransport?.();
  
        const inputs = tile.getInputOutputManager().getInputsList();
        for (const inputTile of inputs) {
          this.queue.push(inputTile);
          this.log(`${inputTile.getIdStr()} added to queue`);
        }
      }
    }
  
    buildCaches() {
      this.endTiles = [];
      const tiles = this.factory.getTiles();
      for (const t of tiles) {
        if (t.getComponent() &&
           (t.getInputOutputManager().getOutputsList().length !== 0 && t.getComponent().getMeta().strategy.type === "transport")) {
          this.endTiles.push(t);
        }
      }
    }
  }
  