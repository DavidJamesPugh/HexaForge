// ui/factory/InfoUi.js
import infoTemplate from "../../template/factory/info.html?raw";
import infoDetailsTemplate from "../../template/factory/infoDetails.html?raw";
import Component from "../../game/Component.js";
import Sorter from "../../ui/factory/componentUi/Sorter.js";
import ProductionGraphUi from "../../game/misc/productionTree2/ProductionGraphUi";
import ProductionTreeBuilder from "../../game/misc/productionTree2/ProductionTreeBuilder.js";
import PassTimeAction from "../../game/action/PassTimeAction";
import Handlebars from "handlebars";
import FactoryEvent from "../../config/event/FactoryEvent.js";
import numberFormat from "/js/base/NumberFormat.js"

export default class InfoUi {
  constructor(factory, statistics, play, imageMap) {
    this.factory = factory;
    this.game = factory.getGame();
    this.statistics = statistics;
    this.play = play;
    this.imageMap = imageMap;

    this.selectedPosition = null;
    this.hoveredComponentMetaId = null;
    this.selectedComponentMetaId = null;
    this.selectedComponent = null;

    this.componentStrategies = { sorter: Sorter };
    this.displayedStrategy = null;
    this.displayedStrategyComponent = null;

    this.container = null;
    this.infoContainer = null;
    this.controlsContainer = null;

    this.listenerKey = "componentInfoUi";
  }

  display(container) {
    this.container = container;
    this.container.insertAdjacentHTML("beforeend",Handlebars.compile(infoTemplate)({}));
    this.infoContainer = this.container.querySelector(".componentInfo");
    this.controlsContainer = this.container.querySelector(".componentControls");

    const em = this.factory.getEventManager();

    em.addListener(this.listenerKey, FactoryEvent.FACTORY_MOUSE_MOVE, e => {
      this.selectedPosition = e;
      this.checkWhatShouldBeDisplayed();
    });

    em.addListener(this.listenerKey, FactoryEvent.FACTORY_MOUSE_OUT, () => {
      this.selectedPosition = null;
      this.checkWhatShouldBeDisplayed();
    });

    em.addListener(this.listenerKey, FactoryEvent.FACTORY_TICK, () => {
      this.checkWhatShouldBeDisplayed();
    });

    em.addListener(this.listenerKey, FactoryEvent.REFRESH_COMPONENT_INFO, () => {
      this.checkWhatShouldBeDisplayed();
    });

    em.addListener(this.listenerKey, FactoryEvent.HOVER_COMPONENT_META, id => {
      this.hoveredComponentMetaId = id;
      this.checkWhatShouldBeDisplayed();
    });

    em.addListener(this.listenerKey, FactoryEvent.COMPONENT_META_SELECTED, id => {
      this.selectedComponentMetaId = id;
      this.selectedComponent = null;
      this.checkWhatShouldBeDisplayed();
    });

    em.addListener(this.listenerKey, FactoryEvent.COMPONENT_SELECTED, comp => {
      this.selectedComponent = comp;
      this.checkWhatShouldBeDisplayed();
    });
  }

  checkWhatShouldBeDisplayed() {
    if (this.hoveredComponentMetaId) {
      this.showComponentMetaInfo(this.hoveredComponentMetaId);
      this.hideComponentStrategy();
    } else if (this.selectedComponent) {
      this.showComponentInfo(this.selectedComponent);
      this.showComponentStrategy(this.selectedComponent);
    } else if (this.selectedComponentMetaId) {
      this.showComponentMetaInfo(this.selectedComponentMetaId);
      this.hideComponentStrategy();
      
    } else if (this.selectedPosition) {
      this.showLocationInfo(this.selectedPosition.x, this.selectedPosition.y);
      this.hideComponentStrategy();
    } else  {
      this.showDefaultInfo();
    }
  }

  showComponentInfo(component) {
    this.showLocationInfo(component.getX(), component.getY());
  }

  showLocationInfo(x, y) {
    const tile = this.factory.getTile(x, y);
    if(!tile.getComponent()) return this.showDefaultInfo();

    const context = {
      isLocation: true,
      tile: {
        x: tile.getX(),
        y: tile.getY(),
        terrain: tile.getTerrain(),
        buildableType: tile.getBuildableType()
      },
      component: tile.getComponent() ? tile.getComponent().getDescriptionData() : {}
    };

    this.infoContainer.innerHTML = Handlebars.compile(infoDetailsTemplate)(context);
  }

