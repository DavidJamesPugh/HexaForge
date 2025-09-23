import logger from "../base/Logger.js";


// UserHash.js
export default class UserHash {
    storageKey;
    hashLength = 40;
    userHash = null;

    constructor(storageKey) {
        this.storageKey = storageKey;
    }

    init() {
        this.userHash = localStorage.getItem(this.storageKey);
        if (!this.userHash) {
            this.userHash = this._generateUserHash(this.hashLength);
            this.updateUserHash(this.userHash);
        }
        return this;
    }

    updateUserHash(hash) {
        localStorage.setItem(this.storageKey, hash);
    }

    getUserHash() {
        return this.userHash;
    }

    toString() {
        return this.userHash;
    }

    _generateUserHash(length) {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        return Array.from({ length }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join("");
    }
}
