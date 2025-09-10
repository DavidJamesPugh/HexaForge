import Node from "./Node.js";
import Factory from "../../strategy/Factory.js";

export default class ProductionTreeBuilder {
  constructor(factory) {
    this.factory = factory;
    this.meta = factory.getGame().getMeta();
  }

  buildTree(componentId, depth) {
    const root = new Node(this.meta.componentsById[componentId], 1, 0);
    this._buildTree(root, depth);
    return root;
  }

  _buildTree(node, depth) {
    if (depth <= 0) return;

    const tree = this.meta.productionTree[node.getComponentMeta().id] || {};
    for (const resId in tree) {
      const childId = tree[resId];
      const child = new Node(this.meta.componentsById[childId], 1, node.getLevel() + 1);

      this._balanceNode(node, child, resId);
      child.setParent(node);
      node.addChild(resId, child);

      this._buildTree(child, depth - 1);
    }
  }

  _balanceNode(parent, child, resourceId) {
    const consumption = this.getConsumption(this.meta.componentsById[parent.getComponentMeta().id], resourceId);
    const production = this.getProduction(this.meta.componentsById[child.getComponentMeta().id], resourceId);

    const lcm = this.findLeastCommonMultiple(consumption * parent.getAmount(), production);
    const parentAmount = Math.round(lcm / consumption);
    const childAmount = Math.round(lcm / production);

    if (parentAmount > parent.getAmount()) {
      const factor = parentAmount / parent.getAmount();
      parent.getRoot().multiplyAmount(factor);
    }

    child.setAmount(childAmount);
  }

  findLeastCommonMultiple(a, b) {
    if (!a || !b) return 0;
    let n = Math.abs(a);
    let i = Math.abs(b);
    while (i) {
      const r = i;
      i = n % i;
      n = r;
    }
    return Math.abs((a * b) / n);
  }

  getProduction(component, resourceId) {
    let amount = 0;
    const strategyClass = Factory.getStrategyClass(component.strategy.type);

    if (component.strategy.type === "buyer") {
      amount = strategyClass.getMetaBuyAmount(component, resourceId, this.factory);
    } else if (component.strategy.type === "converter") {
      amount = strategyClass.getMetaProduceAmount(component, resourceId, this.factory);
    }
    return (amount / component.strategy.interval) * 10;
  }

  getConsumption(component, resourceId) {
    let amount = 0;
    const strategyClass = Factory.getStrategyClass(component.strategy.type);

    if (component.strategy.type === "converter") {
      amount = strategyClass.getMetaUseAmount(component, resourceId, this.factory);
    } else if (component.strategy.type === "seller") {
      amount = strategyClass.getMetaSellAmount(component, resourceId, this.factory);
    }
    return (amount / component.strategy.interval) * 10;
  }
}
