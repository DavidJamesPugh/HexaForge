import Handlebars from "handlebars";
import helpTemplateHtml from "../template/help.html?raw";
import GameUiEvent from "../config/event/GameUiEvent.js";
import GameContext from "../base/GameContext.js";

export default class HelpUi {
  constructor(game) {
    this.gameUiEm = GameContext.gameUiBus;
    this.game = game;
    this.isVisible = false;
    this.helpElement = null;
    this.helpBg = null;
    this.menuSections = {};
  }

  init() {
    this.gameUiEm.addListener("help", GameUiEvent.SHOW_HELP, () => this.display());
    return this;
  }

  display() {
    if (this.isVisible) return;
    this.isVisible = true;

    // Only inject HTML once
    if (!this.helpElement) {
      document.body.insertAdjacentHTML(
        "beforeend",
        Handlebars.compile(helpTemplateHtml)({})
      );
      this.helpElement = document.getElementById("help");
      this.helpBg = document.getElementById("helpBg");

      if (!this.helpElement || !this.helpBg) return;

      // Close button
      const closeButton = this.helpElement.querySelector(".closeButton");
      if (closeButton) closeButton.addEventListener("click", () => this.hide());

      // Menu navigation
      const menuLinks = this.helpElement.querySelectorAll(".menu a");
      menuLinks.forEach((link) => {
        const sectionId = link.getAttribute("data-id");
        const section = this.helpElement.querySelector(`#${sectionId}`);
        if (!section) return;

        this.menuSections[sectionId] = section;

        link.addEventListener("click", () => {
          Object.values(this.menuSections).forEach((sec) =>
            sec.classList.remove("visible")
          );
          section.classList.add("visible");
        });
      });

      // Background click
      this.helpBg.addEventListener("click", () => this.hide());
    }

    this.helpElement.style.display = "";
    if (this.helpBg) this.helpBg.style.display = "block";

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.helpElement.classList.add("drawer-open");
        if (this.helpBg) this.helpBg.classList.add("drawer-open");
      });
    });

    const gettingStarted = this.helpElement.querySelector("#gettingStarted");
    if (gettingStarted) gettingStarted.classList.add("visible");
  }

  hide() {
    if (!this.isVisible || !this.helpElement) return;

    this.isVisible = false;

    Object.values(this.menuSections).forEach((sec) =>
      sec.classList.remove("visible")
    );

    this.helpElement.classList.remove("drawer-open");
    if (this.helpBg) this.helpBg.classList.remove("drawer-open");

    setTimeout(() => {
      if (this.helpBg) this.helpBg.style.display = "none";
      if (this.helpElement) this.helpElement.style.display = "none";
    }, 300);
  }

  destroy() {
    // Optional cleanup if you truly want to remove
    if (this.helpElement) {
      this.helpElement.remove();
      this.helpElement = null;
    }
    if (this.helpBg) {
      this.helpBg.remove();
      this.helpBg = null;
    }
    this.menuSections = {};

    this.game.getEventManager().removeListenerForType("help");
    this.gameUiEm.removeListenerForType("help");
  }
}
