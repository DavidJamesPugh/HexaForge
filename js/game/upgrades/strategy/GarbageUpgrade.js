import AbstractUpgrade from "./AbstractUpgrade.js";

export default class GarbageUpgrade extends AbstractUpgrade {
  constructor(meta, amount, factory) {
    super();
    this.meta = meta;
    this.amount = amount;
    this.factory = factory;
  }

  updateMap(bonusMap) {
    const t = this.getTotalMultiplier();
    const component = bonusMap.byComponent[this.meta.componentId];
    component.removeAmountBonus += t;
    component.maxStorageBonus += t;
  }

  getTitle() {
    return "Amount of resources removed";
  }

  getDescription() {
    const component = this.factory.getGame().getMeta().componentsById[this.meta.componentId];
    const multiplier = this.getMultiplierStrings();
    return `${component.name} removes ${multiplier.next} more items<br /><br /><b>Current total bonus: </b><b class="green">${multiplier.total}</b>`;
  }
}
