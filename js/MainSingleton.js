// MainSingleton.js
import Main from "./Main.js";
class MainSingleton {
  // Holds the one and only Main instance
  static mainInstance = null;

  // Initialize the game if not already running
  static async init(devMode = false) {
    if (!this.mainInstance) {
      this.mainInstance = new Main();
      await this.mainInstance.init(devMode);
    } else {
      console.log("MainSingleton.init called but instance already exists");
    }
    return this.mainInstance;
  }
  // Get the instance safely
  static getInstance() {
    if (!MainSingleton.mainInstance) {
      throw new Error("MainSingleton not initialized yet. Call init() first.");
    }
    return MainSingleton.mainInstance;
  }

  // Tear everything down
  static destroy() {
    try {
    const main = MainSingleton.mainInstance;
    if (!main) return;

    console.log("MainSingleton: Destroying...");
    document.querySelectorAll("#intro, #introBg").forEach(el => el.remove());

    // Clear UI
    main.mainUi?.destroy();

    // Clear game/play
    main.play?.destroy();

    // Clear event managers
    main.globalUiEm?.removeAllListeners?.();
    main.play?.em?.removeAllListeners?.();

    // Stop timers
    if (main.focusInterval) {
      clearInterval(main.focusInterval);
    }

    // Stop save manager intervals
    main.saveManager?.destroy?.();

    // Stop background info UI
    main.runningInBackgroundInfoUi?.destroy?.();

    // Drop reference
    MainSingleton.mainInstance = null;
} catch {
    console.log("MainSingleton.destroy failed");

}
  }

  // Destroy and immediately re-init
  static async reset(isDevMode = false) {
    console.log(MainSingleton.mainInstance);
    console.log("MainSingleton.reset called");
    MainSingleton.destroy();
    console.log(MainSingleton.mainInstance);
    return await MainSingleton.init(isDevMode);
  }
}

export default MainSingleton;
