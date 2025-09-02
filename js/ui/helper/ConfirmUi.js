/**
 * ConfirmUi - Displays confirmation dialogs
 * Based on the original Factory Idle implementation
 */

define("ui/helper/ConfirmUi", [], function() {
    
    var ConfirmUi = function(title, message) {
        this.title = title || "Confirm";
        this.message = message || "Are you sure?";
        this.okTitle = "OK";
        this.cancelTitle = "Cancel";
        this.okCallback = null;
        this.cancelCallback = null;
    };
    
    ConfirmUi.prototype.setOkTitle = function(title) {
        this.okTitle = title;
        return this;
    };
    
    ConfirmUi.prototype.setCancelTitle = function(title) {
        this.cancelTitle = title;
        return this;
    };
    
    ConfirmUi.prototype.setOkCallback = function(callback) {
        this.okCallback = callback;
        return this;
    };
    
    ConfirmUi.prototype.setCancelCallback = function(callback) {
        this.cancelCallback = callback;
        return this;
    };
    
    ConfirmUi.prototype.display = function() {
        var self = this;
        
        var html = '<div class="confirmBg" id="confirmBg"></div>' +
                   '<div class="confirm" id="confirm">' +
                   '<div class="confirmTitle">' + this.title + '</div>' +
                   '<div class="confirmMessage">' + this.message + '</div>' +
                   '<div class="confirmButtons">' +
                   '<input type="button" class="confirmOk" value="' + this.okTitle + '"/>' +
                   '<input type="button" class="confirmCancel" value="' + this.cancelTitle + '"/>' +
                   '</div>' +
                   '</div>';
        
        $("body").append(html);
        
        var confirmElement = $("#confirm");
        var confirmBg = $("#confirmBg");
        
        // Center the confirm dialog
        confirmElement.css("top", Math.round(($(window).height() - confirmElement.height()) / 2));
        confirmElement.css("left", Math.round(($(window).width() - confirmElement.width()) / 2));
        
        confirmElement.hide().fadeIn(200);
        confirmBg.hide().fadeIn(200);
        
        // OK button
        confirmElement.find(".confirmOk").click(function() {
            if (self.okCallback) {
                self.okCallback();
            }
            self.hide();
        });
        
        // Cancel button
        confirmElement.find(".confirmCancel").click(function() {
            if (self.cancelCallback) {
                self.cancelCallback();
            }
            self.hide();
        });
        
        // Background click to cancel
        confirmBg.click(function() {
            if (self.cancelCallback) {
                self.cancelCallback();
            }
            self.hide();
        });
        
        return this;
    };
    
    ConfirmUi.prototype.hide = function() {
        $("#confirm").fadeOut(200, function() {
            $(this).remove();
        });
        $("#confirmBg").fadeOut(200, function() {
            $(this).remove();
        });
    };
    
    return ConfirmUi;
});
