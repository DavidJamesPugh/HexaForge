// play/api/api/ServerApi.js
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
  
    async getTimestamp() {
      try {
        const res = await fetch(`${this.apiUrl}/getTimestamp?user_hash=${this.userHash}`);
        if (!res.ok) throw new Error("Failed to fetch timestamp");
        return await res.json();
      } catch (err) {
        logger.error("ServerApi", "getTimestamp failed", err);
        return null;
      }
    }
  
    purchase(packageId) {
      const url = `${this.apiUrl}/makePurchase?package_id=${packageId}` +
        `&user_hash=${this.userHash}` +
        `&timezone=${encodeURIComponent(Intl.DateTimeFormat().resolvedOptions().timeZone)}` +
        `&back_url=${encodeURIComponent(window.location.protocol + "//" + window.location.host)}` +
        `&site=${this.ref === "direct" ? "grestGames" : this.ref}`;
  
      document.location = url;
    }
  
    async loadPurchases() {
      logger.info("ServerApi", "Load items");
      try {
        const res = await fetch(`${this.apiUrl}/getPurchases?user_hash=${this.userHash}`);
        if (!res.ok) throw new Error("Failed to fetch purchases");
        const data = await res.json();
  
        logger.info("ServerApi", "Items loaded", data);
  
        if (data.code !== 0) return [];
        return data.data.items.map(item => ({
          externalId: item.created,
          productId: item.package_id,
        }));
      } catch (err) {
        logger.error("ServerApi", "loadPurchases failed", err);
        return [];
      }
    }
  
    async setConsumed(created) {
      logger.info("ServerApi", `Set consumed ${created}`);
      try {
        const res = await fetch(`${this.apiUrl}/setConsumed?user_hash=${this.userHash}&created=${created}`);
        if (!res.ok) throw new Error("Failed to set consumed");
        const data = await res.json();
  
        logger.info("ServerApi", "Items consumed", data);
  
        return data.code === 0;
      } catch (err) {
        logger.error("ServerApi", "setConsumed failed", err);
        return false;
      }
    }
  }
  