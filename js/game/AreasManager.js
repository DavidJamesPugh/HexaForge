export default class AreasManager {
    constructor(factory) {
      this.factory = factory;
      this.game = factory.getGame();
      this.boughtAreas = {};
    }
  
    setAreaBought(areaId, bought) {
      this.boughtAreas[areaId] = bought;
    }
  
    getIsAreaBought(areaId) {
      return !!this.boughtAreas[areaId];
    }
  
    getPrice(areaId) {
      return this.factory.getMeta().areasById[areaId];
    }
  
    canPurchase(areaId) {
      return this.game.getMoney() >= this.getPrice(areaId);
    }
  
    canBuildAt(x, y, width, height) {
      for (const area of this.factory.getMeta().areas) {
        for (const loc of area.locations) {
          const overlaps = !(loc.x >= x + width || loc.x + loc.width <= x || loc.y >= y + height || loc.y + loc.height <= y);
          if (overlaps && !this.boughtAreas[area.id]) return false;
        }
      }
      return true;
    }
  
    exportToWriter() {
      const boughtCount = Object.keys(this.boughtAreas).length;
      const writer = new BinaryArrayWriter();
      writer.writeUint8(boughtCount);
      for (const id in this.boughtAreas) {
        writer.writeUint8(this.factory.getMeta().areasById[id].idNum);
      }
      return writer;
    }
  
    importFromReader(reader) {
      if (!reader.getLength()) return;
      this.boughtAreas = {};
      const n = reader.readUint8();
      for (let i = 0; i < n; i++) {
        const idNum = reader.readUint8();
        const areaMeta = this.factory.getMeta().areasByIdNum[idNum];
        this.setAreaBought(areaMeta.id, true);
      }
    }
  }
  