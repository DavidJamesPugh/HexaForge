import GlobalUiEvent from "../config/event/GlobalUiEvent.js";
import globalUiBus from "../base/GlobalUiBus.js";

export default class RunningInBackgroundInfoUi {
    constructor() {
        this.globalUiEm = globalUiBus;
        this.timer = null;
        this.container = null;
        this.containerElement = null;
        this.backgroundElement = null;
        this.templateHtml = null;
    }

    async loadTemplate(url = "/template/runningInBackgroundInfoUi.html") {
        const res = await fetch(url);
        this.templateHtml = await res.text();
    }

    init() {
        this.globalUiEm.addListener("RunningInBackgroundInfoUi", GlobalUiEvent.FOCUS, () => this.hide());
        this.globalUiEm.addListener("RunningInBackgroundInfoUi", GlobalUiEvent.BLUR, () => this.delayedDisplay());
    }

    destroy() {
        this.globalUiEm.removeListenerForType("RunningInBackgroundInfoUi");
    }

    delayedDisplay(delayMs = 15000) {
        if (this.timer) clearTimeout(this.timer);
        this.timer = setTimeout(() => this.display(), delayMs);
    }

    display(templateData = {}) {
        if (!this.templateHtml) {
            console.error("Template not loaded yet!");
            return;
        }

        this.container = document.body;
        const compiled = Handlebars.compile(this.templateHtml)(templateData);

        const wrapper = document.createElement("div");
        wrapper.innerHTML = compiled;
        this.container.appendChild(wrapper);

        this.backgroundElement = wrapper.querySelector(".runningInBackgroundInfoUiBg");
        this.containerElement = wrapper.querySelector(".runningInBackgroundInfoUi");

        const left = this.container.offsetWidth / 2 - this.containerElement.offsetWidth / 2;
        const top = 150;

        Object.assign(this.containerElement.style, { position: "absolute", left: `${left}px`, top: `${top}px` });
        this.backgroundElement.style.display = "none";
        this.containerElement.style.display = "none";

        // Fade in using simple CSS transition
        this.backgroundElement.style.transition = "opacity 0.5s";
        this.containerElement.style.transition = "opacity 0.5s";
        requestAnimationFrame(() => {
            this.backgroundElement.style.display = "";
            this.backgroundElement.style.opacity = 1;
            this.containerElement.style.display = "";
            this.containerElement.style.opacity = 1;
        });
    }

    hide() {
        if (this.timer) clearTimeout(this.timer);

        if (this.backgroundElement) {
            this.backgroundElement.remove();
            this.backgroundElement = null;
        }

        if (this.containerElement) {
            this.containerElement.remove();
            this.containerElement = null;
        }
    }
}
