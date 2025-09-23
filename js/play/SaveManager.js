import config from "../config/config.js";
import UrlHandler from "./UrlHandler.js";
import logger from "/js/base/logger.js";

const MODULE_NAME = "SaveManager";

export default class SaveManager {
  constructor(api, userId, prefix) {
    this.api = api;
    this.localStorageKey = `${prefix}|${userId}`;
    this.cloudSaveName = "Main";
    this.cloudSaveIntervalMs = config.saveManager.cloudSaveIntervalMs;
    this.localSaveIntervalMs = config.saveManager.localSaveIntervalMs;

    this.cloudSaveInterval = null;
    this.localSaveInterval = null;

    const urlVars = UrlHandler.getUrlVars();
    this.useCloud =
      urlVars.cloud !== "0" &&
      urlVars.cloud !== 0 &&
      urlVars.cloud !== "false";

    if (!this.useCloud) {
      logger.info(MODULE_NAME, "Cloud save disabled");
    }
  }

  getCloudSaveInterval() {
    return this.cloudSaveIntervalMs;
  }

  getLocalSaveInterval() {
    return this.localSaveIntervalMs;
  }

  setUpdateGameFromLoadedDataCallback(callback) {
    this.updateGameFromLoadedDataCallback = callback;
    return this;
  }

  setGetSaveDataCallback(callback) {
    this.saveDataCallback = callback;
    return this;
  }
  

  init(skipLoad, onReady) {
    return new Promise((resolve) => {
      const finishInit = () => {
        this._startInterval();
        logger.info(MODULE_NAME, "Initialized");
        onReady?.();
        resolve();
      };

      if (skipLoad) {
        this.saveAutoCloud(() => {});
        this.saveAutoLocal(() => {});
        finishInit();
      } else {
        this.loadAuto(() => finishInit());
      }
    });
  }

  _startInterval() {
    this.cloudSaveInterval = setInterval(() => {
      this.saveAutoCloud(() => {
        logger.info(MODULE_NAME, "Auto saved to cloud");
      });
    }, this.cloudSaveIntervalMs);

    this.localSaveInterval = setInterval(() => {
      this.saveAutoLocal(() => {
        logger.info(MODULE_NAME, "Auto saved to local");
      });
    }, this.localSaveIntervalMs);
  }

  destroy() {
    if (this.cloudSaveInterval) clearInterval(this.cloudSaveInterval);
    if (this.localSaveInterval) clearInterval(this.localSaveInterval);
  }

  getSavesInfo(slots, callback) {
    this.api.getSavesInfo(slots, callback);
  }

  saveManual(slotId, callback) {
    this._saveCloud(slotId, callback);
  }

  saveAuto(callback) {
    this._saveLocal(this.cloudSaveName, () => {
      this._saveCloud(this.cloudSaveName, callback);
    });
  }

  saveAutoCloud(callback) {
    this._saveCloud(this.cloudSaveName, callback);
  }

  saveAutoLocal(callback) {
    this._saveLocal(this.cloudSaveName, callback);
  }

  _saveCloud(slotId, callback) {
    if (this.useCloud) {
      this.api.save(slotId, this.saveDataCallback(), callback);
    } else {
      logger.info(MODULE_NAME, "Cloud save skipped!");
      callback?.();
    }
  }

  _saveLocal(slotId, callback) {
    localStorage.setItem(
      `${this.localStorageKey}|${slotId}`,
      JSON.stringify(this.saveDataCallback())
    );
    callback?.();
  }

  loadManual(slotId, callback) {
    this._loadCloud(slotId, (data) => {
      this.updateGameFromSaveData(data);
      this.saveAutoCloud(() => {});
      callback?.();
    });
  }

  loadAuto(callback) {
    this._loadCloud(this.cloudSaveName, (cloudData) => {
      this._loadLocal(this.cloudSaveName, (localData) => {
        let chosen = null;

        if (localData && cloudData) {
          if (localData.meta.ver > cloudData.meta.ver) {
            logger.info(
              MODULE_NAME,
              `Preferred local save local ver:${localData.meta.ver} > cloud ver:${cloudData.meta.ver}`
            );
            chosen = localData;
          } else {
            logger.info(
              MODULE_NAME,
              `Preferred cloud save local ver:${localData.meta.ver} < cloud ver:${cloudData.meta.ver}`
            );
            chosen = cloudData;
          }
        } else if (localData) {
          chosen = localData;
        } else if (cloudData) {
          chosen = cloudData;
        }

        if (chosen) this.updateGameFromSaveData(chosen);
        callback?.();
      });
    });
  }

  updateGameFromSaveData(data) {
    this.updateGameFromLoadedDataCallback?.(data);
  }

  _loadCloud(slotId, callback) {
    this.api.load(slotId, callback);
  }

  _loadLocal(slotId, callback) {
    try {
      const key = `${this.localStorageKey}|${slotId}`;
      const raw = localStorage.getItem(key);
      if (!raw) {
        console.log("SaveManager: No local save found for slot", slotId);
        callback(null);
        return;
      }
      try {
        const parsed = JSON.parse(raw);
        console.log(
          "SaveManager: Local save data length:",
          typeof parsed?.data === "string" ? parsed.data.length : 0
        );
        callback(parsed);
      } catch (e) {
        console.warn("SaveManager: Failed to parse local save JSON", e);
        callback(null);
      }
    } catch (e) {
      console.warn("SaveManager: Error while loading local save", e);
      callback(null);
    }
  }
}
