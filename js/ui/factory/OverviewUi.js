// src/ui/factory/OverviewUi.js
import template from '../../template/factory/overview.html?raw';
import Handlebars from "handlebars";
import numberFormat from "/js/base/NumberFormat.js"
import GameEvent from "/js/config/event/GameEvent.js"

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
    this.container.insertAdjacentHTML("beforeend", 
      Handlebars.compile(template)({
        researchBought: Boolean(this.game.getResearchManager().getResearch('researchCenter')),
      })
    );

    // Update every game tick
    this.game.getEventManager().addListener('factoryOverviewUi', GameEvent.GAME_TICK, () => {
      this.update();
    });

    this.update();
  }

  update() {
    if (!this.container) return;
    // Update money and research points
    const { game, statistics, factory, container } = this;
    const money = this.container.querySelector('#money');
    money.textContent = numberFormat.formatNumber(this.game.getMoney());
    const research = this.container.querySelector('#research');
    if (research && game.getResearchPoints()) {
      research.textContent = numberFormat.formatNumber(game.getResearchPoints());
    }

    // Income
    const avgProfit = statistics.getFactoryAvgProfit(factory.getMeta().id);
    const profitPerSec = avgProfit * game.getTicker().getTicksPerSec();

    const income = container.querySelector("#income");
    if (income) income.textContent = numberFormat.formatNumber(avgProfit);

    const incomeRate = container.querySelector("#incomePerSec");
    if (incomeRate) incomeRate.textContent = numberFormat.formatNumber(profitPerSec);

    // Research income + ticks
    const avgResearch = statistics.getFactoryAvgResearchPointsProduction(factory.getMeta().id);
    const researchIncome = container.querySelector("#researchIncome");
    if (researchIncome) researchIncome.textContent = numberFormat.formatNumber(avgResearch);

    const ticks = container.querySelector("#ticks");
    if (ticks) ticks.textContent = numberFormat.formatNumber(game.getTicker().getActualTicksPerSec());
  }

  destroy() {
    this.game.getEventManager().removeListenerForType('factoryOverviewUi');
    if (this.container) {
      this.container.innerHTML = '';
      this.container = null;
  
    }
  }
}
export default OverviewUi;
