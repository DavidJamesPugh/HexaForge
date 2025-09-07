/**
 * ImageMap module - handles loading and managing game images
 * Extracted from original_app.js
 */
define("base/ImageMap", [], function() {
    
    /**
     * ImageMap class for loading and managing images
     * @param {string} path - Base path for images
     * @constructor
     */
    var ImageMap = function(path) {
        this.path = path;
        this.noOfImages = 0;
        this.noOfImagesLoaded = 0;
        this.imagesData = {};
        this.images = {};
    };

    /**
     * Add images to be loaded
     * @param {Object} imageConfig - Object with image names as keys and paths as values
     * @returns {ImageMap} This instance for chaining
     */
    ImageMap.prototype.addImages = function(imageConfig) {
        for (var imageName in imageConfig) {
            if (!this.imagesData[imageName]) {
                this.noOfImages++;
                this.imagesData[imageName] = this.path + imageConfig[imageName];
            }
        }
        return this;
    };

    /**
     * Load all registered images
     * @param {Function} callback - Callback function to call when all images are loaded
     */
    ImageMap.prototype.loadAll = function(callback) {
       // console.log("ImageMap: Start loading " + this.noOfImages + " images");
        
        var self = this;
        
        for (var imageName in this.imagesData) {
            var img = new Image();
            
            img.onload = function() {
                self.noOfImagesLoaded++;
                if (self.noOfImagesLoaded === self.noOfImages) {
                    //console.log("ImageMap: Loaded " + self.noOfImagesLoaded + " images");
                    if (callback) {
                        callback();
                    }
                }
            };
            
            img.onerror = function() {
                console.warn("ImageMap: Failed to load image:", this.src);
                self.noOfImagesLoaded++;
                if (self.noOfImagesLoaded === self.noOfImages) {
                    //console.log("ImageMap: Finished loading process (" + self.noOfImagesLoaded + " total, some may have failed)");
                    if (callback) {
                        callback();
                    }
                }
            };
            
            // Add cache busting parameter to prevent caching issues
            img.src = this.imagesData[imageName] + "?x=" + Math.random();
            this.images[imageName] = img;
        }
        
        // Handle case where no images need to be loaded
        if (this.noOfImages === 0) {
           // console.log("ImageMap: No images to load");
            if (callback) {
                setTimeout(callback, 0);
            }
        }
    };

    /**
     * Get a loaded image by name
     * @param {string} imageName - Name of the image to retrieve
     * @returns {Image|null} The loaded image element or null if not found
     */
    ImageMap.prototype.getImage = function(imageName) {
        return this.images[imageName] || null;
    };

    /**
     * Get the number of images registered for loading
     * @returns {number} Total number of images
     */
    ImageMap.prototype.getTotalImageCount = function() {
        return this.noOfImages;
    };

    /**
     * Get the number of images successfully loaded
     * @returns {number} Number of loaded images
     */
    ImageMap.prototype.getLoadedImageCount = function() {
        return this.noOfImagesLoaded;
    };

    /**
     * Check if all images have been loaded
     * @returns {boolean} True if all images are loaded
     */
    ImageMap.prototype.isAllLoaded = function() {
        return this.noOfImagesLoaded === this.noOfImages;
    };

    /**
     * Get loading progress as a percentage
     * @returns {number} Loading progress (0-100)
     */
    ImageMap.prototype.getLoadingProgress = function() {
        if (this.noOfImages === 0) return 100;
        return Math.round((this.noOfImagesLoaded / this.noOfImages) * 100);
    };

    return ImageMap;
});
