import ResourceIntake from "./helper/ResourceIntake.js";
import DelayedAction from "./helper/DelayedAction.js";

export default class Seller {
  constructor(component, meta) {
    this.component = component;
    this.meta = meta;
    this.game = this.component.getFactory().getGame();
    this.inResourcesManager = new ResourceIntake(component, meta.resources);
    this.producer = new DelayedAction(meta.interval);
    this.producer.canStart = this.canStartSaleProcess.bind(this);
    this.producer.start = this.startSale.bind(this);
    this.producer.finished = this.finishSale.bind(this);
  }

  clearContents() {
    this.inResourcesManager.reset();
    this.producer.reset();
  }

  getSellAmount(resource) {
    return Seller.getMetaSellAmount(this.component.getMeta(), resource, this.component.getFactory());
  }

  static getMetaSellAmount(meta, resource, factory) {
    return meta.strategy.resources[resource].amount * factory.getUpgradesManager().getComponentBonuses(meta.id).sellAmountBonus;
  }

  getSellPrice(resource) {
    return Seller.getMetaSellPrice(this.component.getMeta(), resource, this.component.getFactory());
  }

  static getMetaSellPrice(meta, resource, factory) {
    const r = meta.strategy.resources[resource];
    return r.sellPrice * (1 + r.sellMargin) *
      factory.getUpgradesManager().getComponentBonuses(meta.id).sellPriceBonus *
      factory.getGame().getProfitMultiplier();
  }

  canStartSaleProcess() {
    for (const r in this.meta.resources) {
      if (!this.meta.resources[r].bonus && this.inResourcesManager.getResource(r) < this.getSellAmount(r)) return false;
    }
    return true;
  }

  startSale() {}

  finishSale(saleData) {
    for (const r in this.meta.resources) {
      const amt = this.getSellAmount(r);
      if (this.inResourcesManager.getResource(r) >= amt) {
        this.inResourcesManager.addResource(r, -amt);
        saleData.resourceSales += amt * this.getSellPrice(r);
      }
    }
  }

  calculateInputTick(e) {
    this.inResourcesManager.takeIn();
    this.producer.calculate(e);
  }

  toString() {
    return [this.inResourcesManager.toString(), this.producer.toString()].join("<br />");
  }

  exportToWriter(writer) {
    this.inResourcesManager.exportToWriter(writer);
    this.producer.exportToWriter(writer);
  }

  importFromReader(reader) {
    this.inResourcesManager.importFromReader(reader);
    this.producer.importFromReader(reader);
  }
}
