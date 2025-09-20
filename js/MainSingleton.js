// MainSingleton.js
import Main from "./Main.js";

class MainSingleton {
  constructor() {
    if (!MainSingleton.instance) {
      this.mainInstance = null; // mutable
      MainSingleton.instance = this;
    }
    return MainSingleton.instance;
  }

  async init(devMode = false) {
    if (!this.mainInstance) {
      this.mainInstance = new Main(); // ✅ OK now
      await this.mainInstance.init(devMode);
    }
    return this.mainInstance;
  }

  getInstance() {
    if (!this.mainInstance) {
      throw new Error("MainSingleton not initialized yet. Call init() first.");
    }
    return this.mainInstance;
  }
}

const singleton = new MainSingleton();

export default singleton;
