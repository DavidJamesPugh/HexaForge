/**
 * ImageMap class - handles loading and managing game images
 */
export default class ImageMap {
    /**
     * @param {string} path - Base path for images
     */
    constructor(path) {
      this.path = path;
      this.imagesData = {};   // imageName -> URL
      this.images = {};       // imageName -> HTMLImageElement
      this.noOfImagesLoaded = 0;
    }
  
    /**
     * Add images to be loaded
     * @param {Object} imageConfig - { imageName: relativePath }
     * @returns {ImageMap} This instance for chaining
     */
    addImages(imageConfig) {
      for (const [name, relativePath] of Object.entries(imageConfig)) {
        if (!this.imagesData[name]) {
          this.imagesData[name] = this.path + relativePath;
        }
      }
      return this;
    }
  
    /**
     * Load all registered images
     * @returns {Promise<void>} Resolves when all images are loaded (or failed)
     */
    async loadAllAsync() {
      const imageEntries = Object.entries(this.imagesData);
  
      if (imageEntries.length === 0) return;
  
      this.noOfImagesLoaded = 0;
  
      await Promise.all(imageEntries.map(([name, src]) => new Promise((resolve) => {
        const img = new Image();
  
        img.onload = () => {
          this.noOfImagesLoaded++;
          resolve();
        };
  
        img.onerror = () => {
          console.warn(`ImageMap: Failed to load image: ${src}`);
          this.noOfImagesLoaded++;
          resolve();
        };
  
        // Cache-busting
        img.src = `${src}?x=${Math.random()}`;
        this.images[name] = img;
      })));
    }
  
    /**
     * Get a loaded image by name
     * @param {string} name
     * @returns {HTMLImageElement|null}
     */
    getImage(name) {
      return this.images[name] || null;
    }
  
    /**
     * Total number of images registered
     */
    get totalImages() {
      return Object.keys(this.imagesData).length;
    }
  
    /**
     * Number of images loaded successfully (or failed)
     */
    get loadedImages() {
      return this.noOfImagesLoaded;
    }
  
    /**
     * Check if all images have finished loading
     */
    get isAllLoaded() {
      return this.noOfImagesLoaded === this.totalImages;
    }
  
    /**
     * Loading progress percentage (0-100)
     */
    get loadingProgress() {
      if (this.totalImages === 0) return 100;
      return Math.round((this.noOfImagesLoaded / this.totalImages) * 100);
    }
  }
  