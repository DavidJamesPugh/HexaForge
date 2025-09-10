// game/calculator/FactoryCalculator.js
import TransportCalculator from "./TransportCalculator.js";
import FactoryEvent from "../../config/event/FactoryEvent.js";

export default class FactoryCalculator {
  constructor(factory) {
    this.factory = factory;
    this.transportCalculator = new TransportCalculator(factory);
    this.components = [];
    this.strategies = {};
    this.cachesOk = false;
  }

  calculate() {
    if (!this.cachesOk) this.buildCaches();

    const result = { runningCosts: 0, resourceCosts: 0, resourceSales: 0, researchProduction: 0, profit: 0 };

    if (this.factory.getIsPaused()) {
      result.isPaused = true;
    } else {
      for (const comp of this.components) {
        comp.calculateInputTick(result);
        comp.getStrategy().calculateInputTick?.(result);
      }

      this.transportCalculator.calculate();

      for (const comp of this.components) {
        comp.getStrategy().calculateOutputTick?.(result);
      }

      this.factory.getEventManager().invokeEvent(FactoryEvent.FACTORY_TICK, result);
    }

    result.profit = result.resourceSales - result.resourceCosts - result.runningCosts;
    return result;
  }

  buildCaches() {
    this.cachesOk = true;
    this.transportCalculator.buildCaches();
    this.components = this.factory.getTiles()
      .filter(tile => tile.isMainComponentContainer())
      .map(tile => tile.getComponent());
  }

  setup() {
    this.factory.getEventManager().addListener("FactoryCalculator", FactoryEvent.FACTORY_COMPONENTS_CHANGED, () => {
      this.cachesOk = false;
    });
  }

  destroy() {
    this.factory.getEventManager().removeListenerForType("FactoryCalculator");
  }
}
