import config from "../config/config.js";
import UrlHandler from "./UrlHandler.js";
import logger from "../base/Logger.js";

export default class SaveManager {
  constructor(api, playerId, storagePrefix) {
    this.api = api;
    this.localStorageKey = `${storagePrefix}|${playerId}`;
    this.cloudSaveName = "Main";
    this.cloudSaveIntervalMs = config.saveManager.cloudSaveIntervalMs;
    this.localSaveIntervalMs = config.saveManager.localSaveIntervalMs;
    this.cloudSaveInterval = null;
    this.localSaveInterval = null;

    const urlVars = UrlHandler.getUrlVars();
    this.useCloud = urlVars.cloud !== "0" && urlVars.cloud !== 0 && urlVars.cloud !== "false";
    if (!this.useCloud) logger.info("SaveManager", "Cloud save disabled");
  }

  setUpdateGameFromLoadedDataCallback(callback) {
    this.updateGameFromLoadedDataCallback = callback;
    return this;
  }

  setGetSaveDataCallback(callback) {
    this.saveDataCallback = callback;
    return this;
  }

  getCloudSaveInterval() {
    return this.cloudSaveIntervalMs;
  }

  getLocalSaveInterval() {
    return this.localSaveIntervalMs;
  }

  async init(forceSave = false, callback = () => {}) {
    const start = () => {
      this._startInterval();
      logger.info("SaveManager", "Initialized");
      callback();
    };

    if (forceSave) {
      await this.saveAutoCloud();
      await this.saveAutoLocal();
      start();
    } else {
      await this.loadAuto();
      start();
    }
  }

  _startInterval() {
    this.cloudSaveInterval = setInterval(() => {
      this.saveAutoCloud(() => logger.info("SaveManager", "Auto saved to cloud"));
    }, this.cloudSaveIntervalMs);

    this.localSaveInterval = setInterval(() => {
      this.saveAutoLocal(() => logger.info("SaveManager", "Auto saved to local"));
    }, this.localSaveIntervalMs);
  }

  destroy() {
    clearInterval(this.cloudSaveInterval);
    clearInterval(this.localSaveInterval);
  }

  getSavesInfo(playerId, callback) {
    this.api.getSavesInfo(playerId, callback);
  }

  async saveManual(name, callback = () => {}) {
    await this._saveCloud(name, callback);
  }

  async saveAuto(callback = () => {}) {
    await this._saveLocal(this.cloudSaveName, async () => {
      await this._saveCloud(this.cloudSaveName, callback);
    });
  }

  async saveAutoCloud(callback = () => {}) {
    await this._saveCloud(this.cloudSaveName, callback);
  }

  async saveAutoLocal(callback = () => {}) {
    await this._saveLocal(this.cloudSaveName, callback);
  }

  async _saveCloud(name, callback = () => {}) {
    if (this.useCloud) {
      await this.api.save(name, this.saveDataCallback(), callback);
    } else {
      logger.info("SaveManager", "Cloud save skipped!");
      callback();
    }
  }

  async _saveLocal(name, callback = () => {}) {
    window.localStorage[`${this.localStorageKey}|${name}`] = JSON.stringify(this.saveDataCallback());
    callback();
  }

  async loadManual(name, callback = () => {}) {
    this._loadCloud(name, (data) => {
      this.updateGameFromSaveData(data);
      this.saveAutoCloud(() => {});
      callback();
    });
  }

  async loadAuto(callback = () => {}) {
    this._loadCloud(this.cloudSaveName, (cloudData) => {
      this._loadLocal(this.cloudSaveName, (localData) => {
        let preferred = null;

        if (localData && cloudData) {
          preferred = localData.meta.ver > cloudData.meta.ver ? localData : cloudData;
          logger.info(
            "SaveManager",
            `Preferred ${preferred === localData ? "local" : "cloud"} save local ver:${localData.meta.ver} cloud ver:${cloudData.meta.ver}`
          );
        } else {
          preferred = localData || cloudData;
        }

        if (preferred) this.updateGameFromSaveData(preferred);
        callback();
      });
    });
  }

  updateGameFromSaveData(data) {
    this.updateGameFromLoadedDataCallback(data);
  }

  _loadCloud(name, callback = () => {}) {
    this.api.load(name, callback);
  }

  _loadLocal(name, callback = () => {}) {
    try {
      const data = JSON.parse(window.localStorage[`${this.localStorageKey}|${name}`]);
      callback(data);
    } catch {
      callback(null);
    }
  }
}
