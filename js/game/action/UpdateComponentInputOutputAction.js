define("game/action/UpdateComponentInputOutputAction", ["config/event/FactoryEvent"], function(FactoryEvent) {
    var UpdateComponentInputOutputAction = function(fromTile, toTile) {
        (this.fromTile = fromTile), (this.toTile = toTile), (this.factory = fromTile.getFactory());
    };
    return (
        (UpdateComponentInputOutputAction.prototype.canUpdate = function() {
            var e = this.fromTile.getComponent(),
                t = this.toTile.getComponent();
            return !(!e || !t);
        }),
        (UpdateComponentInputOutputAction.prototype.update = function() {
            var e = this.fromTile.getComponent(),
                t = this.toTile.getComponent();
            if (e && t) {
                var n = this.fromTile.getX() - this.toTile.getX(),
                    i = this.fromTile.getY() - this.toTile.getY(),
                    r = this._getDirection(n, i),
                    o = this._getOppositeDirection(r);
                e.getInputOutputManager().addInput(r), t.getInputOutputManager().addOutput(o), this.factory.getEventManager().invokeEvent(FactoryEvent.FACTORY_COMPONENTS_CHANGED);
            }
        }),
        (UpdateComponentInputOutputAction.prototype._getDirection = function(e, t) {
            return 0 === e && t < 0 ? "top" : 0 === e && t > 0 ? "bottom" : e < 0 && 0 === t ? "left" : e > 0 && 0 === t ? "right" : "center";
        }),
        (UpdateComponentInputOutputAction.prototype._getOppositeDirection = function(e) {
            switch (e) {
                case "top":
                    return "bottom";
                case "bottom":
                    return "top";
                case "left":
                    return "right";
                case "right":
                    return "left";
                default:
                    return "center";
            }
        }),
        UpdateComponentInputOutputAction
    );
});
