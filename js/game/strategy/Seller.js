// game/strategy/Seller.js
import ResourceIntake from "./helper/ResourceIntake.js";
import DelayedAction from "./helper/DelayedAction.js";
import numberFormat from "/js/base/NumberFormat.js";
import { arrayToHumanStr } from "/js/utils/arrayHelpers.js";
import { lcFirst } from "/js/utils/stringHelpers.js";

export default class Seller {
  constructor(component, meta) {
    this.component = component;
    this.meta = meta;
    this.game = component.getFactory().getGame();

    this.inResourcesManager = new ResourceIntake(component, meta.resources);
    this.producer = new DelayedAction(meta.interval);

    // Bind hooks
    this.producer.canStart = this.canStartSaleProcess.bind(this);
    this.producer.start = this.startSale.bind(this);
    this.producer.finished = this.finishSale.bind(this);
  }

  clearContents() {
    this.inResourcesManager.reset();
    this.producer.reset();
  }

  static getMetaSellAmount(meta, resourceId, factory) {
    const baseAmount = meta.strategy.resources[resourceId].amount;
    const bonus = factory.getUpgradesManager().getComponentBonuses(meta.id).sellAmountBonus;
    return baseAmount * bonus;
  }

  getSellAmount(resourceId) {
    return Seller.getMetaSellAmount(this.component.getMeta(), resourceId, this.component.getFactory());
  }

  static getMetaSellPrice(meta, resourceId, factory) {
    const resource = meta.strategy.resources[resourceId];
    const basePrice = resource.sellPrice * (1 + resource.sellMargin);
    const bonus = factory.getUpgradesManager().getComponentBonuses(meta.id).sellPriceBonus;
    return basePrice * bonus * factory.getGame().getProfitMultiplier();
  }

  getSellPrice(resourceId) {
    return Seller.getMetaSellPrice(this.component.getMeta(), resourceId, this.component.getFactory());
  }

  static getMetaDescriptionData(meta, factory) {
    const strategy = meta.strategy;
    const sellItems = [];
    const bonusItems = [];
    let totalSellValue = 0;

    const resourcesById = factory.getGame().getMeta().resourcesById;

    for (const resourceId in strategy.resources) {
      const resource = strategy.resources[resourceId];
      const amount = Seller.getMetaSellAmount(meta, resourceId, factory);
      const value = amount * Seller.getMetaSellPrice(meta, resourceId, factory);
      let canSell = true;

      if (resource.requiresResearch) {
        canSell = factory.getGame().getResearchManager().getResearch(resource.requiresResearch) > 0;
      }

      if (resource.bonus) {
        if (canSell) {
          bonusItems.push(
            `<span class='${resourceId}'><b>${amount}</b> ${lcFirst(resourcesById[resourceId].name)}</span> adds <b class='money'>$${numberFormat.formatNumber(value)}</b>`
          );
        }
      } else {
        totalSellValue += value;
        sellItems.push(`<span class='${resourceId}'><b>${amount}</b> ${lcFirst(resourcesById[resourceId].name)}</span>`);
      }
    }

    const sellerType = strategy.sellerType || "military";
    let adjustedSellValue = totalSellValue;
    if (sellerType === "local") adjustedSellValue = totalSellValue * 0.3;
    else if (sellerType === "export") adjustedSellValue = 0;

    const result = {
      isSeller: true,
      sellerType,
      interval: strategy.interval,
      sellPrice: numberFormat.formatNumber(adjustedSellValue),
      sellStr: arrayToHumanStr(sellItems),
      bonusStr: bonusItems.join(", ")
    };

    // if (sellerType === "military") {
    //   result.unrestInfo = `<span class='unrest'>+${strategy.unrestPerSale || 0} unrest</span>`;
    // } else if (sellerType === "local") {
    //   result.unrestInfo = `<span class='unrest'>${strategy.unrestPerSale || 0} unrest</span>`;
    // } else if (sellerType === "export") {
    //   result.influenceInfo = `<span class='influence'>+${strategy.influencePerSale || 0} influence</span>`;
    // }

    return result;
  }

  getDescriptionData() {
    const data = Seller.getMetaDescriptionData(this.component.getMeta(), this.component.getFactory());
    this.producer.updateWithDescriptionData(data);
    this.inResourcesManager.updateWithDescriptionData(data);
    return data;
  }

  calculateInputTick(e) {
    this.inResourcesManager.takeIn();
    if (!this.component.isPaused()) {
      this.producer.calculate(e);
    }
  }

  canStartSaleProcess() {
    for (const resourceId in this.meta.resources) {
      const resource = this.meta.resources[resourceId];
      if (!resource.bonus && this.inResourcesManager.getResource(resourceId) < this.getSellAmount(resourceId)) {
        return false;
      }
    }
    return true;
  }

  startSale(e) {
    // Placeholder for custom start logic
  }

  finishSale(e) {
    if (this.component.isPaused()) return;
    const sellerType = this.meta.sellerType || "military";

    for (const resourceId in this.meta.resources) {
      const amountToSell = this.getSellAmount(resourceId);
      if (this.inResourcesManager.getResource(resourceId) >= amountToSell) {
        this.inResourcesManager.addResource(resourceId, -amountToSell);
        const saleValue = amountToSell * this.getSellPrice(resourceId);

        if (sellerType === "military") {
          e.resourceSales += saleValue;
        } else if (sellerType === "local") {
          e.resourceSales += saleValue * 0.3;
        }
        // Export sellers earn no credits — they earn influence instead
      }
    }

    if (sellerType === "military" || sellerType === "local") {
      e.unrestChange = (e.unrestChange || 0) + (this.meta.unrestPerSale || 0);
    }
    if (sellerType === "export") {
      e.influenceChange = (e.influenceChange || 0) + (this.meta.influencePerSale || 0);
    }
  }

  toString() {
    return `${this.inResourcesManager.toString()}<br />${this.producer.toString()}<br />`;
  }

  exportToWriter(writer) {
    this.inResourcesManager.exportToWriter(writer);
    this.producer.exportToWriter(writer);
  }

  importFromReader(reader, version) {
    this.inResourcesManager.importFromReader(reader, version);
    this.producer.importFromReader(reader, version);
  }
}
