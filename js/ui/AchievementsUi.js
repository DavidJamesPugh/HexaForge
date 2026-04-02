// src/ui/AchievementsUi.js
import Handlebars from "handlebars";
import achievementsTemplateHtml from "../template/achievements.html?raw";
import GameEvent from "../config/event/GameEvent.js";
import GameContext from "../base/GameContext.js";
import bindDrawerOverlayClose, { openDrawerAnimation } from "./helper/bindDrawerOverlayClose.js";

export default class AchievementsUi {
  constructor(game) {
    this.gameUiEm = GameContext.gameUiBus;
    this.game = game;
    this.manager = this.game.getAchievementsManager();
    this.container = null;
    this.bg = null;
    this.panel = null;
  }

  display() {
    const achievementsList = [];

    const achievementsMeta = this.game.getMeta().achievements;
    for (const achievement of achievementsMeta) {
      if (this.manager.isVisible(achievement.id)) {
        achievementsList.push({
          id: achievement.id,
          name: achievement.name,
          requirements: this.manager.getTesterDescriptionText(achievement.id),
          bonus: this.manager.getBonusDescriptionText(achievement.id),
          iconStyle: `background-position: -${26 * achievement.spriteX}px -${26 * 0}px`,
        });
      }
    }

    document.body.insertAdjacentHTML(
      "beforeend",
      Handlebars.compile(achievementsTemplateHtml)({
        achievements: achievementsList,
      })
    );

    this.bg = document.getElementById("achievementsBg");
    this.panel = document.getElementById("achievementsDrawer");
    this.container = this.panel?.querySelector(".achievementsBox") ?? null;

    bindDrawerOverlayClose(this.bg, this.panel, this.gameUiEm);
    openDrawerAnimation(this.bg, this.panel);

    this.game
      .getEventManager()
      .addListener("achievementsUi", GameEvent.ACHIEVEMENT_RECEIVED, () => this.update());

    this.update();
  }

  update() {
    if (!this.container) return;
    const items = this.container.querySelectorAll(".item");
    items.forEach((el) => {
      const id = el.dataset.id;
      if (this.manager.getAchievement(id)) {
        el.classList.add("achieved");
      } else {
        el.classList.remove("achieved");
      }
    });
  }

  destroy() {
    this.game.getEventManager().removeListenerForType("achievementsUi");
    this.gameUiEm.removeListenerForType("achievementsUi");
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
