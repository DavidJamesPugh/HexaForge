/**
 * LoadingUi - Displays loading indicators
 * Based on the original Factory Idle implementation
 */

define("ui/helper/LoadingUi", [], function() {
    
    var LoadingUi = function(title) {
        this.title = title || "Loading...";
        this.id = "loading" + (LoadingUi.counter++);
        this.idBg = this.id + "Bg";
    };
    
    LoadingUi.counter = 0;
    
    LoadingUi.prototype.setClickCallback = function(callback) {
        this.clickCallback = callback;
        return this;
    };
    
    LoadingUi.prototype.display = function() {
        var self = this;
        this.container = $("body");
        
        var html = '<div class="loadingBg" id="' + this.idBg + '"></div>' +
                   '<div class="loading" id="' + this.id + '">' +
                   '<center>' +
                   '<img src="img/loader.gif" class="icon"/><br />' +
                   '<span class="message">' + this.title + '</span>' +
                   '</center>' +
                   '</div>';
        
        this.container.append(html);
        
        this.element = this.container.find("#" + this.id);
        this.bg = this.container.find("#" + this.idBg);
        
        // Center the loading element
        this.element.css("top", Math.round(($(window).height() - this.element.height()) / 2));
        this.element.css("left", Math.round(($(window).width() - this.element.width()) / 2));
        
        this.element.hide().fadeIn(200);
        this.bg.hide().fadeIn(200);
        
        if (this.clickCallback) {
            this.bg.click(function() {
                self.clickCallback();
                self.hide();
            });
        }
        
        return this;
    };
    
    LoadingUi.prototype.hide = function() {
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
    
    return LoadingUi;
});
