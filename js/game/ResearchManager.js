// ResearchManager.js
export default class ResearchManager {
    game;
    research = {};

    constructor(game) {
        this.game = game;
    }

    setResearch(id, value) {
        this.research[id] = value;
    }

    addResearch(id, amount) {
        this.setResearch(id, this.getResearch(id) + amount);
    }

    getResearch(id) {
        return this.research[id] || 0;
    }

    getPrice(id) {
        const meta = this.game.getMeta().researchById[id];
        if (!meta) return 0;

        let price = meta.price || 0;
        for (let i = 0; i < this.getResearch(meta.id); i++) {
            price *= meta.priceIncrease;
        }
        return price;
    }

    getPriceResearchPoints(id) {
        const meta = this.game.getMeta().researchById[id];
        if (!meta) return 0;

        let priceRP = meta.priceResearchPoints || 0;
        for (let i = 0; i < this.getResearch(meta.id); i++) {
            priceRP *= meta.priceIncrease;
        }
        return priceRP;
    }

    couldPurchase(id) {
        const meta = this.game.getMeta().researchById[id];
        return !(this.getResearch(id) >= meta.max);
    }

    isVisible(id) {
        const meta = this.game.getMeta().researchById[id];
        return !meta.requiresResearch || this.getResearch(meta.requiresResearch) > 0;
    }

    canPurchase(id) {
        return this.couldPurchase(id) &&
               this.game.getMoney() >= this.getPrice(id) &&
               this.game.getResearchPoints() >= this.getPriceResearchPoints(id) &&
               this.isVisible(id);
    }

    exportToWriter() {
        const mainWriter = new BinaryArrayWriter();
        const extraWriter = new BinaryArrayWriter();

        const researchList = this.game.getMeta().researchByIdNum;
        extraWriter.writeUint16(researchList.length);

        extraWriter.writeBooleansArrayFunc(researchList, (meta) => {
            if (!meta) return false;

            const researchedAmount = this.research[meta.id] || 0;
            if (researchedAmount > 0) {
                if (researchedAmount > 1) {
                    mainWriter.writeUint16(meta.idNum);
                    mainWriter.writeUint16(researchedAmount);
                }
                return true;
            }
            return false;
        });

        extraWriter.writeWriter(mainWriter);
        return extraWriter;
    }

    importFromReader(reader) {
        if (reader.getLength() === 0) return;

        this.research = {};
        const numResearch = reader.readUint16();

        reader.readBooleanArrayFunc(numResearch, (index, hasResearch) => {
            if (hasResearch) {
                const meta = this.game.getMeta().researchByIdNum[index];
                if (meta) this.setResearch(meta.id, 1);
            }
        });

        const extraReader = reader.readReader();
        while (extraReader.getOffset() < extraReader.getLength()) {
            const idNum = extraReader.readUint16();
            const amount = extraReader.readUint16();
            const meta = this.game.getMeta().researchByIdNum[idNum];
            if (meta) this.setResearch(meta.id, amount);
        }
    }
}
