// SellComponentAction.js

export default class SellComponentAction {
    constructor(tile, width = 1, height = 1) {
        this.tile = tile;
        this.factory = tile.getFactory();
        this.width = width;
        this.height = height;
    }

    canSell() {
        return true;
    }

    sell() {
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                const tile = this.factory.getTile(this.tile.getX() + x, this.tile.getY() + y);
                this._sellTile(tile);
            }
        }
    }

    _sellTile(tile) {
        const component = tile.getComponent();
        if (!component) return;

        const meta = component.getMeta();
        const x = component.getX();
        const y = component.getY();
        let refundable = true;

        for (let startComp of this.factory.getMeta().startComponents) {
            if (startComp.id === meta.id && startComp.x === x && startComp.y === y) {
                refundable = false;
            }
        }

        for (let a = 0; a < meta.width; a++) {
            for (let u = 0; u < meta.height; u++) {
                const cTile = this.factory.getTile(x + a, y + u);
                cTile.setComponent(null);
            }
        }

        this.factory.getEventManager().invokeEvent(FactoryEvent.FACTORY_COMPONENTS_CHANGED, tile);

        if (refundable) {
            this.factory.getGame().addMoney(meta.price * meta.priceRefund);
        }
    }
}
