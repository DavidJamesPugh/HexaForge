// ProductionCostCalculator.js

class ProductionCostCalculator {
    constructor(componentsById, sourceBuildings) {
      this.componentsById = componentsById;
      this.sourceBuildings = sourceBuildings;
  
      this.strategies = {
        buyer: {
          selfCost: (component, resourceKey) =>
            (component.strategy.interval * component.runningCostPerTick) /
              ProductionCostCalculator.getSumOfProduction(component.strategy.purchaseResources) +
            component.strategy.purchaseResources[resourceKey].price,
  
          inputCost: (component, resourceKey) => 1,
        },
        converter: {
          selfCost: (component) =>
            (component.strategy.interval * component.runningCostPerTick) /
            ProductionCostCalculator.getSumOfProduction(component.strategy.production),
  
          inputCost: (component, resourceKey) => {
            const totalProduction = ProductionCostCalculator.getSumOfProduction(component.strategy.production);
            if (!component.strategy.inputResources[resourceKey]) {
              throw new Error(`${component.id} can't handle resources: ${resourceKey}`);
            }
            return component.strategy.inputResources[resourceKey].perOutputResource / totalProduction;
          },
        },
        seller: {
          selfCost: (component) =>
            (component.strategy.interval * component.runningCostPerTick) /
            ProductionCostCalculator.getSumOfProduction(component.strategy.resources),
  
          inputCost: (component, resourceKey) => 1,
        },
      };
    }
  
    static getSumOfProduction(resources) {
      let sum = 0;
      for (const key in resources) {
        if (key === "waste" || resources[key].bonus) continue;
        sum += resources[key].amount;
      }
      return sum;
    }
  
    calculateCostFor(componentId, resourceKey, costData) {
      const component = this.componentsById[componentId];
      let sourceBuildings = this.sourceBuildings[componentId] || {};

      const strategy = this.strategies[component.strategy.type];
      let inputCostSum = 0;
      const selfCost = strategy.selfCost(component, resourceKey);

      if (component.strategy.type === "seller") {
        // Recursively calculate cost for source components
        inputCostSum += this.calculateCostFor(sourceBuildings[resourceKey], resourceKey, costData);
        if (component.strategy.resources[resourceKey].bonus) {
          // Bonus resources have 0 cost
          costData[`${componentId}-${resourceKey}`] = { self: 0, input: inputCostSum, total: inputCostSum };
          return inputCostSum;
        }
      } else {
        // For buyers/converters, sum all input costs recursively
        for (const [resourceKey, srcKey] of Object.entries(sourceBuildings)) {
          inputCostSum += this.calculateCostFor(srcKey, resourceKey, costData) * strategy.inputCost(component, resourceKey);
        }
      }

      const totalCost = selfCost + inputCostSum;
      costData[`${componentId}-${resourceKey}`] = { self: selfCost, input: inputCostSum, total: totalCost };
      return totalCost;
    }
  }
  
  export default ProductionCostCalculator;
  