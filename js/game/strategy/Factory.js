import * as Strategies from './index.js';

const strategyMap = {
  buyer: Strategies.Buyer,
  transport: Strategies.Transport,
  converter: Strategies.Converter,
  seller: Strategies.Seller,
  garbage: Strategies.Garbage,
  sorter: Strategies.Sorter,
  researchCenter: Strategies.ResearchCenter,
  lab: Strategies.Lab,
};

export default class StrategyFactory {
  static getStrategyClass(type) {
    const StrategyClass = strategyMap[type];
    if (!StrategyClass) throw new Error("Unknown component strategy " + type);
    return StrategyClass;
  }

  static getForComponent(component) {
    const type = component.getMeta().strategy?.type;
    const StrategyClass = this.getStrategyClass(type);
    return new StrategyClass(component, component.getMeta().strategy);
  }

  static getMetaDescriptionData(strategyMeta, t) {
    const StrategyClass = this.getStrategyClass(strategyMeta.strategy.type);
    return StrategyClass.getMetaDescriptionData(strategyMeta, t);
  }
}
