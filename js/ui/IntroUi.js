import globalUiBus from "../base/GlobalUiBus.js"; // if you have a global event bus
import Handlebars from "handlebars";
import introTemplateHtml from "../template/intro.html";

export default class IntroUi {
    constructor() {
        this.isVisible = false;
        this.container = document.body;
        this.templateHtml = null;
        this.menuMap = {};
    }


    display(templateData = {}) {

        if (this.isVisible) return;

        const wrapper = document.createElement("div");
        wrapper.innerHTML = Handlebars.compile(introTemplateHtml)(templateData);
        this.container.appendChild(wrapper);

        this.isVisible = true;

        const intro = wrapper.querySelector("#intro");
        const introBg = wrapper.querySelector("#introBg");

        // Center horizontally
        const left = (document.documentElement.clientWidth - intro.offsetWidth) / 2;
        intro.style.position = "absolute";
        intro.style.left = `${left}px`;

        // Close button
        const closeBtn = intro.querySelector(".closeButton");
        if (closeBtn) closeBtn.addEventListener("pointerdown", () => this.hide());

        // Menu logic
        const menuLinks = intro.querySelectorAll(".menu a");
        menuLinks.forEach((link) => {
            const id = link.dataset.id;
            const target = intro.querySelector(`#${id}`);
            if (!id || !target) return;
            this.menuMap[id] = target;

            link.addEventListener("pointerdown", () => {
                Object.values(this.menuMap).forEach((el) => (el.style.display = "none"));
                target.style.display = "block";
            });
        });

        // Show default section
        const gettingStarted = intro.querySelector("#gettingStarted");
        if (gettingStarted) gettingStarted.style.display = "block";

        // Click on background closes
        if (introBg) introBg.addEventListener("click", () => this.hide());
    }

    hide() {
        if (!this.isVisible) return;

        const intro = document.querySelector("#intro");
        const introBg = document.querySelector("#introBg");

        if (intro) intro.remove();
        if (introBg) introBg.remove();

        this.isVisible = false;
        this.menuMap = {};
    }

    destroy() {
        this.hide();
        if (this.game?.getEventManager) this.game.getEventManager().removeListenerForType("intro");
        if (this.gameUiEm?.removeListenerForType) this.gameUiEm.removeListenerForType("intro");
    }
}
