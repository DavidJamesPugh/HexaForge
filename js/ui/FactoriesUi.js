import Handlebars from "handlebars";
import factoriesTemplateHtml from "../template/factories.html";
import AlertUi from "./helper/AlertUi.js";
import BuyFactoryAction from "../game/action/BuyFactoryAction.js";
import GameUiEvent from "../config/event/GameEvent.js";
import GlobalUiEvent from "../config/event/GlobalUiEvent.js";
import GameContext from "../base/GameContext.js";
import GlobalUiBus from "../base/GlobalUiBus.js";

export default class FactoriesUi {
    constructor(game) {
        this.globalUiEm = GlobalUiBus;
        this.gameUiEm = GameContext.gameUiBus;
        this.game = game;
        this.statistics = game.getStatistics();
        this.container = null;
    }

    display(container) {
        this.container = container;
        const factoriesData = [];
        const factoriesMeta = this.game.getMeta().factories;

        for (const factory of factoriesMeta) {
            const f = this.game.getFactory(factory.id);
            factoriesData.push({
                id: factory.id,
                name: factory.name,
                price: nf(factory.price),
                isBought: f.getIsBought(),
                isPaused: f.getIsPaused(),
            });
        }

        this.container.html(
            Handlebars.compile(factoriesTemplateHtml)({
                factories: factoriesData,
                researchBought: !!this.game.getResearchManager().getResearch("researchCenter"),
            })
        );

        // Button handlers
        this.container.find(".selectButton").click((e) => {
            const factoryId = $(e.target).attr("data-id");
            this.gameUiEm.invokeEvent(GameUiEvent.SHOW_FACTORY, factoryId);
        });

        this.container.find(".buyButton").click((e) => {
            const factoryId = $(e.target).attr("data-id");
            const action = new BuyFactoryAction(this.game, factoryId);
            if (action.canBuy()) {
                action.buy();
                this.gameUiEm.invokeEvent(GameUiEvent.SHOW_FACTORY, factoryId);
            } else {
                new AlertUi("", "You don't have enough money to buy this factory!").display();
            }
        });

        // Listen for game ticks to update UI
        this.game.getEventManager().addListener("factoriesUi", GameUiEvent.GAME_TICK, () => this.update());

        this.update();

        $("#missionsButton").click(() => this.globalUiEm.invokeEvent(GlobalUiEvent.SHOW_MISSIONS));
        $("#missionsButton").hide();
    }

    update() {
        this.container.find("#money").html(nf(this.game.getMoney()));
        this.container.find("#researchPoints").html(nf(this.game.getResearchPoints()));

        const avgProfit = this.statistics.getAvgProfit();
        this.container.find("#income").html(avgProfit ? nf(avgProfit) : " ? ");

        const avgResearch = this.statistics.getAvgResearchPointsProduction();
        this.container.find("#researchIncome").html(avgResearch ? nf(avgResearch) : " ? ");

        this.container.find(".factoryButton").each((_, el) => {
            const factoryId = $(el).attr("data-id");

            const avgIncome = this.statistics.getFactoryAvgProfit(factoryId);
            $(el).find(".money[data-key='income']").html(avgIncome ? nfPlus(avgIncome) : " ? ");

            const avgResearchPoints = this.statistics.getFactoryAvgResearchPointsProduction(factoryId);
            $(el).find(".research[data-key='researchProduction']").html(avgResearchPoints ? nfPlus(avgResearchPoints) : " ? ");

            const canBuy = new BuyFactoryAction(this.game, factoryId).canBuy();
            const buyBtn = $(el).find(".buyButton");
            if (canBuy) {
                buyBtn.removeClass("cantBuy").html("BUY");
            } else {
                buyBtn.addClass("cantBuy").html("TOO EXPENSIVE");
            }
        });

        this.container.find("#ticks").html(nf(this.game.getTicker().getActualTicksPerSec()));
    }

    destroy() {
        this.globalUiEm.removeListenerForType("factoriesUi");
        this.gameUiEm.removeListenerForType("factoriesUi");
        this.game.getEventManager().removeListenerForType("factoriesUi");
        if (this.container) {
            this.container.html("");
            this.container = null;
        }
    }
}
