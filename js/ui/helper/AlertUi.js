/**
 * AlertUi - Alert dialog helper
 * Extracted from original_app.js
 */
define("ui/helper/AlertUi", [], function() {

    var alertCount = 0;

    /**
     * AlertUi constructor
     * @param {string} title - Dialog title
     * @param {string} message - Dialog message (can contain HTML)
     */
    var AlertUi = function(title, message) {
        this.title = title;
        this.message = message;
        this.buttonTitle = "OK";
        this.callback = null;
        this.id = "alert" + alertCount++;
        this.idBg = this.id + "Bg";
        this.container = null;
        this.element = null;
        this.bg = null;
    };

    /**
     * Set the button title
     * @param {string} title - Button title
     * @returns {AlertUi} This instance for chaining
     */
    AlertUi.prototype.setButtonTitle = function(title) {
        this.buttonTitle = title;
        return this;
    };

    /**
     * Set the callback function
     * @param {Function} callback - Callback function
     * @returns {AlertUi} This instance for chaining
     */
    AlertUi.prototype.setCallback = function(callback) {
        this.callback = callback;
        return this;
    };

    /**
     * Display the alert dialog
     * @returns {AlertUi} This instance for chaining
     */
    AlertUi.prototype.display = function() {
        var self = this;

        // Create HTML structure
        var html = '<div class="confirmBg" id="' + this.idBg + '"></div>' +
                   '<div class="confirm" id="' + this.id + '">' +
                   '<span class="title">' + this.title + '</span><br/>' +
                   '<span class="message">' + this.message + '</span><br/>' +
                   '<span class="button">' + this.buttonTitle + '</span>' +
                   '</div>';

        this.container = $("body");
        this.container.append(html);

        this.element = this.container.find("#" + this.id);
        this.bg = this.container.find("#" + this.idBg);

        // Set up event handler
        this.element.find(".button").click(function() {
            self.hide();
            if (self.callback) {
                self.callback();
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
     * Hide the alert dialog
     */
    AlertUi.prototype.hide = function() {
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

    return AlertUi;
});
