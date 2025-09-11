// src/ui/TimeTravelUi.js
import template from "/js/template/timeTravel.html";
import PassTimeAction from "/js/game/action/PassTimeAction.js";
import GameUiEvent from "../config/event/GameUiEvent.js";
import GameContext from "../base/GameContext.js";

export default class TimeTravelUi {
  constructor(play) {
    this.gameUiEm = GameContext.gameUiBus;
    this.play = play;
    this.game = play.getGame();
    this.isVisible = false;
  }

  init() {
    this.gameUiEm.addListener(
      "help",
      GameUiEvent.SHOW_TIME_TRAVEL,
      () => this.display()
    );
    return this;
  }

  display() {
    if (this.isVisible) return;

    const passTimeAction = new PassTimeAction(
      this.game,
      3600 * this.play.getMeta().timeTravelTicketValue
    );

    $("body").append(
      Handlebars.compile(template)({
        tickets: this.game.getTicker().getTimeTravelTickets(),
        hasTickets: this.game.getTicker().getTimeTravelTickets() > 0,
        ticks: nf(passTimeAction.getTicks()),
        profit: nf(passTimeAction.getProfit()),
        profitPerTick: nf(Math.round(passTimeAction.getProfit() / passTimeAction.getTicks())),
        researchPoints: nf(passTimeAction.getResearchPoints()),
        researchPointsPerTick: nf(Math.round(passTimeAction.getResearchPoints() / passTimeAction.getTicks())),
      })
    );

    this.isVisible = true;
    const r = $("#timeTravel");

    r.css("left", ($("html").width() - r.outerWidth()) / 2);

    r.find(".getMore").click(() => {
      this.gameUiEm.invokeEvent(GameUiEvent.SHOW_PURCHASES);
      this.hide();
    });

    r.find(".travel").click(() => {
      if (passTimeAction.canPassTime()) {
        passTimeAction.passTime();
        this.hide();
        this.display();
      } else {
        alert("You don't have a ticket for time travel!");
      }
    });

    r.find(".refresh").click(() => {
      this.hide();
      this.display();
    });

    r.find(".closeButton").click(() => this.hide());
    $("#timeTravelBg").click(() => this.hide());
  }

  hide() {
    this.isVisible = false;
    $("#timeTravel").remove();
    $("#timeTravelBg").remove();
  }

  destroy() {
    this.hide();
    this.game.getEventManager().removeListenerForType("help");
    this.gameUiEm.removeListenerForType("help");
  }
}
