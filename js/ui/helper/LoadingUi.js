import Handlebars from "handlebars";
import loadingTemplateHtml from "../../template/helper/loading.html";

import UiUtils from "../utils/UiUtils.js";

let loadingCounter = 0;

export default class LoadingUi {
    constructor(title = "Loading...") {
        this.title = title;
        this.id = `loading${loadingCounter++}`;
        this.idBg = `${this.id}Bg`;

        this.container = null;
        this.element = null;
        this.bg = null;
        this.clickCallback = null;
    }

    setClickCallback(callback) {
        this.clickCallback = callback;
        return this;
    }

    display() {
        this.container = $("body");

        this.container.append(
            Handlebars.compile(loadingTemplateHtml)({
                id: this.id,
                idBg: this.idBg,
                title: this.title
            })
        );

        this.element = this.container.find(`#${this.id}`);
        this.bg = this.container.find(`#${this.idBg}`);

        // Center
        UiUtils.centerElement(this.element);
        // Fade in
        this.element.hide().fadeIn(200);
        this.bg.hide().fadeIn(200);

        if (this.clickCallback) {
            this.bg.click(() => {
                this.clickCallback();
                this.hide();
            });
        }

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
