import AbstractUpgrade from "./AbstractUpgrade.js";

export default class SellerSellPriceUpgrade extends AbstractUpgrade {
  constructor(meta, amount, factory) {
    super();
    this.meta = meta;
    this.amount = amount;
    this.factory = factory;
  }

  updateMap(bonusMap) {
    bonusMap.byComponent[this.meta.componentId].sellPriceBonus += this.getTotalMultiplier();
  }

  getTitle() {
    return "Resources sale price";
  }

  getDescription() {
    const component = this.factory.getGame().getMeta().componentsById[this.meta.componentId];
    const multiplier = this.getMultiplierStrings();
    return `<b>${component.name}</b> sells with <b class="green">${multiplier.next}</b> higher price. <br /><br /><b>Current total increase: </b><b class="green">${multiplier.total}</b>`;
  }
}
