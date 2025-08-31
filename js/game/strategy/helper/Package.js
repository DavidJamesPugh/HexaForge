/**
 * Package Helper - Manages resource packages for transport and distribution
 * Extracted from original_app.js
 */
define("game/strategy/helper/Package", [], function() {
    
    // Static pool for package reuse
    var packagePool = [];
    
    var Package = function(resourceId, amount, factory) {
        if (!factory) {
            throw new Error("Missing argument factory");
        }
        
        this.resourceId = resourceId;
        this.meta = factory.getGame().getMeta().resourcesById[resourceId];
        this.offset = Math.round(4 * Math.random()) - 2; // Random offset for visual effect
        this.amount = amount;
    };
    
    /**
     * Get a new package instance (from pool if available)
     * @param {string} resourceId - Resource identifier
     * @param {number} amount - Resource amount
     * @param {Object} factory - Factory instance
     * @returns {Package} Package instance
     */
    Package.getNew = function(resourceId, amount, factory) {
        if (packagePool.length > 0) {
            var packageInstance = packagePool.pop();
            packageInstance.resourceId = resourceId;
            packageInstance.meta = factory.getGame().getMeta().resourcesById[resourceId];
            packageInstance.offset = Math.round(4 * Math.random()) - 2;
            packageInstance.amount = amount;
            return packageInstance;
        } else {
            return new Package(resourceId, amount, factory);
        }
    };
    
    /**
     * Free a package instance back to the pool
     * @param {Package} packageInstance - Package instance to free
     */
    Package.free = function(packageInstance) {
        packagePool.push(packageInstance);
    };
    
    /**
     * Get the resource ID
     * @returns {string} Resource identifier
     */
    Package.prototype.getResourceId = function() {
        return this.resourceId;
    };
    
    /**
     * Get the resource ID number
     * @returns {number} Resource ID number
     */
    Package.prototype.getResourceIdNum = function() {
        return this.meta ? this.meta.idNum : 0;
    };
    
    /**
     * Get string representation of the package
     * @returns {string} Resource ID string
     */
    Package.prototype.toString = function() {
        return this.resourceId;
    };
    
    /**
     * Get the visual offset for rendering
     * @returns {number} Offset value
     */
    Package.prototype.getOffset = function() {
        return this.offset;
    };
    
    /**
     * Get the resource amount
     * @returns {number} Resource amount
     */
    Package.prototype.getAmount = function() {
        return this.amount;
    };
    
    /**
     * Export package data to writer (static method)
     * @param {Package} packageInstance - Package to export
     * @param {Object} writer - BinaryArrayWriter instance
     */
    Package.staticExportData = function(packageInstance, writer) {
        if (packageInstance) {
            // TODO: Implement when BinaryArrayWriter is available
            // writer.writeUint8(packageInstance.getResourceIdNum());
            // writer.writeUint8(packageInstance.getAmount());
            console.log("Package.staticExportData - BinaryArrayWriter not yet extracted");
        } else {
            // TODO: Implement when BinaryArrayWriter is available
            // writer.writeUint8(0);
            console.log("Package.staticExportData (null) - BinaryArrayWriter not yet extracted");
        }
    };
    
    /**
     * Create package from exported data
     * @param {Object} factory - Factory instance
     * @param {Object} reader - BinaryArrayReader instance
     * @param {number} version - Save file version
     * @returns {Package|null} Package instance or null
     */
    Package.createFromExport = function(factory, reader, version) {
        // TODO: Implement when BinaryArrayReader is available
        // var resourceIdNum = reader.readUint8();
        // if (resourceIdNum === 0) return null;
        // 
        // var amount = version >= 6 ? reader.readUint8() : 1;
        // var resourceMeta = factory.getGame().getMeta().resourcesByIdNum[resourceIdNum];
        // 
        // if (resourceMeta) {
        //     return Package.getNew(resourceMeta.id, amount, factory);
        // }
        // 
        // return null;
        console.log("Package.createFromExport - BinaryArrayReader not yet extracted");
        return null;
    };
    
    return Package;
});
