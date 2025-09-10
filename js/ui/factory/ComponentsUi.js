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
            return {
                sub: row.map(id => {
                    const meta = this.game.getMeta().componentsById[id];
                    if (meta && BuyComponentAction.possibleToBuy(this.factory, meta)) {
                        return { id: meta.id, name: meta.name, style: `background-position: -${26 * meta.iconX}px -${26 * meta.iconY}px` };
                    } else if (id === "noComponent") {
                        return { name: "No component", style: "background-position: 0px 0px" };
                    }
                    return {};
                })
            };
        });

        this.container.html(Handlebars.compile(componentsTemplate)({ components }));

        // Event listeners
        this.factory.getEventManager().addListener("componentsUi", FactoryEvent.COMPONENT_META_SELECTED, e => {
            if (this.selectedComponentId !== e) this.lastSelectedComponentId = this.selectedComponentId;
            this.selectedComponentId = e;
            this.container.find(".button").removeClass("buttonSelected");
            this.container.find(".but" + (e || "")).addClass("buttonSelected");
        });

        this.container.find(".button").click(e => {
            const id = $(e.target).attr("data-id");
            this.factory.getEventManager().invokeEvent(FactoryEvent.COMPONENT_META_SELECTED, id || null);
        });

        this.container.find(".button").mouseenter(e => {
            const id = $(e.target).attr("data-id");
            this.factory.getEventManager().invokeEvent(FactoryEvent.HOVER_COMPONENT_META, id || null);
        });

        this.container.find(".button").mouseleave(() => {
            this.factory.getEventManager().invokeEvent(FactoryEvent.HOVER_COMPONENT_META, null);
        });

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

        this.container.find("#makeScreenShotButton").click(() => {
            this.globalUiEm.invokeEvent(FactoryEvent.OPEN_SCREENSHOT_VIEW);
        });

        this.factory.getEventManager().invokeEvent(FactoryEvent.COMPONENT_META_SELECTED, null);
    }

    destroy() {
        this.factory.getEventManager().removeListenerForType("componentsUi");
        this.game.getEventManager().removeListenerForType("componentsUi");
        this.globalUiEm.removeListenerForType("componentsUi");
        this.container.html("");
        this.container = null;
    }
}
