/**
 * ConfirmUi - Confirmation dialog helper
 * Extracted from original_app.js
 */
define("ui/helper/ConfirmUi", [], function() {

    var confirmCount = 0;

    /**
     * ConfirmUi constructor
     * @param {string} title - Dialog title
     * @param {string} message - Dialog message (can contain HTML)
     */
    var ConfirmUi = function(title, message) {
        this.title = title;
        this.message = message;
        this.okTitle = "Ok";
        this.cancelTitle = "Cancel";
        this.okCallback = null;
        this.cancelCallback = null;
        this.id = "confirm" + confirmCount++;
        this.idBg = this.id + "Bg";
        this.container = null;
        this.element = null;
        this.bg = null;
    };

    /**
     * Set the OK button title
     * @param {string} title - OK button title
     * @returns {ConfirmUi} This instance for chaining
     */
    ConfirmUi.prototype.setOkTitle = function(title) {
        this.okTitle = title;
        return this;
    };

    /**
     * Set the Cancel button title
     * @param {string} title - Cancel button title
     * @returns {ConfirmUi} This instance for chaining
     */
    ConfirmUi.prototype.setCancelTitle = function(title) {
        this.cancelTitle = title;
        return this;
    };

    /**
     * Set the OK button callback
     * @param {Function} callback - OK button callback
     * @returns {ConfirmUi} This instance for chaining
     */
    ConfirmUi.prototype.setOkCallback = function(callback) {
        this.okCallback = callback;
        return this;
    };

    /**
     * Set the Cancel button callback
     * @param {Function} callback - Cancel button callback
     * @returns {ConfirmUi} This instance for chaining
     */
    ConfirmUi.prototype.setCancelCallback = function(callback) {
        this.cancelCallback = callback;
        return this;
    };

    /**
     * Display the confirmation dialog
     * @returns {ConfirmUi} This instance for chaining
     */
    ConfirmUi.prototype.display = function() {
        var self = this;

        // Create HTML structure
        var html = '<div class="confirmBg" id="' + this.idBg + '"></div>' +
                   '<div class="confirm" id="' + this.id + '">' +
                   '<span class="title">' + this.title + '</span><br/>' +
                   '<span class="message">' + this.message + '</span><br/>' +
                   '<span class="cancelButton">' + this.cancelTitle + '</span>' +
                   '<span class="okButton">' + this.okTitle + '</span>' +
                   '</div>';

        this.container = $("body");
        this.container.append(html);

        this.element = this.container.find("#" + this.id);
        this.bg = this.container.find("#" + this.idBg);

        // Set up event handlers
        this.element.find(".okButton").click(function() {
            self.hide();
            if (self.okCallback) {
                self.okCallback();
            }
        });

        this.element.find(".cancelButton").click(function() {
            self.hide();
            if (self.cancelCallback) {
                self.cancelCallback();
            }
        });

        // Center the dialog
        this.element.css("top", Math.round(($(window).height() - this.element.height()) / 2));
        this.element.css("left", Math.round(($(window).width() - this.element.width()) / 2));

        // Show with fade effect
        this.bg.hide().fadeIn(200);
        this.element.hide().fadeIn(200);

        return this;
    };

    /**
     * Hide the confirmation dialog
     */
    ConfirmUi.prototype.hide = function() {
        var self = this;

        if (this.element) {
            this.element.fadeOut(200, function() {
                self.element.remove();
            });
        }

        if (this.bg) {
            this.bg.fadeOut(200, function() {
                self.bg.remove();
            });
        }
    };

    return ConfirmUi;
});