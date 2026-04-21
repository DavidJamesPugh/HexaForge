// game/Game.js
import Factory from "./Factory.js";
import ResearchManager from "./ResearchManager.js";
import AchievementsManager from "./AchievementsManager.js";
import Calculator from "./calculator/Calculator.js";
import Statistics from "./statistics/Statistics.js";
import Ticker from "./Ticker.js";
import GameEvent from "../config/event/GameEvent.js";
import GameContext from "../base/GameContext.js";
import BinaryArrayWriter from "../base/BinaryArrayWriter.js";

export default class Game {
  constructor(meta, confirmedTimestamp, isDevMode = false) {
    
    this.meta = meta;
    this.confirmedTimestamp = confirmedTimestamp;

    this.money = meta.startingMoney;
    this.researchPoints = meta.startingResearchPoints;
    this.unrest = meta.startingUnrest;
    this.influence = meta.startingInfluence;

    this.em = GameContext.gameUiBus;
    this.factories = {};
    this.isDevMode = isDevMode;
    /** Factory map tile coordinate overlay (MainUi dev toggle); default off at start. */
    this.showTileCoords = false;

    for (const key in meta.factories) {
      const f = meta.factories[key];
      this.factories[f.id] = new Factory(f, this);
    }

    this.researchManager = new ResearchManager(this);
    this.achievementsManager = new AchievementsManager(this);
    this.calculator = new Calculator(this);
    this.statistics = new Statistics(this);
    this.ticker = new Ticker(this, confirmedTimestamp);

    this.profitMultiplier = 1;
    this.researchProductionMultiplier = 1;
    this.isPremium = false;
  }

  init() {
    this.calculator.init();
    this.statistics.init();
    this.ticker.init();
    return this;
  }

  destroy() {
    this.calculator.destroy();
    this.statistics.destroy();
    this.ticker.destroy();
  }

  getMeta() { return this.meta; }
  getEventManager() { return this.em; }
  getResearchManager() { return this.researchManager; }
  getAchievementsManager() { return this.achievementsManager; }
  getCalculator() { return this.calculator; }
  getStatistics() { return this.statistics; }
  getTicker() { return this.ticker; }
  getFactory(id) { return this.factories[id]; }

  setProfitMultiplier(val) { this.profitMultiplier = val; }
  getProfitMultiplier() { return this.profitMultiplier; }

  setResearchProductionMultiplier(val) { this.researchProductionMultiplier = val; }
  getResearchProductionMultiplier() { return this.researchProductionMultiplier; }

  setIsPremium(val) { this.isPremium = val; }
  getIsPremium() { return this.isPremium || this.isDevMode; }

  getMoney() { return this.money; }
  setMoney(val) {
    val = isNaN(Number(val)) ? 0 : val;
    if (val < this.meta.minNegativeMoney) val = this.meta.minNegativeMoney;
    this.money = val;
    this.em.invokeEvent(GameEvent.MONEY_UPDATED, this.money);
  }
  addMoney(val) { this.setMoney(this.money + (isNaN(Number(val)) ? 0 : val)); }

  getResearchPoints() { return this.researchPoints; }
  setResearchPoints(val) {
    val = isNaN(Number(val)) ? 0 : val;
    this.researchPoints = val;
    this.em.invokeEvent(GameEvent.RESEARCH_POINTS_UPDATED, this.researchPoints);
  }
  addResearchPoints(val) { this.setResearchPoints(this.researchPoints + (isNaN(Number(val)) ? 0 : val)); }

  getUnrest() { return this.unrest; }
  setUnrest(val) {
    val = isNaN(Number(val)) ? 0 : val;
    if (val < 0) val = 0;
    this.unrest = val;
    this.em.invokeEvent(GameEvent.UNREST_UPDATED, this.unrest);
  }
  addUnrest(val) { this.setUnrest(this.unrest + (isNaN(Number(val)) ? 0 : val)); }
  isUnrestCritical() { return this.unrest >= this.meta.maxUnrest; }

  getInfluence() { return this.influence; }
  setInfluence(val) {
    val = isNaN(Number(val)) ? 0 : val;
    if (val < 0) val = 0;
    this.influence = val;
    this.em.invokeEvent(GameEvent.INFLUENCE_UPDATED, this.influence);
  }
  addInfluence(val) { this.setInfluence(this.influence + (isNaN(Number(val)) ? 0 : val)); }

  exportToWriter() {
    const writer = new BinaryArrayWriter();
    
    writer.writeUint16(10);
    writer.writeFloat64(this.money);
    writer.writeFloat64(this.researchPoints);
    writer.writeInt8(this.isPremium ? 1 : 0);
    writer.writeFloat64(this.unrest);
    writer.writeFloat64(this.influence);

    writer.writeWriter(this.researchManager.exportToWriter());
    writer.writeWriter(this.achievementsManager.exportToWriter());
    writer.writeWriter(this.statistics.exportToWriter());
    writer.writeWriter(this.ticker.exportToWriter());

    writer.writeUint8(this.meta.factories.length);
    for (const key in this.factories) {
      const factory = this.factories[key];
      writer.writeUint8(factory.getMeta().idNum);
      writer.writeWriter(factory.exportToWriter());

    }
    
    return writer;
  }

  importFromReader(reader) {
    
    const version = reader.readUint16();
    this.setMoney(reader.readFloat64());
    this.setResearchPoints(reader.readFloat64());
    if (version >= 7) this.setIsPremium(!!reader.readInt8());
    else this.setIsPremium(this.isPremium);
    if (version >= 8) {
      this.setUnrest(reader.readFloat64());
      this.setInfluence(reader.readFloat64());
    }
    

    this.researchManager.importFromReader(reader.readReader(), version);
    this.achievementsManager.importFromReader(reader.readReader(), version);
    this.statistics.importFromReader(reader.readReader(), version);
    this.ticker.importFromReader(reader.readReader(), version);

    const factoriesCount = reader.readUint8();
    for (let i = 0; i < factoriesCount; i++) {
      const factoryMeta = this.meta.factoriesByIdNum[reader.readUint8()];
      const factoryReader = reader.readReader();
      if (!factoryMeta) {
        console.warn("Game.import: Missing factoryMeta for index", i);
      }
      if (factoryMeta) this.factories[factoryMeta.id].importFromReader(factoryReader, version);
    }

    this.statistics.reset();
  }
}
