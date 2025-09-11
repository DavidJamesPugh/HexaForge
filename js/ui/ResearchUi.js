// src/ui/ResearchUi.js
import template from '/js/template/research.html';
import BuyResearch from '/js/game/action/BuyResearch.js';

class ResearchUi {
  constructor(gameUiEm, game) {
    this.gameUiEm = gameUiEm;
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
          price: canBuy ? nf(researchManager.getPrice(res.id)) : null,
          priceResearchPoints: canBuy ? nf(researchManager.getPriceResearchPoints(res.id)) : null,
          max: res.max,
          showBoughtAndMax: res.max > 1,
          iconStyle: `background-position: -${26 * res.iconX}px -${26 * res.iconY}px`,
        });
      }
    }

    // Render template
    this.container.html(Handlebars.compile(template)({
      research: researchData,
      max: totalMax,
      have: totalHave,
    }));

    // Back button
    this.container.find('.backButton').off('click').on('click', () => {
      this.gameUiEm.invokeEvent(GameUiEvent.SHOW_FACTORY);
    });

    // Buy buttons
    this.container.find('.researchItem').each((_, el) => {
      const id = $(el).attr('data-id');
      $(el).find('.buyButton').off('click').on('click', () => {
        const action = new BuyResearch(this.game, id);
        if (action.canBuy()) {
          action.buy();
          this.refreshView();
        }
      });
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
    $('#researchPoints').html(nf(this.game.getResearchPoints()));
    $('#money').html(nf(this.game.getMoney()));

    this.container.find('.researchItem').each((_, el) => {
      const id = $(el).attr('data-id');
      const boughtEl = $(el).find('.bought');
      const buyButton = $(el).find('.buyButton');

      boughtEl.html(this.game.getResearchManager().getResearch(id));
      this.game.getResearchManager().couldPurchase(id) ? buyButton.show() : buyButton.hide();
      this.game.getResearchManager().canPurchase(id) ? buyButton.removeClass('cantBuy') : buyButton.addClass('cantBuy');
    });
  }

  destroy() {
    this.game.getEventManager().removeListenerForType('researchUi');
    this.gameUiEm.removeListenerForType('researchUi');
    if (this.container) this.container.html('');
    this.container = null;
  }
}

export default ResearchUi;
