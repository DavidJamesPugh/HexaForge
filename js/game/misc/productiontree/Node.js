export default class Node {
    constructor(component) {
        this.component = component;
        this.producers = [];
        this.consumers = []; // fixed typo: was "consumpers"
    }

    getComponent() {
        return this.component;
    }

    _addConsumerLink(link) {
        this.consumers.push(link);
    }

    _addProducerLink(link) {
        this.producers.push(link);
    }

    toGraph(nodes, edges, nodeMap, level) {
        if (nodeMap[this.component.id]) {
            if (level > nodeMap[this.component.id].level) {
                nodeMap[this.component.id].level = level;
                for (const producer of this.producers) {
                    producer.getProducerNode().toGraph(nodes, edges, nodeMap, level + 1);
                }
            }
        } else {
            const node = {
                id: this.component.id,
                label: this.component.name,
                shape: "box",
                level,
            };
            nodeMap[this.component.id] = node;
            nodes.push(node);

            for (const producer of this.producers) {
                producer.toGraph(nodes, edges, nodeMap, level + 1);
                producer.getProducerNode().toGraph(nodes, edges, nodeMap, level + 1);
            }
        }
    }
}
