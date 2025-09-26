// Kongregate.js
import KongregateApi from "./api/KongregateApi.js";
import PlayFabApi from "./api/PlayFabApi.js";
import ServerApi from "./api/ServerApi.js";
import EventManager from "../../base/EventManager.js";
import { ApiEvent } from "../../base/ApiEvent.js";

export default class Kongregate {
  constructor(r, o, s) {
    this.em = new EventManager(ApiEvent, "ApiKongregate");
    this.kongregateApi = new KongregateApi(this.em);
    this.playFabApi = new PlayFabApi(r);
    this.serverApi = new ServerApi(r, o, s);
  }

  getEventManager() {
    return this.em;
  }

  getKey() {
    return "kongregate";
  }

  getTimestamp(cb) {
    this.serverApi.getTimestamp(cb);
  }

  init(callback) {
    this.playFabApi.init(() => {
      this.kongregateApi.init(() => {
        this.serverApi.init(() => callback());
      });
    });
  }

  destroy() {
    // No-op
  }

  purchase(itemId, callback) {
    this.kongregateApi.purchase(itemId, callback);
  }

  loadPurchases(callback) {
    this.kongregateApi.loadPurchases(callback);
  }

  setConsumed(itemId, callback) {
    this.kongregateApi.setConsumed(itemId, callback);
  }

  submitStatistic(stat, value, callback) {
    this.kongregateApi.submitStatistic(stat, value, () => {
      this.playFabApi.submitStatistic(stat, value, callback);
    });
  }

  getSavesInfo(userId, callback) {
    this.playFabApi.getSavesInfo(userId, callback);
  }

  load(userId, callback) {
    this.playFabApi.load(userId, callback);
  }

  save(userId, data, callback) {
    this.playFabApi.save(userId, data, callback);
  }

  initializeIncentivizedAds() {
    return false;
  }
}
