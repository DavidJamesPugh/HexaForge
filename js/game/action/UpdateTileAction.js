define("game/action/UpdateTileAction", ["config/event/FactoryEvent"], function(FactoryEvent) {
    var UpdateTileAction = function(tile, toolId) {
        (this.tile = tile), (this.factory = tile.getFactory()), (this.toolId = toolId);
    };
    return (
        (UpdateTileAction.prototype.canUpdate = function() {
            return !!this.toolId;
        }),
        (UpdateTileAction.prototype.update = function() {
            var e = this.factory.getMeta().terrainMap,
                t = this.tile.getY() * this.factory.getMeta().tilesX + this.tile.getX(),
                n = this.factory.getMeta().terrains;
            if (this.toolId === "floor") {
                var i = " ";
                e[t] = i;
            } else if (this.toolId === "road") {
                var i = ".";
                e[t] = i;
            } else if (this.toolId === "wall") {
                var i = "X";
                e[t] = i;
            }
            this.factory.getEventManager().invokeEvent(FactoryEvent.FACTORY_TERRAIN_CHANGED);
        }),
        UpdateTileAction
    );
});
