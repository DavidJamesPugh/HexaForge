import ResourceIntake from "./helper/ResourceIntake";
import ResourceOutput from "./helper/ResourceOutput";
import DelayedAction from "./helper/DelayedAction";

export default class Lab {
    constructor(component, meta) {
        this.component = component;
        this.meta = meta;
        this.inResourcesManager = new ResourceIntake(component, meta.inputResources);
        this.outResourcesManager = new ResourceOutput(component, meta.production, meta.outputResourcesOrder);
        this.productionBonus = 0;
        this.producer = new DelayedAction(meta.interval);
        this.producer.canStart = this.canStartProduction.bind(this);
        this.producer.start = this.startProduction.bind(this);
        this.producer.finished = this.finishedProduction.bind(this);
    }

    clearContents() {
        this.inResourcesManager.reset();
        this.outResourcesManager.reset();
        this.producer.reset();
    }

    static isProducing(game, meta, resourceId) {
        return !meta.productionRemoveResearch || !meta.productionRemoveResearch[resourceId] || !game.getResearchManager().getResearch(meta.productionRemoveResearch[resourceId]);
    }

    static getMetaDescriptionData(meta, factory, instance) {
        const o = meta.strategy || meta;
        const resourcesById = factory.getGame().getMeta().resourcesById;
        const inputStr = [], outputStr = [], storageStr = [], bonusStr = [];
        let maxBonus = 0;

        for (const rId in o.inputResources) {
            const res = o.inputResources[rId];
            inputStr.push(`<span class='${rId}'><b>${res.perOutputResource}</b> ${resourcesById[rId].nameShort.lcFirst()}</span>`);
            storageStr.push(`<span class='${rId}'>${resourcesById[rId].nameShort.lcFirst()}: <b>${res.max}</b></span>`);
            bonusStr.push(`<span class='${rId}'>${resourcesById[rId].nameShort.lcFirst()}: <b>${res.bonus}</b></span>`);
            maxBonus += res.bonus;
        }

        for (const rId in o.production) {
            if (Lab.isProducing(factory.getGame(), o, rId)) {
                const prod = o.production[rId];
                outputStr.push(`<span class='${rId}'><b>${prod.amount}</b> ${resourcesById[rId].nameShort.lcFirst()}</span>`);
                storageStr.push(`<span class='${rId}'>${resourcesById[rId].nameShort.lcFirst()}: <b>${prod.max}</b></span>`);
            }
        }

        return {
            interval: o.interval,
            inputStr: arrayToHumanStr(inputStr),
            outputStr: arrayToHumanStr(outputStr),
            storageStr: arrayToHumanStr(storageStr),
            bonusStr: arrayToHumanStr(bonusStr),
            maxBonus
        };
    }

    getDescriptionData() {
        const data = Lab.getMetaDescriptionData(this.component.getMeta(), this.component.getFactory(), this);
        this.producer.updateWithDescriptionData(data);
        this.inResourcesManager.updateWithDescriptionData(data);
        this.outResourcesManager.updateWithDescriptionData(data);
        return data;
    }

    calculateInputTick() {
        this.inResourcesManager.takeIn();
    }

    calculateOutputTick() {
        this.producer.calculate();
        this.outResourcesManager.distribute();
    }

    canStartProduction() {
        for (const rId in this.meta.production) {
            if (this.outResourcesManager.getResource(rId) + this.meta.production[rId].amount > this.outResourcesManager.getMax(rId)) {
                return false;
            }
        }
        return true;
    }

    startProduction() {
        let bonus = 1;
        for (const rId in this.meta.inputResources) {
            const res = this.meta.inputResources[rId];
            if (this.inResourcesManager.getResource(rId) >= res.perOutputResource) {
                this.inResourcesManager.addResource(rId, -res.perOutputResource);
                bonus += res.bonus;
            }
        }
        this.productionBonus = bonus;
    }

    finishedProduction() {
        for (const rId in this.meta.production) {
            if (Lab.isProducing(this.component.getFactory().getGame(), this.meta, rId)) {
                this.outResourcesManager.addResource(rId, this.meta.production[rId].amount * this.productionBonus);
            }
        }
    }

    toString() {
        return this.inResourcesManager.toString() + "<br />" +
               this.outResourcesManager.toString() + "<br />" +
               this.producer.toString() + "<br />";
    }

    exportToWriter(writer) {
        writer.writeUint32(this.productionBonus);
        this.outResourcesManager.exportToWriter(writer);
        this.inResourcesManager.exportToWriter(writer);
        this.producer.exportToWriter(writer);
    }

    importFromReader(reader) {
        this.productionBonus = reader.readUint32();
        this.outResourcesManager.importFromReader(reader);
        this.inResourcesManager.importFromReader(reader);
        this.producer.importFromReader(reader);
    }
}
