import GameContext from "../base/GameContext.js";
import templateHtml from "/js/template/achievementPopup.html?raw";
import Handlebars from "handlebars";

let zIndexOffset = 0;

export default class AchievementPopupUi {
  static counter = 1;

  constructor(game, achievementId) {
    this.game = game;
    this.achievementId = achievementId;
    this.id = `achievementPopup${AchievementPopupUi.counter++}`;
    this.timeoutId = null;
    this.container = document.body;
    this.element = null;
  }

  display() {
    const achievement = this.game.getMeta().achievementsById[this.achievementId];

    // Compile template
    const html = Handlebars.compile(templateHtml)({
      idStr: this.id,
      name: achievement.name,
      requirement: this.game.getAchievementsManager().getTesterDescriptionText(achievement.id),
      bonus: this.game.getAchievementsManager().getBonusDescriptionText(achievement.id),
    });

    // Insert element into DOM
    this.container.insertAdjacentHTML("beforeend", html);
    this.element = document.getElementById(this.id);

    // Start hidden
    this.element.classList.add("popup-hidden");

    // Click to hide
    this.element.addEventListener("click", () => this.hide());

    // Auto-hide
    this.timeoutId = setTimeout(() => this.hide(), 8000);

    // Position
    const left = window.innerWidth / 2 - this.element.offsetWidth / 2;
    const top = 150 + zIndexOffset * (this.element.offsetHeight + 10);

    Object.assign(this.element.style, {
      left: `${left}px`,
      top: `${top}px`,
      zIndex: 1000 + zIndexOffset,
    });

    // Trigger CSS transition (next tick)
    requestAnimationFrame(() => {
      this.element.classList.remove("popup-hidden");
      this.element.classList.add("popup-visible");
    });

    zIndexOffset++;
  }

  hide() {
    if (!this.element) return;

    this.element.classList.remove("popup-visible");
    this.element.classList.add("popup-hidden");

    this.element.addEventListener(
      "transitionend",
      () => {
        this.element?.remove();
        this.element = null;
      },
      { once: true }
    );

    clearTimeout(this.timeoutId);
    zIndexOffset = Math.max(0, zIndexOffset - 1);
  }
}
