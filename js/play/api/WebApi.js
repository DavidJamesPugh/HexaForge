// play/api/Web.js
import ServerApi from "./api/ServerApi.js";
import PlayFabApi from "/js/play/api/api/PlayFabApi.js";
import EventManager from "/js/base/EventManager.js";
import ApiEvent from "../../config/event/ApiEvent.js";

export default class WebApi {
  constructor(userHash, apiUrl, ref) {
    this.em = new EventManager(ApiEvent, "ApiWeb");
    this.serverApi = new ServerApi(userHash, apiUrl, ref);
    this.playFabApi = new PlayFabApi(userHash);
  }

  getEventManager() {
    return this.em;
  }

  getKey() {
    return "web";
  }

  getTimestamp(callback) {
    this.serverApi.getTimestamp(callback);
  }

  init(callback) {
    this.playFabApi.init(() => {
      this.serverApi.init(() => {
        callback();
      });
    });
  }

  destroy() {
    // No-op
  }

  purchase(packageId, callback) {
    this.serverApi.purchase(packageId, callback);
  }

  loadPurchases(callback) {
    this.serverApi.loadPurchases(callback);
  }

  setConsumed(created, callback) {
    this.serverApi.setConsumed(created, callback);
  }

  submitStatistic(/* name, value, callback */) {
    // Original just called n();
    return;
  }

  getSavesInfo(keys, callback) {
    this.playFabApi.getSavesInfo(keys, callback);
  }

  load(key, callback) {
    this.playFabApi.load(key, callback);
  }

  save(key, data, callback) {
    this.playFabApi.save(key, data, callback);
  }

  initializeIncentivizedAds() {
    return false;
  }

  showIncentivizedAd() {
    return false;
  }
}
