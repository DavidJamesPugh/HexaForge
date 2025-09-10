import AbstractUpgrade from "./AbstractUpgrade.js";

export default class PackageSize extends AbstractUpgrade {
  constructor(meta, amount, factory) {
    super();
    this.meta = meta;
    this.amount = amount;
    this.factory = factory;
  }

  updateMap(bonusMap) {
    const t = this.getTotalMultiplier();
    if (this.meta.componentId) {
      bonusMap.byComponent[this.meta.componentId].packageSizeBonus += t;
    } else {
      bonusMap.packageSizeBonus += t;
    }
  }

  getTitle() {
    return "Package size";
  }

  getDescription() {
    let component = null;
    if (this.meta.componentId) {
      component = this.factory.getGame().getMeta().componentsById[this.meta.componentId];
    }
    const multiplier = this.getMultiplierStrings();
    return `<b>${component ? component.name + " outputs" : "All components output"}</b> <span class="green">${multiplier.next}</span> more resources into single package.<br /><br />Makes conveyors much more effective, as they transport more resources.<br /><br /><b>Current total bonus: </b><b class="green">${multiplier.total}</b>`;
  }
}
