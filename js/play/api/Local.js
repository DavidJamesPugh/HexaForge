// Local.js
import LocalApi from "./api/LocalApi.js";
import EventManager from "../../base/EventManager.js";
import ApiEvent from "../../config/event/ApiEvent.js";

export default class Local {
    em;
    localApi;

    constructor(userHash, storagePrefix, ref) {
        this.em = new EventManager(ApiEvent, "ApiLocal");
        this.localApi = new LocalApi(this.em, userHash, storagePrefix);
    }

    getEventManager() {
        return this.em;
    }

    getKey() {
        return "local";
    }

    init(callback) {
        this.localApi.init().then(() => {
            const mainSave = this.localApi.decodeMainSave();
            callback?.(); // safe optional call
        }).catch(err => {
            logger.warning("Local", "Init failed", err);
            callback?.(err);
        });
    }

    destroy() {
        this.localApi.destroy();
    }

    getTimestamp(callback) {
        this.localApi.getTimestamp(callback);
    }

    purchase(productId, callback) {
        this.localApi.purchase(productId, callback);
    }

    loadPurchases(callback) {
        this.localApi.loadPurchases(callback);
    }

    setConsumed(externalId, callback) {
        this.localApi.setConsumed(externalId, callback);
    }

    submitStatistic(key, value, callback) {
        this.localApi.submitStatistic(key, value, callback);
    }

    getSavesInfo(key, callback) {
        this.localApi.getSavesInfo(key, callback);
    }

    load(saveKey, callback) {
        this.localApi.load(saveKey, callback);
    }

    save(saveKey, saveData, callback) {
        this.localApi.save(saveKey, saveData, callback);
    }

    clearSave(saveKey) {
        this.localApi.clearSave(saveKey);
    }

    initializeIncentivizedAds() {
        return this.localApi.initializeIncentivizedAds(), true;
    }
}
