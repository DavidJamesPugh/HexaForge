import AbstractUpgrade from "./AbstractUpgrade.js";

export default class SellerSellAmountUpgrade extends AbstractUpgrade {
  constructor(meta, amount, factory) {
    super();
    this.meta = meta;
    this.amount = amount;
    this.factory = factory;
  }

  updateMap(bonusMap) {
    const t = this.getTotalMultiplier();
    const component = bonusMap.byComponent[this.meta.componentId];
    component.runningCostPerTickIncrease += t;
    component.sellAmountBonus += t;
    component.maxStorageBonus += t;
  }

  getTitle() {
    return "Amount of resources sold";
  }

  getDescription() {
    const component = this.factory.getGame().getMeta().componentsById[this.meta.componentId];
    const multiplier = this.getMultiplierStrings();
    return `<b>${component.name}</b> sells <b class="green">${multiplier.next}</b> more resources.<br />` +
      (this.meta.noRunningCost ? "" : `Increases running cost by <b class="red">${multiplier.next}</b><br />`) +
      `<br />More resources sold per tick in average => more money<br /><br /><b>Current total increase: </b><b class="green">${multiplier.total}</b>`;
  }
}
