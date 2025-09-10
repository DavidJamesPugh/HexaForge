// Play.js
import gameConfig from "../config/config.js";
import Meta from "../config/Meta.js";
import Game from "../game/Game.js";
// import SaveManager from "./SaveManager.js";
// import PurchasesManager from "./PurchasesManager.js";
import UserHash from "./UserHash.js";
import UrlHandler from "./UrlHandler.js";
import ApiFactory from "./api/ApiFactory.js";
// import ConfirmedTimestamp from "./ConfirmedTimestamp.js";
// import IncentivizedAdCompletedAction from "game/action/IncentivizedAdCompletedAction.js";
import GameContext from "../base/GameContext.js";
// import { ApiEvent } from "../config/event/ApiEvent.js";
import logger from "../base/Logger.js";

export default class Play {
  constructor() {
    this.userHash = null;
    this.api = null;
    this.saveManager = null;
    this.purchasesManager = null;
    this.confirmedTimestamp = null;
    this.game = null;
    this.missions = {};
  }

  getMeta() {
    return Meta;
  }

  getGame() {
    return this.game;
  }

  getMission(missionId) {
    return this.missions[missionId];
  }

  getSaveManager() {
    return this.saveManager;
  }

  getPurchasesManager() {
    return this.purchasesManager;
  }

  getApi() {
    return this.api;
  }

  getUserHash() {
    return this.userHash;
  }

  isDevMode() {
    return UrlHandler.identifySite() === "localhost";
  }

  async init(isDevMode = false, onReady = () => {}) {
    // Initialize UserHash
    this.userHash = new UserHash(gameConfig.userHash.key);
    await this.userHash.init();

    // Initialize API
    this.api = ApiFactory(UrlHandler.identifySite(), this.userHash.getUserHash());
    await this.api.init();

    // Subscribe to incentivized ads completed event
    this.api.getEventManager().addListener(
      "Play",
      ApiEvent.INCENTIVIZED_AD_COMPLETED,
      () => new IncentivizedAdCompletedAction(this.getGame()).complete()
    );

    // Initialize confirmed timestamp
    this.confirmedTimestamp = new ConfirmedTimestamp(this.api.getTimestamp.bind(this.api));
    await this.confirmedTimestamp.init();

    // Initialize Game instance
    this.game = new Game(gameConfig.main, this.confirmedTimestamp);
    GameContext.game = this.game; // store in global context

    // Initialize missions
    this.missions = {};
    for (const id in gameConfig.missions) {
      this.missions[id] = new Game(gameConfig.missions[id]);
    }

    // Initialize SaveManager
    this.saveManager = this._createSaveManager();
    await this.saveManager.init(isDevMode);

    // Initialize PurchasesManager
    this.purchasesManager = new PurchasesManager(this);
    await this.purchasesManager.init();

    // Initialize game logic
    this.game.init();
    logger.info("Play", "Initialized");

    onReady();
  }

  _createSaveManager() {
    return new SaveManager(this.api, this.userHash, "FactoryIdleSave")
      .setGetSaveDataCallback(() => ({
        meta: {
          ver: this.game.getTicker().getNoOfTicks(),
          timestamp: Math.round(Date.now() / 1000),
          date: new Date().toISOString(),
        },
        data: Base64ArrayBuffer.encode(this.exportToWriter().getBuffer()),
      }))
      .setUpdateGameFromLoadedDataCallback((savedData) => {
        try {
          this.importFromReader(new BinaryArrayReader(Base64ArrayBuffer.decode(savedData.data)));
          this.game.getTicker().addOfflineGains();
          logger.info("Play", "Game loaded from save");
        } catch (err) {
          logger.error("Play", "Could not update game from save data", err.message);
        }
      });
  }

  destroy() {
    this.game?.destroy();
    this.api?.destroy();
    this.saveManager?.destroy();
    this.purchasesManager?.destroy();
    Object.values(this.missions).forEach((m) => m.destroy());
  }

  exportToWriter() {
    return this.game.exportToWriter();
  }

  importFromReader(reader) {
    this.game.importFromReader(reader);
  }
}
