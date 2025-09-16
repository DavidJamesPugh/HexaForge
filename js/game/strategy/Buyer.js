import ResourceOutput from "./helper/ResourceOutput.js";
import DelayedAction from "./helper/DelayedAction.js";
import { lcFirst } from "/js/utils/stringHelpers.js";
import numberFormat from "/js/base/NumberFormat.js";
import { arrayToHumanStr } from "/js/utils/arrayHelpers.js";

export default class Buyer {
  constructor(component, meta) {
    this.component = component;
    this.game = this.component.getFactory().getGame();
    this.meta = meta;

    this.outResourcesManager = new ResourceOutput(component, meta.purchaseResources, meta.outputResourcesOrder);

    this.producer = new DelayedAction(meta.interval);
    this.producer.canStart = this.canBuy.bind(this);
    this.producer.start = this.preparePurchase.bind(this);
    this.producer.finished = this.finishPurchase.bind(this);
  }

  // Static helpers for meta calculations
  static getMetaBuyPrice(meta, resourceId, factory) {
    return meta.strategy.purchaseResources[resourceId].price * factory.getGame().getProfitMultiplier();
  }

  static getMetaBuyAmount(meta, resourceId, factory) {
    const bonuses = factory.getUpgradesManager().getComponentBonuses(meta.id);
    return meta.strategy.purchaseResources[resourceId].amount * bonuses.buyAmountBonus;
  }

  static getMetaDescriptionData(meta, factory, buyerInstance) {
    const strategy = meta.strategy;
    const resourcesMeta = factory.getGame().getMeta().resourcesById;

    let buyStrings = [];
    let totalCost = 0;
    let maxAmount = 0;

    for (const resId in strategy.purchaseResources) {
      const amount = Buyer.getMetaBuyAmount(meta, resId, factory);
      const price = Buyer.getMetaBuyPrice(meta, resId, factory);
      totalCost += amount * price;
      buyStrings.push(`<span class='${resId}'><b>${amount}</b> ${lcFirst(resourcesMeta[resId].name)}</span>`);
      maxAmount = Math.max(maxAmount, amount);
    }

    return {
      interval: strategy.interval,
      purchasePrice: numberFormat.formatNumber(totalCost),
      buyStr: arrayToHumanStr(buyStrings),
      noOfOutputs: Math.ceil(maxAmount / strategy.interval / ResourceOutput.getMetaOutputAmount(meta, factory)),
    };
  }

  // Instance helpers
  getBuyPrice(resId) {
    return Buyer.getMetaBuyPrice(this.component.getMeta(), resId, this.component.getFactory());
  }

  getBuyAmount(resId) {
    return Buyer.getMetaBuyAmount(this.component.getMeta(), resId, this.component.getFactory());
  }

  getDescriptionData() {
    const desc = Buyer.getMetaDescriptionData(this.component.getMeta(), this.component.getFactory(), this);
    this.producer.updateWithDescriptionData(desc);
    this.outResourcesManager.updateWithDescriptionData(desc);
    return desc;
  }

  clearContents() {
    this.outResourcesManager.reset();
    this.producer.reset();
  }

  calculateOutputTick(state) {
    this.producer.calculate(state);
    this.outResourcesManager.distribute();
  }

  calculatePurchasePrice() {
    let total = 0;
    for (const resId in this.meta.purchaseResources) {
      total += this.getBuyAmount(resId) * this.getBuyPrice(resId);
    }
    return total;
  }

  canBuy() {
    for (const resId in this.meta.purchaseResources) {
      if (this.outResourcesManager.getResource(resId) + this.getBuyAmount(resId) > this.outResourcesManager.getMax(resId)) {
        return false;
      }
    }
    return true;
  }

  preparePurchase(state) {
    state.resourceCosts += this.calculatePurchasePrice();
  }

  finishPurchase(state) {
    for (const resId in this.meta.purchaseResources) {
      this.outResourcesManager.addResource(resId, this.getBuyAmount(resId));
    }
  }

  toString() {
    return `${this.outResourcesManager.toString()}<br />${this.producer.toString()}<br />`;
  }

  exportToWriter(writer) {
    this.outResourcesManager.exportToWriter(writer);
    this.producer.exportToWriter(writer);
  }

  importFromReader(reader) {
    this.outResourcesManager.importFromReader(reader);
    this.producer.importFromReader(reader);
  }
}
