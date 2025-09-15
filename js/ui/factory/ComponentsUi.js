// ComponentsUi.js
import componentsTemplate from "../../template/factory/components.html";
import BuyComponentAction from "../../game/action/BuyComponentAction.js";
import FactoryEvent from "../../config/event/FactoryEvent.js";
import GlobalUiEvent from "../../config/event/GlobalUiEvent.js";
import Handlebars from "handlebars";
import GlobalUiBus from "../../base/GlobalUiBus.js";

export default class ComponentsUi {
    constructor(factory) {
        this.globalUiEm = GlobalUiBus;
        this.factory = factory;
        this.game = factory.getGame();
        this.lastSelectedComponentId = null;
        this.selectedComponentId = null;
    }

    display(container) {
        this.container = container;

        const components = this.game.getMeta().componentsSelection.map(row => {
            
            sub: row.map(id => {
                const meta = this.game.getMeta().componentsById[id];
                if (meta && BuyComponentAction.possibleToBuy(this.factory, meta)) {
                    return { id: meta.id, name: meta.name, style: `background-position: -${26 * meta.iconX}px -${26 * meta.iconY}px` };
                } else if (id === "noComponent") {
                    return { name: "No component", style: "background-position: 0px 0px" };
                }
                return {};
                
            });
        });

        this.container.insertAdjacentHTML("beforeend", Handlebars.compile(componentsTemplate)({ components }));

        // Event listeners
        this.factory.getEventManager().addListener("componentsUi", FactoryEvent.COMPONENT_META_SELECTED, e => {
            if (this.selectedComponentId !== e) this.lastSelectedComponentId = this.selectedComponentId;
            this.selectedComponentId = e;
            this.container.querySelectorAll(".button").forEach(div => div.classList.remove("buttonSelected"));
            if (e) {
                this.container.querySelectorAll(`.but${e}`).forEach(div => div.classList.add("buttonSelected"));
            }
        });

        this.container.addEventListener("click", (event) => {
            const button = event.target.closest(".button");
            if (!button) return;
            const id = button.dataset.id ?? null;
            
            this.factory.getEventManager().invokeEvent(FactoryEvent.COMPONENT_META_SELECTED, id);
        });

        this.container.addEventListener("pointenter", event => {
            const button = event.target.closest(".button");
            if (!button) return;
            const id = button.dataset.id ?? null;
            this.factory.getEventManager().invokeEvent(FactoryEvent.HOVER_COMPONENT_META, id);
        }, true);

        this.container.addEventListener("pointerleave", event => {
            const button = event.target.closest(".button");
            if (!button) return;
            this.factory.getEventManager().invokeEvent(FactoryEvent.HOVER_COMPONENT_META, null);
        }, true);

        this.globalUiEm.addListener("componentsUi", GlobalUiEvent.KEY_PRESS, e => {
            const keyCode = e.charCode ?? e.keyCode;
            if (keyCode === 0 || keyCode === 32) {
                this.factory.getEventManager().invokeEvent(
                    FactoryEvent.COMPONENT_META_SELECTED,
                    this.selectedComponentId ? null : this.lastSelectedComponentId
                );
                e.preventDefault();
            }
        });
        const screenshotBtn = this.container.querySelector("#makeScreenShotButton");
        screenshotBtn?.addEventListener("click", () => {
            this.globalUiEm.invokeEvent(FactoryEvent.OPEN_SCREENSHOT_VIEW);
        });

        this.factory.getEventManager().invokeEvent(FactoryEvent.COMPONENT_META_SELECTED, null);
    }

    destroy() {
        this.factory.getEventManager().removeListenerForType("componentsUi");
        this.game.getEventManager().removeListenerForType("componentsUi");
        this.globalUiEm.removeListenerForType("componentsUi");
        this.container.innerHTML = "";
        this.container = null;
    }
}
