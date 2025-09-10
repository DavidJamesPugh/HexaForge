import AbstractUpgrade from "./AbstractUpgrade.js";

export default class ResearchCenterBonusUpgrade extends AbstractUpgrade {
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
    component.researchPaperBonus += t;
  }

  getTitle() {
    return "Research paper bonus";
  }

  getDescription() {
    const component = this.factory.getGame().getMeta().componentsById[this.meta.componentId];
    const multiplier = this.getMultiplierStrings();
    return `<b>${component.name}</b> research paper bonus increased by <b class="green">${multiplier.next}</b><br /><br /><b>Current total increase: </b><b class="green">${multiplier.total}</b>`;
  }
}
