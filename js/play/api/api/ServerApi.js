// play/api/api/ServerApi.js
import logger from "../../../base/Logger.js";
export default class ServerApi {
    constructor(userHash, apiUrl, ref) {
      this.userHash = userHash;
      this.apiUrl = apiUrl;
      this.ref = ref;
    }
  
    init(callback) {
      logger.info("ServerApi", "Init");
      if (typeof callback === "function") {
        callback();
      }
    }
  
    getTimestamp(callback) {
      fetch(`${this.apiUrl}/getTimestamp?user_hash=${this.userHash}`)
        .then(res => {
          if (!res.ok) throw new Error("Failed to fetch timestamp");
          return res.json();
        })
        .then(data => {
          if (callback) callback(data);
        })
        .catch(err => {
          logger.error("ServerApi", "getTimestamp failed", err);
          if (callback) callback(null);
        });
    }
  
    purchase(packageId) {
      const url = `${this.apiUrl}/makePurchase?package_id=${packageId}` +
        `&user_hash=${this.userHash}` +
        `&timezone=${encodeURIComponent(Intl.DateTimeFormat().resolvedOptions().timeZone)}` +
        `&back_url=${encodeURIComponent(window.location.protocol + "//" + window.location.host)}` +
        `&site=${this.ref === "direct" ? "alacrityGames" : this.ref}`;
  
      document.location = url;
    }
  
    loadPurchases(callback) {
      logger.info("ServerApi", "Load items");
      fetch(`${this.apiUrl}/getPurchases?user_hash=${this.userHash}`)
        .then(res => {
          if (!res.ok) throw new Error("Failed to fetch purchases");
          return res.json();
        })
        .then(data => {
          logger.info("ServerApi", "Items loaded", data);
          
          if (data.code !== 0) {
            if (callback) callback([]);
            return;
          }
          
          const items = data.data.items.map(item => ({
            externalId: item.created,
            productId: item.package_id,
          }));
          
          if (callback) callback(items);
        })
        .catch(err => {
          logger.error("ServerApi", "loadPurchases failed", err);
          if (callback) callback([]);
        });
    }
  
    setConsumed(created, callback) {
      logger.info("ServerApi", `Set consumed ${created}`);
      fetch(`${this.apiUrl}/setConsumed?user_hash=${this.userHash}&created=${created}`)
        .then(res => {
          if (!res.ok) throw new Error("Failed to set consumed");
          return res.json();
        })
        .then(data => {
          logger.info("ServerApi", "Items consumed", data);
          
          const success = data.code === 0;
          if (callback) callback(success);
        })
        .catch(err => {
          logger.error("ServerApi", "setConsumed failed", err);
          if (callback) callback(false);
        });
    }
  }
  