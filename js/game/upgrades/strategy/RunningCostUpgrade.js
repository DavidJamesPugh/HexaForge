import AbstractUpgrade from "./AbstractUpgrade.js";

export default class RunningCostUpgrade extends AbstractUpgrade {
  constructor(meta, amount, factory) {
    super();
    this.meta = meta;
    this.amount = amount;
    this.factory = factory;
  }

  updateMap(bonusMap) {
    bonusMap.byComponent[this.meta.componentId].runningCostPerTickBonus -= this.getTotalMultiplier();
  }

  getTitle() {
    return "Reduce running costs";
  }

  getDescription() {
    const component = this.factory.getGame().getMeta().componentsById[this.meta.componentId];
    const multiplier = this.getMultiplierStrings(true);
    return `<b>${component.name}</b> running costs are reduced by <b class="green">${multiplier.next}</b><br /><br /><b>Current total decrease: </b><b class="green">${multiplier.total}</b>`;
  }
}
