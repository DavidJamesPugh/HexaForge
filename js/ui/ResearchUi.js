// src/ui/ResearchUi.js
import Handlebars from "handlebars";
import template from '/js/template/research.html?raw';
import BuyResearch from '/js/game/action/BuyResearch.js';
import GameContext from "../base/GameContext.js";
import numberFormat from '../base/NumberFormat.js';
import GameEvent from "../config/event/GameEvent.js";
import GameUiEvent from "../config/event/GameUiEvent.js";

class ResearchUi {
  constructor(game) {
    this.gameUiEm = GameContext.gameUiBus;
    this.game = game;
    this.container = null;
  }

  display(container) {
    this.container = container;
    const researchManager = this.game.getResearchManager();

    // Total max and current research
    let totalMax = 0;
    let totalHave = 0;
    for (const res of this.game.getMeta().research) {
      totalMax += res.max || 0;
      totalHave += researchManager.getResearch(res.id);
    }

    // Build display data
    const researchData = [];
    for (const res of this.game.getMeta().research) {
      if (researchManager.isVisible(res.id)) {
        const canBuy = !res.max || researchManager.getResearch(res.id) < res.max;
        researchData.push({
          id: res.id,
          name: res.name,
          description: res.description,
          price: canBuy ? numberFormat.formatNumber(researchManager.getPrice(res.id)) : null,
          priceResearchPoints: canBuy ? numberFormat.formatNumber(researchManager.getPriceResearchPoints(res.id)) : null,
          max: res.max,
          showBoughtAndMax: res.max > 1,
          iconStyle: `background-position: -${26 * res.iconX}px -${26 * res.iconY}px`,
        });
      }
    }

    // Render template
    this.container.insertAdjacentHTML("beforeend", Handlebars.compile(template)({
      research: researchData,
      max: totalMax,
      have: totalHave,
    }));

    // Back button
    this.onBackButtonClick = () => {
      this.gameUiEm.invokeEvent(GameUiEvent.SHOW_FACTORY);
    };
    
    // Later in display():
    const btn = this.container.querySelector('.backButton');
    if (btn) {
      btn.removeEventListener("pointerdown", this.onBackButtonClick); // old one out
      btn.addEventListener("pointerdown", this.onBackButtonClick);    // new one in
    }


    this.buyResearch = (id) => {
      const action = new BuyResearch(this.game, id);
        if (action.canBuy()) {
          action.buy();
          this.refreshView();
        }
    };
    // Buy buttons
    this.container.querySelectorAll('.researchItem').forEach((el) => {
      const id = el.dataset.id;
      el.removeEventListener("pointerdown", this.buyResearch);
      el.addEventListener("pointerdown", () => this.buyResearch(id));
    });

    // Game tick listener
    this.game.getEventManager().addListener('researchUi', GameEvent.GAME_TICK, () => this.update());
    this.update();
  }

  refreshView() {
    const currentContainer = this.container;
    this.destroy();
    this.display(currentContainer);
  }

  update() {
    const researchPoints = this.container.querySelector('#researchPoints');
    researchPoints.textContent = numberFormat.formatNumber(this.game.getResearchPoints());
    const money = this.container.querySelector('#money');
    money.textContent = numberFormat.formatNumber(this.game.getMoney());

    this.container.querySelectorAll('.researchItem').forEach((el) => {
      const id = el.dataset.id;
      const boughtEl = el.querySelector('.bought');
      const buyButton = el.querySelector('.buyButton');

    const couldBuy = this.game.getResearchManager().couldPurchase(id);
    buyButton.style.display = couldBuy ? '' : 'none';

    const canBuy = this.game.getResearchManager().canPurchase(id);
    buyButton.classList.toggle('cantBuy', !canBuy);
    });
  }

  destroy() {
    this.game.getEventManager().removeListenerForType('researchUi');
    this.gameUiEm.removeListenerForType('researchUi');
    if (this.container) this.container.innerHTML = '';
    this.container = null;
  }
}

export default ResearchUi;
