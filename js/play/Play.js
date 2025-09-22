// Play.js
import gameConfig from "../config/config.js";
import Meta from "../config/Meta.js";
import Game from "../game/Game.js";
import SaveManager from "./SaveManager.js";
import PurchasesManager from "./PurchasesManager.js";
import UserHash from "./UserHash.js";
import UrlHandler from "./UrlHandler.js";
import ApiFactory from "./api/ApiFactory.js";
import ConfirmedTimestamp from "./ConfirmedTimestamp.js";
import IncentivizedAdCompletedAction from "../game/action/IncentivizedAdCompletedAction.js";
import GameContext from "../base/GameContext.js";
import ApiEvent from "../config/event/ApiEvent.js";
import logger from "../base/Logger.js";
import Base64ArrayBuffer from "../base/Base64ArrayBuffer.js";
import BinaryArrayReader from "../base/BinaryArrayReader.js";

export default class Play {
  constructor() {
    this.userHash = null;
    this.api = null;
    this.saveManager = null;
    this.purchasesManager = null;
    this.confirmedTimestamp = null;
    this.game = null;
  }

  getMeta() {
    return Meta;
  }

  getGame() {
    return this.game;
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
    try {
      console.log("Play: Starting initialization...");
      
      // Initialize UserHash
      console.log("Play: Initializing UserHash...");
      this.userHash = new UserHash(gameConfig.userHash.key);
      await this.userHash.init();
      console.log("Play: UserHash initialized");

      // Initialize API
      console.log("Play: Initializing API...");
      this.api = ApiFactory(UrlHandler.identifySite(), this.userHash.getUserHash());
      await this.api.init();
      console.log("Play: API initialized");

      // Subscribe to incentivized ads completed event
      this.api.getEventManager().addListener(
        "Play",
        ApiEvent.INCENTIVIZED_AD_COMPLETED,
        () => new IncentivizedAdCompletedAction(this.getGame()).complete()
      );

      // Initialize confirmed timestamp
      console.log("Play: Initializing confirmed timestamp...");
      this.confirmedTimestamp = new ConfirmedTimestamp(this.api.getTimestamp.bind(this.api));
      await this.confirmedTimestamp.init();
      console.log("Play: Confirmed timestamp initialized");

      // Initialize Game instance
      console.log("Play: Initializing Game...");
      this.game = new Game(gameConfig.meta.main, this.confirmedTimestamp);
      GameContext.game = this.game; // store in global context
      console.log("Play: Game instance created");

      // Initialize SaveManager
      console.log("Play: Initializing SaveManager...");
      this.saveManager = this._createSaveManager();
      await this.saveManager.init(isDevMode);
      console.log("Play: SaveManager initialized");

      // Initialize PurchasesManager
      console.log("Play: Initializing PurchasesManager...");
      this.purchasesManager = new PurchasesManager(this);
      await this.purchasesManager.init();
      console.log("Play: PurchasesManager initialized");

      console.log("Play: Initializing game logic...");
      this.game.init();
      console.log("Play: Game logic initialized");
      
      logger.info("Play", "Initialized");
      onReady();
    } catch (error) {
      console.error("Play: Initialization failed:", error);
      throw error;
    }
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
          console.log("Play: Decoding save. Meta:", savedData?.meta);
          this.importFromReader(new BinaryArrayReader(Base64ArrayBuffer.decode(savedData.data)));
          // console.log("Play: After import: money=", this.game.getMoney(), "rp=", this.game.getResearchPoints(), "isPremium=", this.game.getIsPremium());

          // Log a sample of reconstructed state
          // const f0 = this.game.getFactory(this.game.getMeta().factories[0].id);
          // if (f0) {
          //   const mainTiles = f0.getTiles().filter(t => t.isMainComponentContainer());
          //   console.log("Play: Factory 0 components count:", mainTiles.length);
          // }
          // console.log("Play: Research sample:", Object.keys(this.game.getResearchManager().research).slice(0,5).reduce((acc, k) => (acc[k]=this.game.getResearchManager().research[k], acc), {}));


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
  }

  exportToWriter() {
    return this.game.exportToWriter();
  }

  importFromReader(reader) {
    this.game.importFromReader(reader);
  }
}
