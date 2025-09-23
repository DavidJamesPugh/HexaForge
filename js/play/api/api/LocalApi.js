// LocalApi.js
import logger from "../../../base/Logger.js";
import ApiEvent from "../../../config/event/ApiEvent.js";
import Base64ArrayBuffer from "/js/base/Base64ArrayBuffer.js";
import BinaryArrayReader from "/js/base/BinaryArrayReader.js";

export default class LocalApi {
    userHash;
    storageKey;
    em;
    purchases = [];
    savesMeta = {};
    saves = {};
    insentiveInterval = null;
    isShowingAd = false;
    isAvailable = false;

    constructor(em, userHash, storagePrefix) {
        this.userHash = userHash;
        
        this.storageKey = `${storagePrefix}|${userHash}`;
        this.em = em;
    }

    getTimestamp(callback) {
        callback(Math.floor(Date.now() / 1000));
    }

    _saveToLocalStorage() {
        localStorage.setItem(
            this.storageKey,
            JSON.stringify({
                purchases: this.purchases,
                savesMeta: this.savesMeta,
                saves: this.saves,
            })
        );
    }

    _loadFromLocalStorage() {
        this.purchases = [];
        this.saves = {};
        this.savesMeta = {};
        
        const mainSave = this.decodeMainSave();
        try {
            const data = JSON.parse(localStorage.getItem(this.storageKey));
            if (data) {
                this.purchases = data.purchases || [];
                this.savesMeta = data.savesMeta || {};
                this.saves = data.saves || {};
            }
        } catch (err) {
            logger.warning("Local", "Could not load data", err);
        }
    }

    init() {
        return new Promise((resolve) => {
            this._loadFromLocalStorage();
            this.initializeIncentivizedAds();
            logger.info("Local", "Init");
    
            setTimeout(() => {
                logger.info("Local", "API loaded");
                resolve();
            }, 100);
        });
    }

    destroy() {
        if (this.insentiveInterval) clearInterval(this.insentiveInterval);
    }

    purchase(productId, callback) {
        setTimeout(() => {
            this.purchases.push({ externalId: String(Math.floor(Math.random() * 1e12)), productId });
            this._saveToLocalStorage();
            callback();
        }, 100);
    }

    loadPurchases(callback) {
        setTimeout(() => callback(this.purchases), 100);
    }

    setConsumed(externalId, callback) {
        setTimeout(() => {
            this.purchases = this.purchases.filter(p => p.externalId !== externalId);
            this._saveToLocalStorage();
            callback(true);
        }, 100);
    }

    submitStatistic(key, value, callback) {
        this._saveToLocalStorage();
        setTimeout(callback, 100);
    }

    getSavesInfo(key, callback) {
        setTimeout(() => callback(this.savesMeta), 100);
    }

    load(saveKey, callback) {
        setTimeout(() => callback(this.savesMeta[saveKey] ? { meta: this.savesMeta[saveKey], data: this.saves[saveKey] } : null), 100);
    }

    save(saveKey, saveData, callback) {
        setTimeout(() => {
            this.savesMeta[saveKey] = saveData.meta;
            this.saves[saveKey] = saveData.data;
            this._saveToLocalStorage();
            callback(true);
        }, 100);
    }

    initializeIncentivizedAds() {
        this.insentiveInterval = setInterval(() => {
            this.isAvailable = !this.isAvailable;
            this.em.invokeEvent(ApiEvent.INCENTIVIZED_AD_STATUS, this.isAvailable);
        }, 2000);

        this.em.addListener("Local", ApiEvent.INCENTIVIZED_AD_CHECK_STATUS, () => {
            this.em.invokeEvent(ApiEvent.INCENTIVIZED_AD_STATUS, this.isAvailable);
        });

        this.em.addListener("Local", ApiEvent.INCENTIVIZED_AD_SHOW, () => this._showIncentivizedAd());
    }

    _showIncentivizedAd() {
        if (this.isShowingAd || !this.isAvailable) return;

        this.isShowingAd = true;
        this.isAvailable = false;
        this.em.invokeEvent(ApiEvent.INCENTIVIZED_AD_STATUS, this.isAvailable);

        const adDiv = document.createElement("div");
        adDiv.id = "LocalApiAd";
        adDiv.style.cssText = "position:absolute; top:0; left:0; width:100%; height:100%; background-color:red; text-align:center; font-size:50px; padding-top:200px;";
        adDiv.innerText = "This is an ad!";
        document.body.appendChild(adDiv);

        setTimeout(() => {
            this.isShowingAd = false;
            this.em.invokeEvent(ApiEvent.INCENTIVIZED_AD_COMPLETED);
            adDiv.remove();
        }, 500);
    }

    decodeMainSave() {
        const saveKey = "Main";
        const rawSave = this.saves[saveKey];
        
        if (!rawSave) {
            logger.info("LocalApi", "No Main save data found");
            return null;
        }
    
        try {
            // Decode Base64 string to ArrayBuffer
            const buffer = Base64ArrayBuffer.decode(rawSave);
            const bytes = new Uint8Array(buffer);
    
    
            // Use BinaryArrayReader to parse
            const reader = new BinaryArrayReader(buffer);
    
            // Read core fields (matching exportToWriter order)
            const version = reader.readUint16();
            const money = reader.readFloat64();
            const researchPoints = reader.readFloat64();
            let isPremium = 0;
            if (version >= 7) isPremium = reader.readInt8();
    
            // Optionally return the reader for further parsing of factories, achievements, etc.
            return { version, money, researchPoints, isPremium, reader };
        } catch (err) {
            logger.warning("LocalApi", "Failed to decode Main save", err);
            return null;
        }
    }
    
}
