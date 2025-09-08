define("ui/factory/mapLayers/MouseLayer", [
    "game/action/BuyComponentAction",
    "game/action/SellComponentAction",
    "game/action/UpdateComponentInputOutputAction",
    "game/action/UpdateTileAction",
    "ui/factory/mapLayers/helper/MouseInfoHelper",
    "config/event/FactoryEvent"
], function (e, t, n, i, r, FactoryEvent) {
    var o = "LayerMouse",
        s = function (e, t, n) {
            (this.imageMap = e),
                (this.factory = t),
                (this.game = t.getGame()),
                (this.tileSize = n.tileSize),
                (this.tilesX = t.getMeta().tilesX),
                (this.tilesY = t.getMeta().tilesY),
                (this.selectedComponentMetaId = null),
                (this.selectedMapToolId = null),
                (this.clickedComponent = null),
                (this.mouseInfoHelper = new r(this.factory, e, n.tileSize));
        };
    return (
        (s.prototype.display = function (e) {
            (this.selectedComponentMetaId = null),
                (this.container = e),
                (this.element = $("<div />")
                    .css("position", "absolute")
                    .css("width", this.tilesX * this.tileSize)
                    .css("height", this.tilesY * this.tileSize)),
                this.container.append(this.element),
                this._setupNativeMouseEvents(),
                this._setupMouseListeners(),
                this.mouseInfoHelper.display(e);
        }),
        (s.prototype._setupMouseListeners = function () {
            var e = null,
                t = null,
                n = null;
            this.factory.getEventManager().addListener(
                o,
                FactoryEvent.FACTORY_MOUSE_MOVE,
                function (n) {
                    if (e && e.altKeyDown) this.updateTileMeta(e), this.updateTileMeta(n);
                    else if (this.selectedComponentMetaId) {
                        this.mouseInfoHelper.updateMouseInformationModes(this.selectedComponentMetaId, n);
                        var i = this.game.getMeta().componentsById[this.selectedComponentMetaId];
                        e &&
                            (n.leftMouseDown && !e.shiftKeyDown && 1 == i.buildByDragging
                                ? (this.buyComponent(e), this.buyComponent(n), this.connectComponents(t, n))
                                : ((n.leftMouseDown && e.shiftKeyDown) || n.rightMouseDown) && (this.sellComponent(e), this.sellComponent(n)));
                    } else e && ((n.leftMouseDown && e.shiftKeyDown) || n.rightMouseDown) && (this.sellComponent(e), this.sellComponent(n));
                    t = n;
                }.bind(this)
            ),
                this.factory.getEventManager().addListener(
                    o,
                    FactoryEvent.FACTORY_MOUSE_OUT,
                    function () {
                        this.mouseInfoHelper.turnOffBuildMode(), this.mouseInfoHelper.turnOffCantBuildMode(), (e = null), (t = null);
                    }.bind(this)
                ),
                this.factory.getEventManager().addListener(o, FactoryEvent.FACTORY_MOUSE_DOWN, function (t) {
                    e = t;
                }),
                this.factory.getEventManager().addListener(
                    o,
                    FactoryEvent.FACTORY_MOUSE_UP,
                    function (t) {
                        if (e && e.x == t.x && e.y == t.y) {
                            var i = this.factory.getTile(t.x, t.y).getComponent();
                            e.altKeyDown
                                ? this.updateTileMeta(t)
                                : this.selectedComponentMetaId
                                ? e.leftMouseDown && !e.shiftKeyDown
                                    ? this.buyComponent(e)
                                    : ((e.leftMouseDown && e.shiftKeyDown) || e.rightMouseDown) && this.sellComponent(e)
                                : !this.selectedComponentMetaId && ((e.leftMouseDown && e.shiftKeyDown) || e.rightMouseDown)
                                ? this.sellComponent(e)
                                : i && (n == i && (i = null), this.factory.getEventManager().invokeEvent(FactoryEvent.COMPONENT_SELECTED, i), (n = i));
                        }
                        e = null;
                    }.bind(this)
                ),
                this.factory.getEventManager().addListener(
                    o,
                    FactoryEvent.COMPONENT_META_SELECTED,
                    function (e) {
                        this.factory.getEventManager().invokeEvent(FactoryEvent.COMPONENT_SELECTED, null), (this.selectedComponentMetaId = e), this.mouseInfoHelper.updateMouseInformationModes(e, t), (n = null);
                    }.bind(this)
                ),
                this.factory.getEventManager().addListener(
                    o,
                    FactoryEvent.MAP_TOOL_SELECTED,
                    function (e) {
                        this.factory.getEventManager().invokeEvent(FactoryEvent.COMPONENT_SELECTED, null), (this.selectedMapToolId = e), (n = null);
                    }.bind(this)
                ),
                this.factory.getEventManager().addListener(
                    o,
                    FactoryEvent.COMPONENT_SELECTED,
                    function (e) {
                        this.mouseInfoHelper.updateComponentSelected(e);
                    }.bind(this)
                );
        }),
        (s.prototype.updateTileMeta = function (e) {
            var t = new i(this.factory.getTile(e.x, e.y), this.selectedMapToolId);
            t.canUpdate() && t.update();
        }),
        (s.prototype.buyComponent = function (t) {
            var n = new e(this.factory.getTile(t.x, t.y), this.game.getMeta().componentsById[this.selectedComponentMetaId]);
            n.canBuy() && n.buy();
        }),
        (s.prototype.sellComponent = function (e) {
            var n = this.game.getMeta().componentsById[this.selectedComponentMetaId],
                i = new t(this.factory.getTile(e.x, e.y), n ? n.width : 1, n ? n.height : 1);
            i.canSell() && i.sell();
        }),
        (s.prototype.connectComponents = function (e, t) {
            var i = new n(this.factory.getTile(e.x, e.y), this.factory.getTile(t.x, t.y));
            i.canUpdate() && i.update();
        }),
        (s.prototype._setupNativeMouseEvents = function () {
            var e = null,
                t = this;
            this.element.get(0).addEventListener(
                "mouseout",
                function () {
                    t.factory.getEventManager().invokeEvent(FactoryEvent.FACTORY_MOUSE_OUT, e), (e = null);
                },
                !1
            ),
                this.element.get(0).addEventListener(
                    "mousemove",
                    function (n) {
                        var i = t.selectedComponentMetaId ? t.game.getMeta().componentsById[t.selectedComponentMetaId] : { width: 1, height: 1 },
                            r = t.element.get(0).getBoundingClientRect(),
                            o = n.clientX - r.left - (t.tileSize * i.width) / 2,
                            s = n.clientY - r.top - (t.tileSize * i.height) / 2,
                            a = { x: Math.round(o / t.tileSize), y: Math.round(s / t.tileSize), leftMouseDown: 1 == n.which, rightMouseDown: 3 == n.which, shiftKeyDown: n.shiftKey, altKeyDown: n.altKey };
                        (a.x = Math.min(t.tilesX - i.width, Math.max(0, a.x))),
                            (a.y = Math.min(t.tilesY - i.height, Math.max(0, a.y))),
                            (e && e.x == a.x && e.y == a.y) || (t.factory.getEventManager().invokeEvent(FactoryEvent.FACTORY_MOUSE_MOVE, a), (e = a));
                    },
                    !1
                ),
                this.element.get(0).addEventListener(
                    "mousedown",
                    function (n) {
                        t.factory.getEventManager().invokeEvent(FactoryEvent.FACTORY_MOUSE_DOWN, { x: e.x, y: e.y, leftMouseDown: 1 == n.which, rightMouseDown: 3 == n.which, shiftKeyDown: n.shiftKey, altKeyDown: n.altKey });
                    },
                    !1
                ),
                this.element.get(0).addEventListener(
                    "mouseup",
                    function () {
                        t.factory.getEventManager().invokeEvent(FactoryEvent.FACTORY_MOUSE_UP, e);
                    },
                    !1
                );
        }),
        (s.prototype.destroy = function () {
            this.mouseInfoHelper.destroy(), this.factory.getEventManager().removeListenerForType(o), this.container.html(""), (this.container = null);
        }),
        s
    );
});
