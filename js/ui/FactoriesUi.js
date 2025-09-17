import Handlebars from "handlebars";
import factoriesTemplateHtml from "../template/factories.html?raw";
import AlertUi from "./helper/AlertUi.js";
import BuyFactoryAction from "../game/action/BuyFactoryAction.js";
import GameUiEvent from "../config/event/GameUiEvent.js";
import GlobalUiEvent from "../config/event/GlobalUiEvent.js";
import GameContext from "../base/GameContext.js";
import GlobalUiBus from "../base/GlobalUiBus.js";
import NumberFormat from "../base/NumberFormat.js";

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
                price: NumberFormat.format(factory.price),
                isBought: f.getIsBought(),
                isPaused: f.getIsPaused(),
            });
        }

        this.container.innerHTML = (
            Handlebars.compile(factoriesTemplateHtml)({
                factories: factoriesData,
                researchBought: !!this.game.getResearchManager().getResearch("researchCenter"),
            })
        );

        this.container.querySelectorAll(".selectButton").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const factoryId = e.target.dataset.id;
                this.gameUiEm.invokeEvent(GameUiEvent.SHOW_FACTORY, factoryId);
            });
        });
        
        this.container.querySelectorAll(".buyButton").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const factoryId = e.target.dataset.id;
                const action = new BuyFactoryAction(this.game, factoryId);
                if (action.canBuy()) {
                    action.buy();
                    this.gameUiEm.invokeEvent(GameUiEvent.SHOW_FACTORY, factoryId);
                } else {
                    new AlertUi("", "You don't have enough money to buy this factory!").display();
                }
            });
        });

        // Listen for game ticks to update UI
        this.game.getEventManager().addListener("factoriesUi", GameUiEvent.GAME_TICK, () => this.update());

        this.update();

    }

    updateText(selector, value) {
        const el = this.container.querySelector(selector);
        if (el) el.textContent = value;
    }

    update() {
        this.updateText("#money", this.game.getMoney());
        this.updateText("#researchPoints", this.game.getResearchPoints());


        const avgProfit = this.statistics.getAvgProfit();

        this.updateText("#income", avgProfit ? NumberFormat.formatNumber(avgProfit) : " ? ");

        const avgResearch = this.statistics.getAvgResearchPointsProduction();
        this.updateText("#researchIncome", avgResearch ? NumberFormat.formatNumber(avgResearch) : " ? ");

        this.container.querySelectorAll(".factoryButton").forEach(el => {
            const factoryId = el.getAttribute("data-id");

            const avgIncome = this.statistics.getFactoryAvgProfit(factoryId);
            this.updateText(".money[data-key='income']", avgIncome ? NumberFormat.formatNumberPlus(avgIncome) : " ? ");

            // Research production
            const avgResearchPoints = this.statistics.getFactoryAvgResearchPointsProduction(factoryId);
            this.updateText(".research[data-key='researchProduction']", avgResearchPoints ? NumberFormat.formatNumberPlus(avgResearchPoints) : " ? ");

            // Buy button
            const canBuy = new BuyFactoryAction(this.game, factoryId).canBuy();
            const buyBtn = el.querySelector(".buyButton");
            if (buyBtn) {
                if (canBuy) {
                buyBtn.classList.remove("cantBuy");
                buyBtn.textContent = "BUY";
                } else {
                buyBtn.classList.add("cantBuy");
                buyBtn.textContent = "TOO EXPENSIVE";
                }
            }
            });

        this.updateText("#ticks", NumberFormat.formatNumber(this.game.getTicker().getActualTicksPerSec()));
    }

    destroy() {
        this.globalUiEm.removeListenerForType("factoriesUi");
        this.gameUiEm.removeListenerForType("factoriesUi");
        this.game.getEventManager().removeListenerForType("factoriesUi");
        if (this.container) {
            this.container.textContent = "";
            this.container = null;
        }
    }
}
