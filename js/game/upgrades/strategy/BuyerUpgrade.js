import AbstractUpgrade from "./AbstractUpgrade.js";

export default class BuyerUpgrade extends AbstractUpgrade {
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
    component.buyAmountBonus += t;
    component.maxStorageBonus += t;
  }

  getTitle() {
    return "Amount of resources component buys";
  }

  getDescription() {
    const component = this.factory.getGame().getMeta().componentsById[this.meta.componentId];
    const multiplier = this.getMultiplierStrings();
    return `<b>${component.name}</b> buys <span class="green">${multiplier.next}</span> more resources.<br />` +
      (this.meta.noRunningCost ? "" : `Increases running cost by <b class="red">${multiplier.next}</b><br />`) +
      `<br />More production per component, but expenses are proportionally the same. More production per component => more resources to sell.<br /><br /><b>Current total buy resources bonus: </b><b class="green">${multiplier.total}</b>`;
  }
}
