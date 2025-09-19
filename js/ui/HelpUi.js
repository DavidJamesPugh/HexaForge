import Handlebars from "handlebars";
import helpTemplateHtml from "../template/help.html?raw";
import GameUiEvent  from "../config/event/GameUiEvent.js";
import GameContext from "../base/GameContext.js";

export default class HelpUi {
    constructor(game) {
      this.gameUiEm = GameContext.gameUiBus;
      this.game = game;
      this.isVisible = false;
      this.helpElement = null;
      this.menuSections = {};
    }
  
    init() {
      this.gameUiEm.addListener("help", GameUiEvent.SHOW_HELP, () => this.display());
      return this;
    }
  
    display() {
      if (this.isVisible) return;
  
      this.isVisible = true;
  
      // Insert HTML
      document.body.insertAdjacentHTML('beforeend', Handlebars.compile(helpTemplateHtml)({}));
      this.helpElement = document.getElementById('help');
      if (!this.helpElement) return;
  
      // Center horizontally
      const htmlWidth = document.documentElement.offsetWidth;
      this.helpElement.style.left = `${(htmlWidth - this.helpElement.offsetWidth) / 2}px`;
  
      // Close button
      const closeButton = this.helpElement.querySelector('.closeButton');
      if (closeButton) closeButton.addEventListener('click', () => this.hide());
  
      // Menu navigation
      this.menuSections = {};
      const menuLinks = this.helpElement.querySelectorAll('.menu a');
      menuLinks.forEach(link => {
        const sectionId = link.getAttribute('data-id');
        const section = this.helpElement.querySelector(`#${sectionId}`);
        if (!section) return;
  
        this.menuSections[sectionId] = section;
  
        link.addEventListener('click', () => {
          // Hide all
          Object.values(this.menuSections).forEach(sec => sec.classList.remove('visible'));
  
          // Show selected
          section.classList.add('visible');
        });
      });
  
      // Show first section
      const gettingStarted = this.helpElement.querySelector('#gettingStarted');
      if (gettingStarted) gettingStarted.classList.add('visible');
  
      // Background click
      const helpBg = document.getElementById('helpBg');
      if (helpBg) helpBg.addEventListener('click', () => this.hide());
    }
  
    hide() {
      if (!this.helpElement) return;
  
      this.isVisible = false;
  
      // Fade out all sections
      Object.values(this.menuSections).forEach(sec => sec.classList.remove('visible'));
  
      // Fade out background and help container, then remove after transition
      const helpBg = document.getElementById('helpBg');
      if (helpBg) {
        helpBg.style.opacity = '0';
        setTimeout(() => helpBg.remove(), 300);
      }
  
      this.helpElement.style.opacity = '0';
      setTimeout(() => this.helpElement?.remove(), 300);
  
      this.helpElement = null;
      this.menuSections = {};
    }
  
    destroy() {
      this.hide();
      this.game.getEventManager().removeListenerForType("help");
      this.gameUiEm.removeListenerForType("help");
    }
  }
  