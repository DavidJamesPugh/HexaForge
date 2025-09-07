/**
 * ScreenshotUi - Screenshot functionality for the map
 * Extracted from original_app.js
 */
define("ui/factory/ScreenshotUi", function() {

    console.log("ScreenshotUi module loading...");

    /**
     * ScreenshotUi constructor
     * @param {Object} canvas - The main canvas element to capture
     */
    var ScreenshotUi = function(canvas) {
        console.log("ScreenshotUi constructor called");
        this.canvas = canvas;
    };

    /**
     * Take a screenshot of the current map
     * @returns {string} Data URL of the screenshot
     */
    ScreenshotUi.prototype.takeScreenshot = function() {
        if (this.canvas) {
            return this.canvas.toDataURL('image/png');
        }
        return null;
    };

    return ScreenshotUi;
});
