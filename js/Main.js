import Play from "./play/Play.js";
import imageMap from "./config/gameAssets.js"; 
import MainUi from "./ui/MainUi.js";


export default class Main {
  constructor() {
    this.play = null;
    this.imageMap = imageMap; 
    this.mainUi = null;
  }

  /**
   * Initialize the game
   * @param {boolean} [isDevMode=false]
   */
  async init(isDevMode = false) {
    try {
      console.log("Main: Starting initialization...");
      
      // Load all images (already configured in gameAssets.js)
      console.log("Main: Loading images...");
      await this.imageMap.loadAllAsync();
      console.log("Main: Images loaded successfully");

      // Initialize Play
      console.log("Main: Initializing Play...");
      this.play = new Play();
      await new Promise((resolve) => this.play.init(isDevMode, resolve));
      console.log("Main: Play initialized successfully");

      // Initialize UI
      console.log("Main: Initializing UI...");
      this.mainUi = new MainUi(this.play, this.imageMap);
      this.mainUi.display(document.getElementById("gameArea"));
      console.log("Main: UI initialized successfully");
    } catch (error) {
      console.error("Main: Initialization failed:", error);
      throw error;
    }
  }

  destroy() {
    this.mainUi?.destroy();
    this.play?.destroy();
  }
}
