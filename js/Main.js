import Play from "./play/Play.js";
import imageMap from "./config/gameAssets.js"; // <-- import the shared, pre-configured ImageMap
import MainUi from "./ui/MainUi.js";

// Expose events globally if truly needed
// window.GameEvent = gameEvent;
// window.FactoryEvent = factoryEvent;
// window.GameUiEvent = gameUiEvent;
// window.GlobalUiEvent = globalUiEvent;
// window.ApiEvent = apiEvent;

export default class Main {
  constructor() {
    this.play = null;
    this.imageMap = imageMap; // use the shared ImageMap
    this.mainUi = null;
  }

  /**
   * Initialize the game
   * @param {boolean} [isDevMode=false]
   */
  async init(isDevMode = false) {
    // Load all images (already configured in gameAssets.js)
    await this.imageMap.loadAllAsync();

    // Initialize Play
    this.play = new Play();
    await new Promise((resolve) => this.play.init(isDevMode, resolve));

    // Optional dev mode check
    this.play.isDevMode?.();

    // Initialize UI
    this.mainUi = new MainUi();
    this.mainUi.display(document.getElementById("gameArea"));
  }

  destroy() {
    this.mainUi?.destroy();
    this.play?.destroy();
  }
}
