import Handlebars from "handlebars";
import factoriesTemplateHtml from "../template/factories.html?raw";
import AlertUi from "./helper/AlertUi.js";
import BuyFactoryAction from "../game/action/BuyFactoryAction.js";
import GameUiEvent from "../config/event/GameUiEvent.js";
import GameEvent from "../config/event/GameEvent.js";
import GlobalUiEvent from "../config/event/GlobalUiEvent.js";
import GameContext from "../base/GameContext.js";
import GlobalUiBus from "../base/GlobalUiBus.js";
import NumberFormat from "../base/NumberFormat.js";
import BackgroundLayer from "./factory/mapLayers/BackgroundLayer.js";

export default class FactoriesUi {
    constructor(game, imageMap) {
        this.globalUiEm = GlobalUiBus;
        this.gameUiEm = GameContext.gameUiBus;
        this.game = game;
        this.imageMap = imageMap;
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
                isDevMode: this.game.isDevMode,
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

        this.container.querySelectorAll(".devEnterButton").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const factoryId = e.target.dataset.id;
                this.gameUiEm.invokeEvent(GameUiEvent.SHOW_FACTORY, factoryId);
            });
        });

        this._renderPreviews();

        this.game.getEventManager().addListener("factoriesUi", GameEvent.GAME_TICK, () => this.update());

        this.update();

    }

    _renderPreviews() {
        if (!this.imageMap) return;

        const tileSize = 21;
        const factoriesMeta = this.game.getMeta().factories;

        for (const meta of factoriesMeta) {
            const factory = this.game.getFactory(meta.id);
            const el = this.container.querySelector(`.factoryPreview[data-id="${meta.id}"]`);
            if (!el) continue;

            const isBought = factory.getIsBought();

            if (!isBought && !this.game.isDevMode) {
                el.classList.add("locked");
                continue;
            }

            const tempContainer = document.createElement("div");
            const bgLayer = new BackgroundLayer(this.imageMap, factory, { tileSize });
            bgLayer.display(tempContainer);
            const bgCanvas = bgLayer.getCanvas();

            const thumb = document.createElement("canvas");
            const mapW = meta.tilesX * tileSize;
            const mapH = meta.tilesY * tileSize;
            thumb.width = mapW;
            thumb.height = mapH;
            const ctx = thumb.getContext("2d");
            ctx.drawImage(bgCanvas, 0, 0);

            if (isBought) {
                const compSprite = this.imageMap.getImage("components");
                if (compSprite) {
                    for (const tile of factory.getTiles()) {
                        if (tile.getComponent()) {
                            const comp = tile.getComponent();
                            const compMeta = comp.getMeta();
                            if (tile.getX() === comp.getX() && tile.getY() === comp.getY()) {
                                const iconX = (compMeta.iconPosition?.[0] ?? 0) * (tileSize + 1);
                                const iconY = (compMeta.iconPosition?.[1] ?? 0) * (tileSize + 1);
                                const w = (compMeta.width || 1) * tileSize;
                                const h = (compMeta.height || 1) * tileSize;
                                ctx.drawImage(compSprite,
                                    iconX, iconY, w, h,
                                    tile.getX() * tileSize, tile.getY() * tileSize, w, h);
                            }
                        }
                    }
                }
            }

            bgLayer.destroy();
            el.style.backgroundImage = `url(${thumb.toDataURL("image/png")})`;
        }
    }

    updateText(selector, value) {
        const el = this.container.querySelector(selector);
        if (el) el.textContent = value;
    }

    update() {
        this.updateText("#moneyValue", this.game.getMoney());
        
        this.updateText("#researchPoints", this.game.getResearchPoints());
        this.updateText("#unrestValue", NumberFormat.formatNumber(this.game.getUnrest()));
        this.updateText("#influenceValue", NumberFormat.formatNumber(this.game.getInfluence()));


        const avgProfit = this.statistics.getAvgProfit();
        this.updateText(
            "#incomeValue",
            avgProfit == null || Number.isNaN(avgProfit) ? " ? " : NumberFormat.formatNumber(avgProfit)
        );

        const avgResearch = this.statistics.getAvgResearchPointsProduction();
        this.updateText(
            "#researchIncome",
            avgResearch == null || Number.isNaN(avgResearch) ? " ? " : NumberFormat.formatNumber(avgResearch)
        );

        this.container.querySelectorAll(".factoryButton").forEach((el) => {
            const factoryId = el.getAttribute("data-id");

            const incomeLine = el.querySelector(".textLine.money[data-key='income']");
            const avgIncome = this.statistics.getFactoryAvgProfit(factoryId);
            if (incomeLine) {
                incomeLine.textContent =
                    avgIncome == null || Number.isNaN(avgIncome)
                        ? " ? "
                        : NumberFormat.formatNumberPlus(avgIncome);
            }

            const researchLine = el.querySelector(".textLine.research[data-key='researchProduction']");
            const avgResearchPoints = this.statistics.getFactoryAvgResearchPointsProduction(factoryId);
            if (researchLine) {
                researchLine.textContent =
                    avgResearchPoints == null || Number.isNaN(avgResearchPoints)
                        ? " ? "
                        : NumberFormat.formatNumberPlus(avgResearchPoints);
            }

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
