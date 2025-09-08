define("ui/helper/TipUi", [
   // "text!template/helper/tip.html"
], function(tipTemplate) {
    var tipIdCounter = 0;

    var TipUi = function(initElement, content) {
        this.initElement = initElement;
        if (typeof content === "string") {
            this.content = content;
        } else {
            this.element = content;
        }
        this.isVisible = false;
    };

    TipUi.prototype.init = function() {
        var self = this;
        if (!this.element) {
            this.id = "tip" + tipIdCounter++;
            var bodyElement = $("body");
            bodyElement.append(Handlebars.compile(tipTemplate)({
                id: this.id,
                content: this.content
            }));
            this.element = bodyElement.find("#" + this.id);
        }

        this.element.css("position", "absolute").hide();

        this.mouseMoveHandler = function(event) {
            self.updateLocation(event);
            self.display();
        };

        this.mouseOutHandler = function(event) {
            self.hide();
        };

        this.initElement.bind("mousemove", this.mouseMoveHandler).bind("mouseout", this.mouseOutHandler);

        return this;
    };

    TipUi.prototype.destroy = function() {
        this.hide();
        this.initElement.unbind("mousemove", this.mouseMoveHandler).unbind("mouseout", this.mouseOutHandler);
        return this;
    };

    TipUi.prototype.display = function() {
        if (!this.isVisible) {
            this.isVisible = true;
            this.element.fadeIn(200);
        }
    };

    TipUi.prototype.updateLocation = function(event) {
        var elementWidth = this.element.width();
        var elementHeight = this.element.height();
        var leftPosition = event.pageX - elementWidth / 2;
        var topPosition = event.pageY + 15;
        var windowWidth = $(window).width();
        var windowHeight = $(window).height();
        var scrollLeft = $(window).scrollLeft();
        var scrollTop = $(window).scrollTop();

        // Keep tooltip within viewport bounds
        if (leftPosition - scrollLeft < 10) {
            leftPosition = scrollLeft + 10;
        }
        if (leftPosition + elementWidth - scrollLeft > windowWidth - 20) {
            leftPosition = windowWidth + scrollLeft - elementWidth - 20;
        }
        if (topPosition + elementHeight - scrollTop > windowHeight - 20) {
            topPosition = event.pageY - elementHeight - 20;
        }

        this.element.css("left", leftPosition).css("top", topPosition);
    };

    TipUi.prototype.hide = function() {
        if (this.isVisible) {
            this.element.finish().fadeOut(200);
            this.isVisible = false;
        }
    };

    return TipUi;
});
