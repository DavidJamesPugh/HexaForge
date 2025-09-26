// KongregateApi.js
import logger from "/js/base/logger.js"; 
import { ApiEvent } from "/js/config/ApiEvent.js"; 

export default class KongregateApi {
  constructor(eventManager) {
    this.em = eventManager;
    this.kongregate = null;
  }

  init(callback) {
    // Still requires AMD "kongregateApi" loader
    require(["kongregateApi"], () => {
      logger.info("KongregateApi", "Init");
      kongregateAPI.loadAPI(() => {
        logger.info("KongregateApi", "API loaded");
        this.kongregate = kongregateAPI.getAPI();
        callback();
      });
    });
  }

  purchase(itemId, callback) {
    if (!this.kongregate) {
      logger.warning("KongregateApi", "API not loaded");
      return callback(false);
    }
    this.kongregate.mtx.purchaseItems([itemId], () => callback(true));
  }

  loadPurchases(callback) {
    logger.info("KongregateApi", "Load items");
    if (!this.kongregate) {
      logger.warning("KongregateApi", "API not loaded");
      return callback([]);
    }

    this.kongregate.mtx.requestUserItemList(
      this.kongregate.services.getUsername(),
      (result) => {
        logger.info("KongregateApi", "Items loaded", result);
        if (!result || !result.success) return callback([]);

        const items = Object.values(result.data).map((o) => ({
          externalId: o.id,
          productId: o.identifier,
        }));
        callback(items);
      }
    );
  }

  setConsumed(itemId, callback) {
    logger.info("KongregateApi", "Set consumed");
    if (!this.kongregate) {
      logger.warning("KongregateApi", "API not loaded");
      return callback(false);
    }
    this.kongregate.mtx.useItemInstance(itemId, (res) => {
      logger.info("KongregateApi", "Items consumed", res);
      callback(!!(res && res.success));
    });
  }

  submitStatistic(stat, value, callback) {
    if (!this.kongregate) {
      logger.warning("KongregateApi", "API not loaded");
      return callback();
    }
    this.kongregate.stats.submit(stat, value);
    callback();
  }

  initializeIncentivizedAds() {
    let status = null;

    this.kongregate.mtx.addEventListener("adsAvailable", () => {
      status = true;
      this.em.invokeEvent(ApiEvent.INCENTIVIZED_AD_STATUS, status);
    });

    this.kongregate.mtx.addEventListener("adsUnavailable", () => {
      status = false;
      this.em.invokeEvent(ApiEvent.INCENTIVIZED_AD_STATUS, status);
    });

    this.kongregate.mtx.addEventListener("adCompleted", () => {
      this.em.invokeEvent(ApiEvent.INCENTIVIZED_AD_COMPLETED);
    });

    this.kongregate.mtx.addEventListener("adAbandoned", () => {
      this.em.invokeEvent(ApiEvent.INCENTIVIZED_AD_ABANDONED);
    });

    this.em.addListener(
      "KongregateApi",
      ApiEvent.INCENTIVIZED_AD_CHECK_STATUS,
      () => {
        this.em.invokeEvent(ApiEvent.INCENTIVIZED_AD_STATUS, status);
      }
    );

    this.em.addListener(
      "KongregateApi",
      ApiEvent.INCENTIVIZED_AD_SHOW,
      () => {
        this.kongregate.mtx.showIncentivizedAd();
      }
    );

    this.kongregate.mtx.initializeIncentivizedAds();
  }
}
