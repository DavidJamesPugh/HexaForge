import UpgradesFactory from "./upgrades/Factory.js";
import BinaryArrayWriter from "/js/base/BinaryArrayWriter.js";
import FactoryEvent from "../config/event/FactoryEvent.js";

export default class UpgradesManager {
  constructor(factory) {
    this.factory = factory;
    this.game = factory.getGame();
    this.upgrades = {};
    this.isChanged = true;
  }

  buildMap() {
    const map = { packageSizeBonus: 0, byComponent: {} };

    for (const id in this.game.getMeta().componentsById) {
      map.byComponent[id] = {
        runningCostPerTickIncrease: 1,
        runningCostPerTickBonus: 1,
        buyAmountBonus: 1,
        maxStorageBonus: 1,
        packageSizeBonus: 0,
        convertAmountBonus: 1,
        convertProduceMoreBonus: 1,
        removeAmountBonus: 1,
        researchPaperBonus: 1,
        sellAmountBonus: 1,
        sellPriceBonus: 1,
      };
    }

    const upgradesMeta = this.game.getMeta().upgrades;
    for (const id in upgradesMeta) {
      this.getStrategy(upgradesMeta[id].id).updateMap(map);
    }

    return map;
  }

  getBonuses() {
    if (this.isChanged) {
      this.bonuses = this.buildMap();
      this.isChanged = false;
    }
    return this.bonuses;
  }

  getComponentBonuses(componentId) {
    return this.getBonuses().byComponent[componentId];
  }

  setUpgrade(id, level) {
    this.upgrades[id] = level;
    this.isChanged = true;
  }

  addUpgrade(id, amount) {
    this.setUpgrade(id, this.getUpgrade(id) + amount);
    this.factory.getEventManager().invokeEvent(FactoryEvent.UPGRADES_UPDATED, id);
    this.factory.getEventManager().invokeEvent(FactoryEvent.REFRESH_COMPONENT_INFO);
  }

  getUpgrade(id) {
    return this.upgrades[id] || 0;
  }

  getStrategy(upgradeId) {
    const meta = this.game.getMeta().upgradesById[upgradeId];
    return UpgradesFactory.getStrategy(meta, this.getUpgrade(upgradeId), this.factory);
  }

  getPrice(upgradeId, level = this.getUpgrade(upgradeId)) {
    const meta = this.game.getMeta().upgradesById[upgradeId];
    return meta.levels[level]?.price ?? 0;
  }

  getSellPrice(upgradeId) {
    const meta = this.game.getMeta().upgradesById[upgradeId];
    return this.getUpgrade(upgradeId) <= 0 ? 0 : this.getPrice(upgradeId, this.getUpgrade(upgradeId) - 1) * meta.refund;
  }

  canPurchase(upgradeId) {
    return this.couldPurchase(upgradeId) && this.game.getMoney() >= this.getPrice(upgradeId) && this.isVisible(upgradeId);
  }

  couldPurchase(upgradeId) {
    const meta = this.game.getMeta().upgradesById[upgradeId];
    return this.getUpgrade(upgradeId) < meta.levels.length;
  }

  isVisible(upgradeId) {
    const meta = this.game.getMeta().upgradesById[upgradeId];
    return !meta.requiresResearch || this.game.getResearchManager().getResearch(meta.requiresResearch) > 0;
  }

  canSell(upgradeId) {
    const meta = this.game.getMeta().upgradesById[upgradeId];
    return this.getUpgrade(upgradeId) > 0 && meta.refund != null && this.isVisible(upgradeId);
  }

  exportToWriter() {
    const n = Object.keys(this.upgrades).filter(id => this.upgrades[id] > 0).length;
    const writer = new BinaryArrayWriter();
    writer.writeUint16(n);
    for (const id in this.upgrades) {
      const level = this.upgrades[id];
      if (level > 0) {
        writer.writeUint16(this.game.getMeta().upgradesById[id].idNum);
        writer.writeUint16(level);
      }
    }
    return writer;
  }

  importFromReader(reader) {
    if (!reader.getLength()) return;
    this.upgrades = {};
    const n = reader.readUint16();
    for (let i = 0; i < n; i++) {
      const idNum = reader.readUint16();
      const level = reader.readUint16();
      const meta = this.game.getMeta().upgradesByIdNum[idNum];
      if (meta) this.upgrades[meta.id] = level;
    }
    this.isChanged = true;
  }
}
