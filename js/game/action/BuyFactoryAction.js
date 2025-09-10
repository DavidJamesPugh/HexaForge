export default class BuyFactoryAction {
    constructor(game, factoryId) {
        this.game = game;
        this.factoryMeta = this.game.getMeta().factoriesById[factoryId];
    }

    canBuy() {
        return this.game.getMoney() >= this.factoryMeta.price;
    }

    buy() {
        this.game.addMoney(-this.factoryMeta.price);
        const factory = this.game.getFactory(this.factoryMeta.id);
        factory.reset();
        factory.setIsBought(true);
    }
}
