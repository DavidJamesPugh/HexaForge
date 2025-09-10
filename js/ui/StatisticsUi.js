import Handlebars from "handlebars";
import statisticsTemplateHtml from "../template/statistics.html";
import Meta from "../config/Meta.js";
import ProductionIndex from "../game/misc/productionTree/ProductionIndex.js";
import ProductionGraphUi from "../game/misc/productionTree2/ProductionGraphUi.js";
import ProductionTreeBuilder from "../game/misc/productionTree2/ProductionTreeBuilder.js";
import GameUiEvent from "../config/event/GameUiEvent.js";
import GameEvent from "../config/event/GameEvent.js";
import GameContext from "../base/GameContext.js";
import imageMap from "../config/gameAssets.js";

export default class StatisticsUi {
    constructor(factory) {
        this.gameUiEm = GameContext.gameUiBus;
        this.factory = factory;
        this.imageMap = imageMap;
        this.game = factory.getGame();
        this.manager = this.game.getAchievementsManager();
        this.container = null;
    }

    display(container) {
        this.container = container;

        // Render template
        this.container.html(Handlebars.compile(statisticsTemplateHtml)({}));

        // Back button → return to factory view
        this.container.find(".backButton").click(() => {
            this.gameUiEm.invokeEvent(GameUiEvent.SHOW_FACTORY);
        });

        // Subscribe to game tick updates
        this.game.getEventManager().addListener("statisticsUi", GameEvent.GAME_TICK, () => {
            this.update();
        });

        // Build and render production graph
        const tree = new ProductionTreeBuilder(this.factory).buildTree("tankSeller", 100);
        new ProductionGraphUi(tree, this.imageMap).display(this.container.find(".graph"));

        // First update
        this.update();
    }

    update() {
        // TODO: Add statistics update logic here
    }

    destroy() {
        this.game.getEventManager().removeListenerForType("statisticsUi");
        this.gameUiEm.removeListenerForType("statisticsUi");
        if (this.container) {
            this.container.html("");
            this.container = null;
        }
    }
}
