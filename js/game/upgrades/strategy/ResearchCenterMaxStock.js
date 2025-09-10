import AbstractUpgrade from "./AbstractUpgrade.js";

export default class ResearchCenterMaxStock extends AbstractUpgrade {
  constructor(meta, amount, factory) {
    super();
    this.meta = meta;
    this.amount = amount;
    this.factory = factory;
  }

  updateMap(bonusMap) {
    bonusMap.byComponent[this.meta.componentId].maxStorageBonus += this.getTotalMultiplier();
  }

  getTitle() {
    return "Max stock size";
  }

  getDescription() {
    const component = this.factory.getGame().getMeta().componentsById[this.meta.componentId];
    const multiplier = this.getMultiplierStrings();
    return `<b>${component.name}</b> max stock increased by <b class="green">${multiplier.next}</b><br /><br /> <b>Current total increase: </b><b class="green">${multiplier.total}</b>`;
  }
}
