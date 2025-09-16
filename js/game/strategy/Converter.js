// game/strategy/Converter.js
import ResourceIntake from "./helper/ResourceIntake.js";
import ResourceOutput from "./helper/ResourceOutput.js";
import DelayedAction from "./helper/DelayedAction.js";
import { arrayToHumanStr } from "/js/utils/arrayHelpers.js";
import { lcFirst } from "/js/utils/stringHelpers.js";

export default class Converter {
  constructor(component, meta) {
    this.component = component;
    this.meta = meta;

    this.inResourcesManager = new ResourceIntake(component, meta.inputResources, meta.production);
    this.outResourcesManager = new ResourceOutput(component, meta.production, meta.outputResourcesOrder);
    this.producer = new DelayedAction(meta.interval);

    // Bind hooks
    this.producer.canStart = this.canStartProduction.bind(this);
    this.producer.start = this.startProduction.bind(this);
    this.producer.finished = this.finishedProduction.bind(this);
  }

  clearContents() {
    this.inResourcesManager.reset();
    this.outResourcesManager.reset();
    this.producer.reset();
  }

  static getMetaUseAmount(meta, resourceId, factory) {
    const baseAmount = meta.strategy.inputResources[resourceId].perOutputResource;
    const bonus = factory.getUpgradesManager().getComponentBonuses(meta.id).convertAmountBonus;
    return baseAmount * bonus;
  }

  getUseAmount(resourceId) {
    return Converter.getMetaUseAmount(this.component.getMeta(), resourceId, this.component.getFactory());
  }

  static getMetaProduceAmount(meta, resourceId, factory) {
    const strategy = meta.strategy.production[resourceId];
    const bonuses = factory.getUpgradesManager().getComponentBonuses(meta.id);
    return strategy.amount * bonuses.convertAmountBonus * bonuses.convertProduceMoreBonus;
  }

  getProduceAmount(resourceId) {
    return Converter.getMetaProduceAmount(this.component.getMeta(), resourceId, this.component.getFactory());
  }

  static isProducing(game, strategy, resourceId) {
    return !strategy.productionRemoveResearch || !strategy.productionRemoveResearch[resourceId] ||
           !game.getResearchManager().getResearch(strategy.productionRemoveResearch[resourceId]);
  }

  static getMetaDescriptionData(meta, factory, converterInstance) {
    const strategy = meta.strategy;
    const resourcesById = factory.getGame().getMeta().resourcesById;

    const inputStr = Object.keys(strategy.inputResources).map(resourceId =>
      `<span class='${resourceId}'><b>${Converter.getMetaUseAmount(meta, resourceId, factory)}</b> ${lcFirst(resourcesById[resourceId].name)}</span>`
    );

    let maxOutput = 0;
    const outputStr = Object.keys(strategy.production)
      .filter(resourceId => Converter.isProducing(factory.getGame(), strategy, resourceId))
      .map(resourceId => {
        const amount = Converter.getMetaProduceAmount(meta, resourceId, factory);
        maxOutput = Math.max(maxOutput, amount);
        return `<span class='${resourceId}'><b>${amount}</b> ${lcFirst(resourcesById[resourceId].name)}</span>`;
      });

    const storageStr = []; // Placeholder if you want to include storage info

    return {
      interval: strategy.interval,
      inputStr: arrayToHumanStr(inputStr),
      outputStr: arrayToHumanStr(outputStr),
      storageStr: arrayToHumanStr(storageStr),
      noOfOutputs: Math.ceil(maxOutput / strategy.interval / ResourceOutput.getMetaOutputAmount(meta, factory))
    };
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
    // Check input resources
    for (const resourceId in this.meta.inputResources) {
      if (this.inResourcesManager.getResource(resourceId) < this.getUseAmount(resourceId)) return false;
    }
    // Check output storage limits
    for (const resourceId in this.meta.production) {
      if (this.outResourcesManager.getResource(resourceId) + this.getProduceAmount(resourceId) > this.outResourcesManager.getMax(resourceId)) return false;
    }
    return true;
  }

  startProduction() {
    for (const resourceId in this.meta.inputResources) {
      this.inResourcesManager.addResource(resourceId, -this.getUseAmount(resourceId));
    }
  }

  finishedProduction() {
    for (const resourceId in this.meta.production) {
      if (Converter.isProducing(this.component.getFactory().getGame(), this.meta, resourceId)) {
        this.outResourcesManager.addResource(resourceId, this.getProduceAmount(resourceId));
      }
    }
  }

  toString() {
    return `${this.inResourcesManager.toString()}<br />${this.outResourcesManager.toString()}<br />${this.producer.toString()}<br />`;
  }

  exportToWriter(writer) {
    this.outResourcesManager.exportToWriter(writer);
    this.inResourcesManager.exportToWriter(writer);
    this.producer.exportToWriter(writer);
  }

  importFromReader(reader, version) {
    this.outResourcesManager.importFromReader(reader, version);
    this.inResourcesManager.importFromReader(reader, version);
    this.producer.importFromReader(reader, version);
  }
}
