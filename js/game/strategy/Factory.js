import * as Strategies from './index.js';

export default class StrategyFactory {
  static getStrategyClass(type) {
    const StrategyClass = Strategies[type];
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
    console.log(strategyMeta.strategy.type);
    if (typeof StrategyClass.getMetaDescriptionData !== 'function') {
      throw new Error(`Strategy class ${strategyMeta.strategy.type} has no getMetaDescriptionData method`);
    }
    return StrategyClass.getMetaDescriptionData(strategyMeta, t);
  }
}
