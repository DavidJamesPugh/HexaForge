import Node from "./Node.js";
import Link from "./Link.js";

export default class ProductionIndex {
    constructor(meta) {
        this.meta = meta;
        this.nodes = {};
        this.producers = {};
        this.consumers = {};
        this.endNodes = [];
        this.validStrategies = { buyer: true, seller: true, converter: true };
    }

    getEndNodes() {
        return this.endNodes;
    }

    getNode(id) {
        return this.nodes[id];
    }

    build() {
        // create nodes
        for (const id in this.meta.components) {
            const comp = this.meta.components[id];
            if (this.validStrategies[comp.strategy.type]) {
                const node = new Node(comp);
                this.nodes[comp.id] = node;
                this.indexComponent(comp);

                if (comp.strategy.type === "seller") {
                    this.endNodes.push(node);
                }
            }
        }

        // create links
        for (const resourceId in this.producers) {
            for (const producer of this.producers[resourceId]) {
                if (this.consumers[resourceId]) {
                    for (const consumer of this.consumers[resourceId]) {
                        new Link(
                            this.nodes[producer.componentId],
                            this.nodes[consumer.componentId],
                            resourceId
                        );
                    }
                }
            }
        }

        return this;
    }

    indexComponent(component) {
        const strategy = component.strategy;
        if (strategy.type === "buyer") {
            this.addToProducerIndex(component.id, strategy.purchaseResources);
        } else if (strategy.type === "converter") {
            this.addToProducerIndex(component.id, strategy.production);
            this.addToConsumersIndex(component.id, strategy.inputResources);
        } else if (strategy.type === "seller") {
            this.addToConsumersIndex(component.id, strategy.resources);
        }
    }

    addToProducerIndex(componentId, resources) {
        for (const resourceId in resources) {
            if (!this.producers[resourceId]) this.producers[resourceId] = [];
            this.producers[resourceId].push({ componentId, resourceId });
        }
    }

    addToConsumersIndex(componentId, resources) {
        for (const resourceId in resources) {
            if (!this.consumers[resourceId]) this.consumers[resourceId] = [];
            this.consumers[resourceId].push({ componentId, resourceId });
        }
    }
}
