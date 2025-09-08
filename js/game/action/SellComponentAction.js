define("game/action/SellComponentAction", ["config/event/FactoryEvent"], function(FactoryEvent) {
    var SellComponentAction = function(tile, width, height) {
        (this.tile = tile), (this.factory = tile.getFactory()), (this.width = width || 1), (this.height = height || 1);
    };
    return (
        (SellComponentAction.prototype.canSell = function() {
            return !0;
        }),
        (SellComponentAction.prototype.sell = function() {
            for (var e = 0; e < this.width; e++)
                for (var t = 0; t < this.height; t++) {
                    var n = this.factory.getTile(this.tile.getX() + e, this.tile.getY() + t);
                    this._sellTile(n);
                }
        }),
        (SellComponentAction.prototype._sellTile = function(e) {
            var t = e.getComponent();
            if (t) {
                var n = t.getMeta();
                this.factory.getGame().addMoney(n.price), e.setComponent(null), this.factory.getEventManager().invokeEvent(FactoryEvent.FACTORY_COMPONENTS_CHANGED);
            }
        }),
        SellComponentAction
    );
});
