import Handlebars from "handlebars";
import statisticsTemplateHtml from "../template/statistics.html?raw";
import ProductionGraphUi from "../game/misc/productionTree2/ProductionGraphUi.js";
import ProductionTreeBuilder from "../game/misc/productionTree2/ProductionTreeBuilder.js";
import GameEvent from "../config/event/GameEvent.js";
import GameContext from "../base/GameContext.js";
import bindDrawerOverlayClose, { openDrawerAnimation } from "./helper/bindDrawerOverlayClose.js";

export default class StatisticsUi {
    constructor(factory, imageMap) {
        this.gameUiEm = GameContext.gameUiBus;
        this.factory = factory;
        this.imageMap = imageMap;
        this.game = factory.getGame();
        this.container = null;
        this.bg = null;
        this.panel = null;
    }

    display() {
        document.body.insertAdjacentHTML(
            "beforeend",
            Handlebars.compile(statisticsTemplateHtml)({})
        );

        this.bg = document.getElementById("statisticsBg");
        this.panel = document.getElementById("statisticsDrawer");
        this.container = this.panel?.querySelector(".statisticsBox") ?? null;

        bindDrawerOverlayClose(this.bg, this.panel, this.gameUiEm);
        openDrawerAnimation(this.bg, this.panel);

        this.game.getEventManager().addListener("statisticsUi", GameEvent.GAME_TICK, () => {
            this.update();
        });

        const tree = new ProductionTreeBuilder(this.factory).buildTree("ironSeller", 100);
        new ProductionGraphUi(tree, this.imageMap).display(this.container.querySelector(".graph"));

        this.update();
    }

    update() {
        // TODO: Add statistics update logic here
    }

    destroy() {
        this.game.getEventManager().removeListenerForType("statisticsUi");
        this.gameUiEm.removeListenerForType("statisticsUi");
        if (this.bg) {
            this.bg.remove();
            this.bg = null;
        }
        if (this.panel) {
            this.panel.remove();
            this.panel = null;
        }
        this.container = null;
    }
}
