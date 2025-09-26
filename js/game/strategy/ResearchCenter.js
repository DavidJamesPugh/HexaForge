import ResourceIntake from "./helper/ResourceIntake";
import DelayedAction from "./helper/DelayedAction";
import { lcFirst } from "/js/utils/stringHelpers.js";
import numberFormat from "../../base/NumberFormat";
import { arrayToHumanStr } from "/js/utils/arrayHelpers.js";

export default class ResearchCenter {
    constructor(component, meta) {
        this.component = component;
        this.meta = meta;
        this.game = component.getFactory().getGame();
        this.productionBonus = 0;
        this.inResourcesManager = new ResourceIntake(component, meta.resources);
        this.producer = new DelayedAction(meta.interval);
        this.producer.canStart = this.canProduce.bind(this);
        this.producer.start = this.startProduction.bind(this);
        this.producer.finished = this.finishProduction.bind(this);
    }

    clearContents() {
        this.inResourcesManager.reset();
        this.producer.reset();
    }

    static getMetaBonus(meta, resourceId, factory) {
        return meta.strategy.resources[resourceId].bonus *
            factory.getUpgradesManager().getComponentBonuses(meta.applyUpgradesFrom ? meta.applyUpgradesFrom : meta.id).researchPaperBonus;
    }

    getBonus(resourceId) {
        return ResearchCenter.getMetaBonus(this.component.getMeta(), resourceId, this.component.getFactory());
    }

    static getResearchProduction(meta, factory) {
        return meta.strategy.researchProduction * factory.getGame().getResearchProductionMultiplier();
    }

    getResearchProduction() {
        return ResearchCenter.getResearchProduction(this.component.getMeta(), this.component.getFactory());
    }

    static getMetaDescriptionData(meta, factory, instance) {
        const resources = meta.strategy.resources;
        const gameResources = factory.getGame().getMeta().resourcesById;
        const bonusStr = Object.keys(resources).map(rId => 
            `<span class='${rId}'>${lcFirst(gameResources[rId].name)}: <b>${numberFormat.formatNumber(ResearchCenter.getMetaBonus(meta, rId, factory))}</b></span> `
        );
        return {
            interval: meta.strategy.interval,
            bonusStr: arrayToHumanStr(bonusStr),
            productionStr: `<span class='research'><b>${numberFormat.formatNumber(ResearchCenter.getResearchProduction(meta, factory))}</b> research points </span>`
        };
    }

    getDescriptionData() {
        const data = ResearchCenter.getMetaDescriptionData(this.component.getMeta(), this.component.getFactory(), this);
        this.producer.updateWithDescriptionData(data);
        this.inResourcesManager.updateWithDescriptionData(data);
        return data;
    }

    calculateInputTick() {
        this.inResourcesManager.takeIn();
        this.producer.calculate();
    }

    canProduce() {
        return true;
    }

    startProduction() {
        let bonus = 1;
        for (const rId in this.meta.resources) {
            bonus += this.inResourcesManager.getResource(rId) * this.getBonus(rId);
            this.inResourcesManager.addResource(rId, -this.inResourcesManager.getResource(rId));
        }
        this.productionBonus = bonus;
    }

    finishProduction(researchData) {
        researchData.researchProduction += this.getResearchProduction() * this.productionBonus;
    }

    toString() {
        return this.producer.toString() + "<br />";
    }

    exportToWriter(writer) {
        writer.writeUint32(this.productionBonus);
        this.producer.exportToWriter(writer);
    }

    importFromReader(reader) {
        this.productionBonus = reader.readUint32();
        this.producer.importFromReader(reader);
    }
}
