define("ui/factory/InfoUi", [
    "text!template/factory/info.html",
    "text!template/factory/infoDetails.html",
    "lib/handlebars",
    "game/Component"
], function(infoTemplate, infoDetailsTemplate, Handlebars, Component) {
var componentInfoUi = "componentInfoUi";

var numberFormat = {
    format: function(num) {
        if (num === undefined || num === null) return "?";
        if (Math.abs(num) < 10) return Math.round(100 * num) / 100;
        if (Math.abs(num) < 1e3) return Math.round(10 * num) / 10;
        if (Math.abs(num) < 1e6) {
            return Number(num).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }
        if (Math.abs(num) < 1e9) return (num / 1e6).toFixed(1) + "M";
        if (Math.abs(num) < 1e12) return (num / 1e9).toFixed(1) + "B";
        return (num / 1e12).toFixed(1) + "T";
    }
};

var nf = function(num) {
    return numberFormat.format(num);
};
    var InfoUI = function(factory, statistics, play, imageMap) {
        this.factory = factory;
        this.game = factory.getGame();
        this.statistics = statistics;
        this.play = play;
        this.imageMap = imageMap;
        this.selectedPosition = null;
        this.hoveredComponentMetaId = null;
        this.selectedComponentMetaId = null;
        this.selectedComponent = null;
        this.componentStrategies = null;
        this.displayedStrategy = null;
        this.displayedStrategyComponent = null;
    };
    

    InfoUI.prototype.display = function(container) {
        var self = this;
        (this.container = container),
            this.container.html(Handlebars.compile(infoTemplate)({})),
            (this.infoContainer = this.container.find(".componentInfo")),
            (this.controlsContainer = this.container.find(".componentControls")),
            this.factory.getEventManager().addListener(componentInfoUi, FactoryEvent.FACTORY_MOUSE_MOVE, function (evt) {
                (self.selectedPosition = evt), self.checkWhatShouldBeDisplayed(!1);
            }),
            this.factory.getEventManager().addListener(componentInfoUi, FactoryEvent.FACTORY_MOUSE_OUT, function (evt) {
                (self.selectedPosition = null), self.checkWhatShouldBeDisplayed(!1);
            }),
            this.factory.getEventManager().addListener(componentInfoUi, FactoryEvent.FACTORY_TICK, function () {
                self.checkWhatShouldBeDisplayed(true);
            }),
            this.factory.getEventManager().addListener(componentInfoUi, FactoryEvent.REFRESH_COMPONENT_INFO, function (evt) {
                self.checkWhatShouldBeDisplayed(false);
            }),
            this.factory.getEventManager().addListener(componentInfoUi, FactoryEvent.HOVER_COMPONENT_META, function (evt) {
                (self.hoveredComponentMetaId = evt), self.checkWhatShouldBeDisplayed(false);
            }),
            this.factory.getEventManager().addListener(componentInfoUi, FactoryEvent.COMPONENT_META_SELECTED, function (evt) {
                (self.selectedComponentMetaId = evt), (self.selectedComponent = null), self.checkWhatShouldBeDisplayed(false);
            }),
            this.factory.getEventManager().addListener(
                componentInfoUi,
                FactoryEvent.COMPONENT_SELECTED,
                function (evt) {
                    (self.selectedComponent = evt), self.checkWhatShouldBeDisplayed(false);
                }.bind(this)
            );
    };


    (InfoUI.prototype.checkWhatShouldBeDisplayed = function (shouldDisplay) {
        console.log("[InfoUI] checkWhatShouldBeDisplayed called");
        console.log("[InfoUI] State:", {
            hoveredComponentMetaId: this.hoveredComponentMetaId,
            selectedComponent: !!this.selectedComponent,
            selectedComponentMetaId: this.selectedComponentMetaId,
            selectedPosition: this.selectedPosition,
            shouldDisplay: shouldDisplay
        });

        this.hoveredComponentMetaId
            ? (console.log("[InfoUI] Showing hovered component meta info"), shouldDisplay || (this.showComponentMetaInfo(this.hoveredComponentMetaId), this.hideComponentStrategy()))
            : this.selectedComponent
            ? (console.log("[InfoUI] Showing selected component info"), this.showComponentInfo(this.selectedComponent), this.showComponentStrategy(this.selectedComponent))
            : this.selectedComponentMetaId
            ? (console.log("[InfoUI] Showing selected component meta info"), shouldDisplay || (this.showComponentMetaInfo(this.selectedComponentMetaId), this.hideComponentStrategy()))
            : this.selectedPosition
            ? (console.log("[InfoUI] Showing location info"), this.showLocationInfo(this.selectedPosition.x, this.selectedPosition.y), this.hideComponentStrategy())
            : (console.log("[InfoUI] Showing default info"), this.showDefaultInfo());
    });


    (InfoUI.prototype.showComponentInfo = function (component) {
        this.showLocationInfo(component.getX(), component.getY());
    });


    (InfoUI.prototype.showLocationInfo = function (x, y) {
        var tile = this.factory.getTile(x, y);
        var htmlData = { isLocation: true };
        (htmlData.tile = { x: tile.getX(), y: tile.getY(), terrain: tile.getTerrain(), buildableType: tile.getBuildableType() }),
            tile.getComponent() ? (htmlData.component = tile.getComponent().getDescriptionData()) : (htmlData.component = {}),
            this.infoContainer.html(Handlebars.compile(infoDetailsTemplate)(htmlData));
    });


    (InfoUI.prototype.showComponentStrategy = function (e) {
        if (this.displayedStrategyComponent != e) {
            var t = this.componentStrategies[e.getMeta().strategy.type];
            t ? ((this.displayedStrategyComponent = e), (this.displayedStrategy = new t(e)), this.displayedStrategy.display(this.controlsContainer), this.controlsContainer.show()) : this.hideComponentStrategy();
        }
    });


    (InfoUI.prototype.hideComponentStrategy = function () {
        this.displayedStrategy && (this.displayedStrategy.destroy(), (this.displayedStrategy = null), (this.displayedStrategyComponent = null)), this.controlsContainer.html("").hide();
    });


    (InfoUI.prototype.showComponentMetaInfo = function (e) {
        var i = this.game.getMeta().componentsById[e],
            s = { isMeta: !0, component: Component.getMetaDescriptionData(i, this.factory) };
        this.infoContainer.html(Handlebars.compile(infoDetailsTemplate)(s));
        // Production tree functionality commented out - dependencies not available
        // var a = new ProductionTreeBuilder(this.factory).buildTree(e, 1);
        // if (a.hasChildren()) {
        //     var u = new ProductionGraphUi(a, this.imageMap),
        //         c = this.infoContainer.find(".componentGraph");
        //     u.display(c);
        //     var l = this.infoContainer.find(".componentInfoArea"),
        //         h = l.width();
        //     l.width(h - c.width());
        // }
    });


    (InfoUI.prototype.hideInfo = function () {
        this.hideComponentStrategy(), this.infoContainer.html("");
    });


    (InfoUI.prototype.showDefaultInfo = function () {
        console.log("[InfoUI] showDefaultInfo called");
        console.log("[InfoUI] Dev mode:", this.play.isDevMode());
        console.log("[InfoUI] Hostname:", window.location.hostname);

        if (!this.play.isDevMode()) {
            console.log("[InfoUI] Not in dev mode, hiding info");
            return void this.hideInfo();
        }

        console.log("[InfoUI] In dev mode, showing incomes data");
        this.showIncomesData();
    });


    (InfoUI.prototype.showIncomesData = function () {
        this.hideInfo();
        var e = this.statistics.getFactoryAvgResearchPointsProduction(this.factory.getMeta().id),
            t = e * this.game.getTicker().getTicksPerSec();
        isNaN(t) && (t = 0);
        var n = this.statistics.getFactoryAvgProfit(this.factory.getMeta().id),
            i = n * this.game.getTicker().getTicksPerSec();
        isNaN(i) && (i = 0);
        var r = '<table cellspacing="0" cellpadding="0" border="0">';
        (r += "<tr>"),
            (r += '<td align="center" width="100"></td>'),
            (r += '<td align="center" width="100"><b>15min</b></td>'),
            (r += '<td align="center" width="100"><b>1h</b></td>'),
            (r += '<td align="center" width="100"><b>24h</b></td>'),
            (r += '<td align="center" width="100"><b>1 week</b></td>'),
            (r += "<tr>"),
            (r += "<tr>"),
            (r += '<td align="center" ><b class="research">Research:</b></td>'),
            (r += '<td align="center" class="research">' + nf(15 * t * 60) + "</td>"),
            (r += '<td align="center" class="research">' + nf(60 * t * 60) + "</td>"),
            (r += '<td align="center" class="research">' + nf(60 * t * 60 * 24) + "</td>"),
            (r += '<td align="center" class="research">' + nf(60 * t * 60 * 24 * 7) + "</td>"),
            (r += "<tr>"),
            (r += "<tr>"),
            (r += '<td align="center" ><b class="money">Money</b></td>'),
            (r += '<td align="center" class="money">$' + nf(15 * i * 60) + "</td>"),
            (r += '<td align="center" class="money">$' + nf(60 * i * 60) + "</td>"),
            (r += '<td align="center" class="money">$' + nf(60 * i * 60 * 24) + "</td>"),
            (r += '<td align="center" class="money">$' + nf(60 * i * 60 * 24 * 7) + "</td>"),
            (r += "<tr>"),
            (r += "<tr>"),
            (r += '<td align="center" width="100"></td>'),
            (r += '<td align="center" width="100"><a href="javascript:void(0)" class="passTime" style="color:white" data-amount="15">PASS</a></td>'),
            (r += '<td align="center" width="100"><a href="javascript:void(0)" class="passTime" style="color:white" data-amount="60">PASS</a></td>'),
            (r += '<td align="center" width="100"><a href="javascript:void(0)" class="passTime" style="color:white" data-amount="1440">PASS</a></td>'),
            (r += '<td align="center" width="100"><a href="javascript:void(0)" class="passTime" style="color:white" data-amount="10080">PASS</a></td>'),
            (r += "<tr>"),
            (r += "</table>"),
            this.infoContainer.html(r);
        var self = this;
        this.infoContainer.find(".passTime").click(function (e) {
            var t = $(e.target).attr("data-amount");
            // PassTimeAction functionality commented out - dependency not available
            // new PassTimeAction(self.game, 60 * t).passTime();
            console.log("Pass time functionality not implemented yet - amount:", t);
        });
    });


    (InfoUI.prototype.destroy = function () {
        this.factory.getEventManager().removeListenerForType(componentInfoUi), this.container.html(""), (this.container = null);
    });


    return InfoUI;

});
