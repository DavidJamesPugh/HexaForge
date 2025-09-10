import ResourceIntake from "./helper/ResourceIntake.js";
import ResourceOutput from "./helper/ResourceOutput.js";
import DelayedAction from "./helper/DelayedAction.js";

export default class Converter {
  constructor(component, meta) {
    this.component = component;
    this.meta = meta;
    this.inResourcesManager = new ResourceIntake(component, meta.inputResources, meta.production);
    this.outResourcesManager = new ResourceOutput(component, meta.production, meta.outputResourcesOrder);
    this.producer = new DelayedAction(meta.interval);
    this.producer.canStart = this.canStartProduction.bind(this);
    this.producer.start = this.startProduction.bind(this);
    this.producer.finished = this.finishedProduction.bind(this);
  }

  clearContents() {
    this.inResourcesManager.reset();
    this.outResourcesManager.reset();
    this.producer.reset();
  }

  static getMetaUseAmount(meta, resource, factory) {
    return meta.strategy.inputResources[resource].perOutputResource *
      factory.getUpgradesManager().getComponentBonuses(meta.id).convertAmountBonus;
  }

  getUseAmount(resource) {
    return Converter.getMetaUseAmount(this.component.getMeta(), resource, this.component.getFactory());
  }

  static getMetaProduceAmount(meta, resource, factory) {
    const bonuses = factory.getUpgradesManager().getComponentBonuses(meta.id);
    return meta.strategy.production[resource].amount * bonuses.convertAmountBonus * bonuses.convertProduceMoreBonus;
  }

  getProduceAmount(resource) {
    return Converter.getMetaProduceAmount(this.component.getMeta(), resource, this.component.getFactory());
  }

  static isProducing(game, meta, resource) {
    const removeResearch = meta.productionRemoveResearch;
    return !removeResearch || !removeResearch[resource] || !game.getResearchManager().getResearch(removeResearch[resource]);
  }

  getDescriptionData() {
    const data = Converter.getMetaDescriptionData(this.component.getMeta(), this.component.getFactory(), this);
    this.producer.updateWithDescriptionData(data);
    this.inResourcesManager.updateWithDescriptionData(data);
    this.outResourcesManager.updateWithDescriptionData(data);
    return data;
  }

  calculateInputTick() {
    this.inResourcesManager.takeIn();
  }

  calculateOutputTick() {
    this.producer.calculate();
    this.outResourcesManager.distribute();
  }

  canStartProduction() {
    for (const r in this.meta.inputResources)
      if (this.inResourcesManager.getResource(r) < this.getUseAmount(r)) return false;

    for (const r in this.meta.production)
      if (this.outResourcesManager.getResource(r) + this.getProduceAmount(r) > this.outResourcesManager.getMax(r)) return false;

    return true;
  }

  startProduction() {
    for (const r in this.meta.inputResources)
      this.inResourcesManager.addResource(r, -this.getUseAmount(r));
  }

  finishedProduction() {
    for (const r in this.meta.production)
      if (Converter.isProducing(this.component.getFactory().getGame(), this.meta, r))
        this.outResourcesManager.addResource(r, this.getProduceAmount(r));
  }

  toString() {
    return [
      this.inResourcesManager.toString(),
      this.outResourcesManager.toString(),
      this.producer.toString()
    ].join("<br />");
  }

  exportToWriter(writer) {
    this.outResourcesManager.exportToWriter(writer);
    this.inResourcesManager.exportToWriter(writer);
    this.producer.exportToWriter(writer);
  }

  importFromReader(reader) {
    this.outResourcesManager.importFromReader(reader);
    this.inResourcesManager.importFromReader(reader);
    this.producer.importFromReader(reader);
  }
}
