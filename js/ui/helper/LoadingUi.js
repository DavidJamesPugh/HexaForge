import Handlebars from "handlebars";
import loadingTemplateHtml from "../../template/helper/loading.html?raw";

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

        document.body.insertAdjacentHTML('beforeend', Handlebars.compile(loadingTemplateHtml)({
            id: this.id,
            idBg: this.idBg,
            title: this.title
        }));

            
        this.element = document.getElementById(this.id);
        this.bg = document.getElementById(this.idBg);

        

        // Center
        UiUtils.centerElement(this.element);
        // Fade in
        requestAnimationFrame(() => {
            this.element.classList.add('visible');
            this.bg.classList.add('visible');
        });

        if (this.clickCallback) {
            this.bg.addEventListener("click", () => {
                this.clickCallback();
                this.hide();
            });
        }

        return this;
    }

    hide() {
        if (!this.element || !this.bg) return;
        // Remove 'visible' class to trigger fade-out
        this.element.classList.remove('visible');
        this.bg.classList.remove('visible');

        // Wait for CSS transition to finish before removing elements
        const removeAfterTransition = (el) => {
        if (!el) return;
        const duration = parseFloat(getComputedStyle(el).transitionDuration) * 1000;
        setTimeout(() => el.remove(), duration);
        };

        removeAfterTransition(this.element);
        removeAfterTransition(this.bg);
    }
}
