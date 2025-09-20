// src/ui/TimeTravelUi.js
import Handlebars from "handlebars";
import template from "../template/timeTravel.html?raw"; // use ?raw for Vite/ESBuild
import PassTimeAction from "/js/game/action/PassTimeAction.js";
import GameUiEvent from "../config/event/GameUiEvent.js";
import GameContext from "../base/GameContext.js";
import numberFormat from "../base/NumberFormat.js";

export default class TimeTravelUi {
  constructor(play) {
    this.gameUiEm = GameContext.gameUiBus;
    this.play = play;
    this.game = play.getGame();
    this.isVisible = false;
    this.element = null;
    this.bg = null;
  }

  init() {
    this.gameUiEm.addListener("timeTravelUi", GameUiEvent.SHOW_TIME_TRAVEL, () =>
      this.display()
    );
    return this;
  }

  display() {
    if (this.isVisible) return;

    const passTimeAction = new PassTimeAction(
      this.game,
      3600 * this.play.getMeta().timeTravelTicketValue
    );

    // Insert HTML
    document.body.insertAdjacentHTML(
      "beforeend",
      Handlebars.compile(template)({
        tickets: this.game.getTicker().getTimeTravelTickets(),
        hasTickets: this.game.getTicker().getTimeTravelTickets() > 0,
        ticks: numberFormat.formatNumber(passTimeAction.getTicks()),
        profit: numberFormat.formatNumber(passTimeAction.getProfit()),
        profitPerTick: numberFormat.formatNumber(
          Math.round(passTimeAction.getProfit() / passTimeAction.getTicks())
        ),
        researchPoints: numberFormat.formatNumber(passTimeAction.getResearchPoints()),
        researchPointsPerTick: numberFormat.formatNumber(
          Math.round(passTimeAction.getResearchPoints() / passTimeAction.getTicks())
        ),
      })
    );

    this.isVisible = true;
    this.element = document.getElementById("timeTravel");
    this.bg = document.getElementById("timeTravelBg");

    if (!this.element) return;

    // Center horizontally
    const htmlWidth = document.documentElement.offsetWidth;
    this.element.style.left = `${(htmlWidth - this.element.offsetWidth) / 2}px`;

    // Event: get more tickets
    const getMoreBtn = this.element.querySelector(".getMore");
    if (getMoreBtn) {
      getMoreBtn.addEventListener("click", () => {
        this.gameUiEm.invokeEvent(GameUiEvent.SHOW_PURCHASES);
        this.hide();
      });
    }

    // Event: travel
    const travelBtn = this.element.querySelector(".travel");
    if (travelBtn) {
      travelBtn.addEventListener("click", () => {
        if (passTimeAction.canPassTime()) {
          passTimeAction.passTime();
          this.hide();
          this.display();
        } else {
          alert("You don't have a ticket for time travel!");
        }
      });
    }

    // Event: refresh
    const refreshBtn = this.element.querySelector(".refresh");
    if (refreshBtn) {
      refreshBtn.addEventListener("click", () => {
        this.hide();
        this.display();
      });
    }

    // Event: close button
    const closeBtn = this.element.querySelector(".closeButton");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => this.hide());
    }

    // Event: background click
    if (this.bg) {
      this.bg.addEventListener("click", () => this.hide());
    }
  }

  hide() {
    if (!this.isVisible) return;

    this.isVisible = false;

    if (this.element) {
      this.element.remove();
      this.element = null;
    }

    if (this.bg) {
      this.bg.remove();
      this.bg = null;
    }
  }

  destroy() {
    this.hide();
    this.game.getEventManager().removeListenerForType("timeTravelUi");
    this.gameUiEm.removeListenerForType("timeTravelUi");
  }
}
