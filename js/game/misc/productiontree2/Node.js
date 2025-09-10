export default class Node {
    constructor(componentMeta, amount, level) {
      this.id = Math.random();
      this.componentMeta = componentMeta;
      this.amount = amount;
      this.level = level;
      this.parent = null;
      this.children = {};
    }
  
    getId() {
      return this.id;
    }
  
    setAmount(amount) {
      this.amount = amount;
    }
  
    getAmount() {
      return this.amount;
    }
  
    getComponentMeta() {
      return this.componentMeta;
    }
  
    getLevel() {
      return this.level;
    }
  
    getParent() {
      return this.parent;
    }
  
    setParent(parent) {
      this.parent = parent;
    }
  
    getChildren() {
      return this.children;
    }
  
    hasChildren() {
      return Object.keys(this.children).length > 0;
    }
  
    addChild(resourceId, node) {
      this.children[resourceId] = node;
    }
  
    getRoot() {
      return this.parent ? this.parent.getRoot() : this;
    }
  
    multiplyAmount(factor) {
      this.amount *= factor;
      for (const key in this.children) {
        this.children[key].multiplyAmount(factor);
      }
    }
  
    toGraph(nodes, edges) {
      const node = {
        id: this.id,
        label: `${this.componentMeta.name}(${this.amount})`,
        shape: "box",
        level: this.level
      };
      nodes.push(node);
  
      if (this.parent) {
        edges.push({ from: this.parent.getId(), to: this.id });
      }
  
      for (const key in this.children) {
        this.children[key].toGraph(nodes, edges);
      }
    }
  
    findLeastCommonMultiplier(a, b) {
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
  }
  