import Handlebars from "handlebars";
import confirmTemplateHtml from "../../template/helper/confirm.html";

let confirmCounter = 0;

export default class ConfirmUi {
    constructor(title, message) {
        this.title = title;
        this.message = message;
        this.okTitle = "Ok";
        this.cancelTitle = "Cancel";
        this.id = "confirm" + confirmCounter++;
        this.idBg = this.id + "Bg";
    }

    setOkTitle(title) {
        this.okTitle = title;
        return this;
    }

    setCancelTitle(title) {
        this.cancelTitle = title;
        return this;
    }

    setOkCallback(callback) {
        this.okCallback = callback;
        return this;
    }

    setCancelCallback(callback) {
        this.cancelCallback = callback;
        return this;
    }

    display() {
        this.container = $("body");
        this.container.append(
            Handlebars.compile(confirmTemplateHtml)({
                id: this.id,
                idBg: this.idBg,
                title: this.title,
                message: this.message,
                okTitle: this.okTitle,
                cancelTitle: this.cancelTitle,
            })
        );

        this.element = $("#" + this.id);
        this.bg = $("#" + this.idBg);

        // Center the modal
        this.element.css("top", Math.round(($(window).height() - this.element.height()) / 2));
        this.element.css("left", Math.round(($(window).width() - this.element.width()) / 2));

        this.element.find(".okButton").click(() => {
            this.hide();
            this.okCallback && this.okCallback();
        });

        this.element.find(".cancelButton").click(() => {
            this.hide();
            this.cancelCallback && this.cancelCallback();
        });

        this.bg.hide().fadeIn(200);
        this.element.hide().fadeIn(200);

        return this;
    }

    hide() {
        if (this.element) {
            this.element.fadeOut(200, () => this.element.remove());
        }
        if (this.bg) {
            this.bg.fadeOut(200, () => this.bg.remove());
        }
    }
}
