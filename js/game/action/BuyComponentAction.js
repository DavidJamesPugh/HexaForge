define("game/action/BuyComponentAction", ["game/Component", "config/event/FactoryEvent"], function(Component, FactoryEvent) {
    var BuyComponentAction = function(tile, componentMeta) {
        (this.tile = tile), (this.factory = tile.getFactory()), (this.game = this.factory.getGame()), (this.componentMeta = componentMeta);
    };
    return (
        (BuyComponentAction.prototype.canBuy = function() {
            return this.game.getMoney() >= this.componentMeta.price;
        }),
        (BuyComponentAction.prototype.buy = function() {
            var e = this.tile,
                t = this.componentMeta,
                n = new Component(this.factory, e.getX(), e.getY(), t);
            return (
                e.setComponent(n),
                this.game.addMoney(-t.price),
                this.factory.getEventManager().invokeEvent(FactoryEvent.FACTORY_COMPONENTS_CHANGED),
                n
            );
        }),
        BuyComponentAction
    );
});
