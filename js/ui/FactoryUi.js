import Handlebars from "handlebars";
import factoryTemplateHtml from "../template/factory.html";
import imageMap from "../config/gameAssets.js";
import GameContext from "../base/GameContext.js";
import GlobalUiBus from "../base/GlobalUiBus.js";
import MenuUi from "./factory/MenuUi.js";
import MapUi from "./factory/MapUi.js";
import ComponentsUi from "./factory/ComponentsUi.js";
import InfoUi from "./factory/InfoUi.js";
import ControlsUi from "./factory/ControlsUi.js";
import MapToolsUi from "./factory/MapToolsUi.js";
import OverviewUi from "./factory/OverviewUi.js";
import IncentivizedAdButtonUi from "./IncentivizedAdButtonUi.js";

export default class FactoryUi {
    constructor(factory, play) {
        this.globalUiEm = GlobalUiBus;
        this.gameUiEm = GameContext.gameUiBus;
        this.factory = factory;
        this.play = play;
        this.imageMap = imageMap;
        this.game = factory.getGame();
        this.statistics = this.game.getStatistics();

        this.menuUi = new MenuUi(globalUiEm, gameUiEm, factory);
        this.mapUi = new MapUi(globalUiEm, imageMap, factory);
        this.componentsUi = new ComponentsUi(globalUiEm, factory);
        this.mapToolsUi = new MapToolsUi(factory);
        this.infoUi = new InfoUi(factory, this.statistics, play, imageMap);
        this.controlsUi = new ControlsUi(factory);
        this.overviewUi = new OverviewUi(factory, this.statistics);
        this.incentivizedAdButtonUi = new IncentivizedAdButtonUi(play);
    }

    display(container) {
        this.container = container;
        this.container.html(Handlebars.compile(factoryTemplateHtml)());

        if (this.game.getIsPremium()) {
            $(".main").addClass("fullScreen");
            const mapContainer = this.container.find(".mapContainer");
            mapContainer.css("width", $(window).width() - 250);
            mapContainer.css("height", $(window).height() - 150);
        }

        this.menuUi.display(this.container.find(".menuContainer"));
        this.mapUi.display(this.container.find(".mapContainer"));
        this.componentsUi.display(this.container.find(".componentsContainer"));
        this.infoUi.display(this.container.find(".infoContainer"));
        this.controlsUi.display(this.container.find(".controlsContainer"));
        this.overviewUi.display(this.container.find(".overviewContainer"));
        if (this.play.isDevMode()) {
            this.mapToolsUi.display(this.container.find(".mapToolsContainer"));
        }
        this.incentivizedAdButtonUi.display(this.container.find(".incentivizedAd"));
    }

    destroy() {
        this.mapUi.destroy();
        this.componentsUi.destroy();
        this.infoUi.destroy();
        this.controlsUi.destroy();
        this.overviewUi.destroy();
        this.mapToolsUi.destroy();
        this.incentivizedAdButtonUi.destroy();

        this.game.getEventManager().removeListenerForType("FactoryUi");
        this.container.html("");
        this.container = null;

        $(".main").removeClass("fullScreen");
    }
}
