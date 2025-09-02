/**
 * UserHash - Manages user identification and hash generation
 * Based on the original Factory Idle implementation
 */

define("play/UserHash", [], function() {
    
    var UserHash = function(storageKey) {
        this.storageKey = storageKey || "HexaForgeUserHash";
        this.hashLength = 40;
        this.userHash = null;
    };
    
    UserHash.prototype.init = function() {
        // Load from localStorage first
        this.userHash = localStorage[this.storageKey];
        
        // If not found, generate a new one
        if (!this.userHash) {
            this.userHash = this._generateUserHash(this.hashLength);
        }
        
        // Save to localStorage
        this.updateUserHash(this.userHash);
        
        console.log("UserHash: User hash loaded " + this.userHash);
        return this;
    };
    
    UserHash.prototype.updateUserHash = function(newHash) {
        this.userHash = newHash;
        localStorage[this.storageKey] = newHash;
        console.log("UserHash: Updated user hash to " + newHash);
    };
    
    UserHash.prototype.getUserHash = function() {
        return this.userHash;
    };
    
    UserHash.prototype.toString = function() {
        return this.userHash;
    };
    
    UserHash.prototype._generateUserHash = function(length) {
        var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var hash = '';
        for (var i = 0; i < length; i++) {
            hash += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return hash;
    };
    
    return UserHash;
});
