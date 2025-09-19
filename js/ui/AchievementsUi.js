// src/ui/AchievementsUi.js
import Handlebars from "handlebars";
import achievementsTemplateHtml from "../template/achievements.html?raw";
import GameEvent from "../config/event/GameEvent.js";
import GameContext from "../base/GameContext.js";

export default class AchievementsUi {
  constructor(game) {
    this.gameUiEm = GameContext.gameUiBus;
    this.game = game;
    this.manager = this.game.getAchievementsManager();
    this.container = null;
  }

  display(container) {
    this.container = container;
    const achievementsList = [];

    const achievementsMeta = this.game.getMeta().achievements;
    for (const achievement of achievementsMeta) {
      if (this.manager.isVisible(achievement.id)) {
        achievementsList.push({
          id: achievement.id,
          name: achievement.name,
          requirements: this.manager.getTesterDescriptionText(achievement.id),
          bonus: this.manager.getBonusDescriptionText(achievement.id),
        });
      }
    }

    // Render the template
    this.container.innerHTML = Handlebars.compile(achievementsTemplateHtml)({
      achievements: achievementsList,
    });

    // Back button
    const backButton = this.container.querySelector(".backButton");
    if (backButton) {
      backButton.addEventListener("pointerdown", () =>
        this.gameUiEm.invokeEvent(GameEvent.SHOW_FACTORY)
      );
    }

    // Listen for achievement events
    this.game
      .getEventManager()
      .addListener("achievementsUi", GameEvent.ACHIEVEMENT_RECEIVED, () =>
        this.update()
      );

    this.update();
  }

  update() {
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
    if (this.container) {
      this.container.innerHTML = "";
      this.container = null;
    }
  }
}
