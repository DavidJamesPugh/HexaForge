export default class Link {
    constructor(producerNode, consumerNode, resourceId) {
        if (!producerNode) throw new Error("producer must be set for resource " + resourceId);
        if (!consumerNode) throw new Error("consumer must be set for resource " + resourceId);

        this.producerNode = producerNode;
        this.consumerNode = consumerNode;
        this.resourceId = resourceId;

        this.producerAmount = null;
        this.consumerAmount = null;

        this.calculateStuff();
        this.canSupport = Math.round((this.producerAmount / this.consumerAmount) * 100) / 100;

        this.producerNode._addConsumerLink(this);
        this.consumerNode._addProducerLink(this);
    }

    calculateStuff() {
        let data;
        const producerComp = this.producerNode.getComponent();

        if (producerComp.strategy.type === "buyer") {
            data = producerComp.strategy.purchaseResources[this.resourceId];
            this.producerAmount = data.amount / producerComp.strategy.interval;
        } else if (producerComp.strategy.type === "converter") {
            data = producerComp.strategy.production[this.resourceId];
            this.producerAmount = data.amount / producerComp.strategy.interval;
        }

        const consumerComp = this.consumerNode.getComponent();
        if (consumerComp.strategy.type === "converter") {
            data = consumerComp.strategy.inputResources[this.resourceId];
            this.consumerAmount = data.perOutputResource / consumerComp.strategy.interval;
        } else if (consumerComp.strategy.type === "seller") {
            data = consumerComp.strategy.resources[this.resourceId];
            this.consumerAmount = data.amount / consumerComp.strategy.interval;
        }
    }

    getProducerNode() {
        return this.producerNode;
    }

    getConsumerNode() {
        return this.consumerNode;
    }

    getResourceId() {
        return this.resourceId;
    }

    getCanSupport() {
        return this.canSupport;
    }

    getProducerAmount() {
        return this.producerAmount;
    }

    getConsumerAmount() {
        return this.consumerAmount;
    }

    toGraph(nodes, edges, nodeMap, level) {
        edges.push({
            from: this.producerNode.getComponent().id,
            to: this.consumerNode.getComponent().id,
            arrows: "to",
            label: Math.round(100 * this.canSupport) / 100,
        });
    }
}