  showComponentStrategy(component) {
    if (this.displayedStrategyComponent === component) return;

    const Strategy = this.componentStrategies[component.getMeta().strategy.type];
    if (Strategy) {
      this.displayedStrategyComponent = component;
      this.displayedStrategy = new Strategy(component);
      this.displayedStrategy.display(this.controlsContainer);
      this.controlsContainer.style.display = "block";
    } else {
      this.hideComponentStrategy();
    }
  }

  hideComponentStrategy() {
    if (this.displayedStrategy) {
      this.displayedStrategy.destroy();
      this.displayedStrategy = null;
      this.displayedStrategyComponent = null;
    }
    this.controlsContainer.innerHTML = "";
    this.controlsContainer.style.display = "none";
  }

  showComponentMetaInfo(id) {
    const meta = this.game.getMeta().componentsById[id];
    const context = {
      isMeta: true,
      component: Component.getMetaDescriptionData(meta, this.factory)
    };

    this.infoContainer.innerHTML = Handlebars.compile(infoDetailsTemplate)(context);

    const tree = new ProductionTreeBuilder(this.factory).buildTree(id, 1);
    if (tree.hasChildren()) {
      const graph = new ProductionGraphUi(tree, this.imageMap);
      const graphContainer = this.infoContainer.querySelector(".componentGraph");
      graph.display(graphContainer);

      const infoArea = this.infoContainer.querySelector(".componentInfoArea");
      if (infoArea && graphContainer){
        infoArea.style.width = `${infoArea.offsetWidth - graphContainer.offsetWidth}px`;
      }
    }
  }

  hideInfo() {
    this.hideComponentStrategy();
    this.infoContainer.innerHTML ="";
  }

  showDefaultInfo() {
    if (!this.play.isDevMode()) {
      this.hideInfo();
      return;
    }
    this.showIncomesData();
  }

  showIncomesData() {
    this.hideInfo();

    const researchPerSec = this.statistics.getFactoryAvgResearchPointsProduction(this.factory.getMeta().id) * this.game.getTicker().getTicksPerSec() || 0;
    const moneyPerSec = this.statistics.getFactoryAvgProfit(this.factory.getMeta().id) * this.game.getTicker().getTicksPerSec() || 0;

    const makeRow = (label, values, cls = "") => `
      <tr>
        <td align="center"><b class="${cls}">${label}</b></td>
        ${values.map(v => `<td align="center" class="${cls}">${v}</td>`).join("")}
      </tr>`;

    const table = `
      <table cellspacing="0" cellpadding="0" border="0">
        <tr>
          <td width="100"></td>
          <td width="100"><b>15min</b></td>
          <td width="100"><b>1h</b></td>
          <td width="100"><b>24h</b></td>
          <td width="100"><b>1 week</b></td>
        </tr>
        ${makeRow("Research:", [
          numberFormat.formatNumber(15 * 60 * researchPerSec),
          numberFormat.formatNumber(60 * 60 * researchPerSec),
          numberFormat.formatNumber(24 * 60 * 60 * researchPerSec),
          numberFormat.formatNumber(7 * 24 * 60 * 60 * researchPerSec)
        ], "research")}
        ${makeRow("Money", [
          `$${numberFormat.formatNumber(15 * 60 * moneyPerSec)}`,
          `$${numberFormat.formatNumber(60 * 60 * moneyPerSec)}`,
          `$${numberFormat.formatNumber(24 * 60 * 60 * moneyPerSec)}`,
          `$${numberFormat.formatNumber(7 * 24 * 60 * 60 * moneyPerSec)}`
        ], "money")}
        <tr>
          <td></td>
          <td><a href="#" class="passTime" data-amount="15">PASS</a></td>
          <td><a href="#" class="passTime" data-amount="60">PASS</a></td>
          <td><a href="#" class="passTime" data-amount="1440">PASS</a></td>
          <td><a href="#" class="passTime" data-amount="10080">PASS</a></td>
        </tr>
      </table>`;

    this.infoContainer.insertAdjacentHTML("beforeend", table);

    this.infoContainer.querySelectorAll(".passTime").forEach(link => {
      link.addEventListener("click", e => {
        e.preventDefault();
        const minutes = parseInt(e.target.dataset.amount, 10);
        new PassTimeAction(this.game, 60 * minutes).passTime()
      });
    });
  }

  destroy() {
    this.factory.getEventManager().removeListenerForType(this.listenerKey);
    this.container.innerHTML = "";
    this.container = null;
  }
}
