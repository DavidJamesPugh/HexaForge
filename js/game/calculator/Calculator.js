// game/calculator/Calculator.js
import FactoryCalculator from "./FactoryCalculator.js";

export default class Calculator {
  constructor(game) {
    this.game = game;
    this.factoryCalculators = {};

    for (const id in game.getMeta().factoriesById) {
      this.factoryCalculators[id] = new FactoryCalculator(game.getFactory(id));
    }
  }

  init() {
    for (const fc of Object.values(this.factoryCalculators)) {
      fc.setup();
    }
    return this;
  }

  destroy() {
    for (const fc of Object.values(this.factoryCalculators)) {
      fc.destroy();
    }
  }

  calculate() {
    const result = { profit: 0, researchProduction: 0, factory_results: {} };

    for (const id in this.factoryCalculators) {
      const fcResult = this.factoryCalculators[id].calculate();
      result.profit += fcResult.profit;
      result.researchProduction += fcResult.researchProduction;
      result.factory_results[id] = fcResult;
    }
    this.game.addMoney(result.profit);
    this.game.addResearchPoints(result.researchProduction);

    return result;
  }
}
