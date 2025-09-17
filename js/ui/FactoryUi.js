import Handlebars from "handlebars";
import factoryTemplateHtml from "../template/factory.html";
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
    constructor(factory, play, imageMap) {
        this.globalUiEm = GlobalUiBus;
        this.play = play;
        this.factory = factory;
        this.game = factory.getGame();
        this.gameUiEm = this.game.getEventManager();
        this.statistics = this.game.getStatistics();
        this.imageMap = imageMap;

        this.menuUi = new MenuUi(factory);
        this.mapUi = new MapUi(factory);
        this.componentsUi = new ComponentsUi(factory);
        this.mapToolsUi = new MapToolsUi(factory);
        this.infoUi = new InfoUi(factory, this.statistics, play, this.imageMap);
        this.controlsUi = new ControlsUi(factory);
        this.overviewUi = new OverviewUi(factory, this.statistics);
        this.incentivizedAdButtonUi = new IncentivizedAdButtonUi(play);
    }

    display(container) {
        this.container = container;
        this.mainContainer = this.container.querySelector(".main");
        this.container.insertAdjacentHTML("beforeend", Handlebars.compile(factoryTemplateHtml)());

        if (this.game.getIsPremium()) {
            this.mainContainer.classList.toggle("fullScreen", true);
            const mapContainer = this.container.querySelector(".mapContainer");
            mapContainer.style.width = `${window.innerWidth - 250}px`;
            mapContainer.style.height = `${window.innerHeight - 150}px`;
        }

        this.menuUi.display(this.container.querySelector(".menuContainer"));
        this.mapUi.display(this.container.querySelector(".mapContainer"));
        this.componentsUi.display(this.container.querySelector(".componentsContainer"));
        this.infoUi.display(this.container.querySelector(".infoContainer"));
        this.controlsUi.display(this.container.querySelector(".controlsContainer"));
        this.overviewUi.display(this.container.querySelector(".overviewContainer"));
        if (this.play.isDevMode()) {
            this.mapToolsUi.display(this.container.querySelector(".mapToolsContainer"));
        }
        this.incentivizedAdButtonUi.display(this.container.querySelector(".incentivizedAd"));
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
        this.container.innerHTML = ""; 
        this.container = null;
        this.mainContainer = this.container.querySelector(".main");

        this.mainContainer.classList.toggle("fullScreen", false);
    }
}
