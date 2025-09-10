// ResetFactoryAction.js
import SellComponentAction from "./SellComponentAction.js";

export default class ResetFactoryAction {
    constructor(factory) {
        this.factory = factory;
    }

    canReset() {
        return true;
    }

    reset() {
        const tiles = this.factory.getTiles();
        for (let tile of tiles) {
            const action = new SellComponentAction(tile, 1, 1);
            if (action.canSell()) action.sell();
        }
        this.factory.reset();
    }
}
