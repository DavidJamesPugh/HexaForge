// src/ui/ResearchUi.js
import Handlebars from "handlebars";
import template from "/js/template/research.html?raw";
import BuyResearch from "/js/game/action/BuyResearch.js";
import GameContext from "../base/GameContext.js";
import numberFormat from "../base/NumberFormat.js";
import GameEvent from "../config/event/GameEvent.js";
import bindDrawerOverlayClose, { openDrawerAnimation } from "./helper/bindDrawerOverlayClose.js";

class ResearchUi {
  constructor(game) {
    this.gameUiEm = GameContext.gameUiBus;
    this.game = game;
    this.container = null;
    this.bg = null;
    this.panel = null;
  }

  display() {
    const researchManager = this.game.getResearchManager();

    let totalMax = 0;
    let totalHave = 0;
    for (const res of this.game.getMeta().research) {
      totalMax += res.max || 0;
      totalHave += researchManager.getResearch(res.id);
    }

    const researchData = [];
    for (const res of this.game.getMeta().research) {
      if (researchManager.isVisible(res.id)) {
        const canBuy = !res.max || researchManager.getResearch(res.id) < res.max;
        researchData.push({
          id: res.id,
          name: res.name,
          description: res.description,
          price: canBuy ? numberFormat.formatNumber(researchManager.getPrice(res.id)) : null,
          priceResearchPoints: canBuy
            ? numberFormat.formatNumber(researchManager.getPriceResearchPoints(res.id))
            : null,
          max: res.max,
          showBoughtAndMax: res.max > 1,
          iconStyle: `background-position: -${26 * res.iconX}px -${26 * res.iconY}px`,
        });
      }
    }

    document.body.insertAdjacentHTML(
      "beforeend",
      Handlebars.compile(template)({
        research: researchData,
        max: totalMax,
        have: totalHave,
      })
    );

    this.bg = document.getElementById("researchBg");
    this.panel = document.getElementById("researchDrawer");
    this.container = this.panel?.querySelector(".researchBox") ?? null;

    bindDrawerOverlayClose(this.bg, this.panel, this.gameUiEm);
    openDrawerAnimation(this.bg, this.panel);

    this.container.querySelectorAll(".researchItem").forEach((el) => {
      const id = el.dataset.id;
      el.addEventListener("pointerdown", () => this.buyResearch(id));
    });

    this.game.getEventManager().addListener("researchUi", GameEvent.GAME_TICK, () => this.update());
    this.update();
  }

  buyResearch(id) {
    const action = new BuyResearch(this.game, id);
    if (action.canBuy()) {
      action.buy();
      this.refreshView();
    }
  }

  refreshView() {
    this.destroy();
    this.display();
  }

  update() {
    if (!this.container) return;
    const researchPoints = this.container.querySelector("#researchPoints");
    if (researchPoints) {
      researchPoints.textContent = numberFormat.formatNumber(this.game.getResearchPoints());
    }
    const money = this.container.querySelector("#money");
    if (money) {
      money.textContent = numberFormat.formatNumber(this.game.getMoney());
    }

    this.container.querySelectorAll(".researchItem").forEach((el) => {
      const id = el.dataset.id;
      const buyButton = el.querySelector(".buyButton");

      const couldBuy = this.game.getResearchManager().couldPurchase(id);
      buyButton.style.display = couldBuy ? "" : "none";

      const canBuy = this.game.getResearchManager().canPurchase(id);
      buyButton.classList.toggle("cantBuy", !canBuy);
    });
  }

  destroy() {
    this.game.getEventManager().removeListenerForType("researchUi");
    this.gameUiEm.removeListenerForType("researchUi");
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

export default ResearchUi;
