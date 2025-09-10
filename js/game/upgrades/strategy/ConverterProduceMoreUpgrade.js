import AbstractUpgrade from "./AbstractUpgrade.js";

export default class ConverterProduceMoreUpgrade extends AbstractUpgrade {
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
    component.convertProduceMoreBonus += t;
    component.maxStorageBonus += t;
  }

  getTitle() {
    return "Amount of resources produced";
  }

  getDescription() {
    const component = this.factory.getGame().getMeta().componentsById[this.meta.componentId];
    const multiplier = this.getMultiplierStrings();
    return `<b>${component.name}</b> produces <b class="green">${multiplier.next}</b> more resources.<br />` +
      (this.meta.noRunningCost ? "" : `Increases running cost by <b class="red">${multiplier.next}</b><br />`) +
      `<br />More production per component with less raw materials, but expenses are proportionally the same. More production per component => more resources to sell.<br /><br /><b>Current total increase: </b><b class="green">${multiplier.total}</b>`;
  }
}
