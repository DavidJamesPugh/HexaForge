// src/ui/factory/OverviewUi.js
import template from '../../template/factory/overview.html';

class OverviewUi {
  constructor(factory, statistics) {
    this.factory = factory;
    this.game = factory.getGame();
    this.statistics = statistics;
    this.container = null;
  }

  display(container) {
    this.container = container;
    // Render the template with initial data
    this.container.html(
      Handlebars.compile(template)({
        researchBought: !!this.game.getResearchManager().getResearch('researchCenter'),
      })
    );

    // Update every game tick
    this.game.getEventManager().addListener('factoryOverviewUi', GameEvent.GAME_TICK, () => {
      this.update();
    });

    this.update();
  }

  update() {
    // Update money and research points
    $('#money').html(nf(this.game.getMoney()));
    $('#research').html(nf(this.game.getResearchPoints()));

    // Update income
    const avgProfit = this.statistics.getFactoryAvgProfit(this.factory.getMeta().id);
    const profitPerSec = avgProfit * this.game.getTicker().getTicksPerSec();
    $('#income').html(nf(avgProfit));
    $('#incomePerSec').html(nf(profitPerSec));

    // Update research income and ticks
    const avgResearch = this.statistics.getFactoryAvgResearchPointsProduction(this.factory.getMeta().id);
    $('#researchIncome').html(nf(avgResearch));
    $('#ticks').html(nf(this.game.getTicker().getActualTicksPerSec()));
  }

  destroy() {
    this.game.getEventManager().removeListenerForType('factoryOverviewUi');
    if (this.container) this.container.html('');
    this.container = null;
  }
}

export default OverviewUi;
