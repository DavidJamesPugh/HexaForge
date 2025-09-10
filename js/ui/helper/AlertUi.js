import Handlebars from "handlebars";
import alertTemplateHtml from "../../template/helper/alert.html";

let alertCounter = 0;

export default class AlertUi {
    constructor(title, message) {
        this.title = title;
        this.message = message;
        this.buttonTitle = "OK";
        this.id = `alert${alertCounter++}`;
        this.idBg = `${this.id}Bg`;
        this.container = null;
        this.element = null;
        this.bg = null;
        this.callback = null;
    }

    setButtonTitle(title) {
        this.buttonTitle = title;
        return this;
    }

    setCallback(callback) {
        this.callback = callback;
        return this;
    }

    display() {
        this.container = $("body");
        this.container.append(
            Handlebars.compile(alertTemplateHtml)({
                id: this.id,
                idBg: this.idBg,
                title: this.title,
                message: this.message,
                buttonTitle: this.buttonTitle,
            })
        );

        this.element = this.container.find(`#${this.id}`);
        this.bg = this.container.find(`#${this.idBg}`);

        this.element.find(".button").click(() => {
            this.hide();
            if (this.callback) this.callback();
        });

        this.element.css("top", Math.round(($(window).height() - this.element.height()) / 2));
        this.element.css("left", Math.round(($(window).width() - this.element.width()) / 2));

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
