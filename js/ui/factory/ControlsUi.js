import Handlebars from "handlebars";
import controlsTemplate from "../../template/factory/controls.html?raw";
import ClearPackagesAction from "../../game/action/ClearPackagesAction.js";
import ResetFactoryAction from "../../game/action/ResetFactoryAction.js";
import ConfirmUi from "../helper/ConfirmUi.js";
import numberFormat from "/js/base/NumberFormat.js";
import GameEvent from "/js/config/event/GameEvent.js";
import FactoryEvent from "../../config/event/FactoryEvent.js";

const EVENT_KEY = "factoryControlsUi";

export default class ControlsUi {
    constructor(factory) {
        this.factory = factory;
        this.game = factory.getGame();
        this.container = null;
        this.pauseButton = null;
        this.playButton = null;
        this.playFastButton = null;
        this.playNormalButton = null;
        this.pauseComponentButton = null;
        this.bonusTicks = null;
        this.clearPackagesButton = null;
        this.resetFactoryButton = null;
        this.component = null;
    }

    updateControlButtons() {
        const ticker = this.game.getTicker();
        if (ticker.getBonusTicks()) {
            this.bonusTicks.style.display = "block";
            if (ticker.getIsFastActive()) {
                this.playFastButton.style.display = "none";
                this.playNormalButton.style.display = "block";
            } else {
                this.playFastButton.style.display = "block";
                this.playNormalButton.style.display = "none";
            }
        } else {
            this.bonusTicks.style.display = "none";
            this.playFastButton.style.display = "none";
            this.playNormalButton.style.display = "none";
        }

        if (this.factory.getIsPaused()) {
            this.playButton.style.display = "block";
            this.pauseButton.style.display = "none";
        } else {
            this.playButton.style.display = "none";
            this.pauseButton.style.display = "block";
        }
        if (this.pauseComponentButton) {
            const canPauseComponent = this.component && this.component.getMeta().strategy.type !== "transport";
            if (canPauseComponent) {
                this.pauseComponentButton.style.display = "block";
                this.pauseComponentButton.textContent = this.component.isPaused() ? "Resume Component" : "Pause Component";
            } else {
                this.pauseComponentButton.style.display = "none";
            }
        }
    }

    selectComponent(component){
        this.component = component;
        this.updateControlButtons();
    }

    updateBonusTicksValue() {
        const span = this.bonusTicks.querySelector("span");
        if(span){
            span.textContent = numberFormat.formatNumber(this.game.getTicker().getBonusTicks());
        }
        this.updateControlButtons();
    }

    display(container) {
        this.container = container;
        this.container.insertAdjacentHTML("beforeend",Handlebars.compile(controlsTemplate)());

        const ticker = this.game.getTicker();

        this.pauseButton = this.container.querySelector("#stopButton");
        this.playButton = this.container.querySelector("#playButton");
        this.playFastButton = this.container.querySelector("#playFastButton");
        this.playNormalButton = this.container.querySelector("#playNormalButton");
        this.pauseComponentButton = this.container.querySelector("#pauseComponentButton");
        this.bonusTicks = this.container.querySelector("#bonusTicks");
        this.clearPackagesButton = this.container.querySelector("#clearPackages");
        this.resetFactoryButton = this.container.querySelector("#resetFactory");

        this.updateControlButtons();
        this.updateBonusTicksValue();


        const setPaused = (paused, fast = false) => {
            if(fast) {
                ticker.startFast();
            } else {
                ticker.stopFast();
            }
            this.factory.setIsPaused(paused);
            this.updateControlButtons();
        }
        this.pauseButton.addEventListener("pointerdown", () => setPaused(true));
        this.playButton.addEventListener("pointerdown", () => setPaused(false));
        this.playFastButton.addEventListener("pointerdown", () => setPaused(false, true));
        this.playNormalButton.addEventListener("pointerdown", () => setPaused(false));

        this.pauseComponentButton.addEventListener("pointerdown", (event) => {
            event.preventDefault();
            if(!this.component || this.component.getMeta().strategy.type === "transport") return;
            this.component.togglePaused();
            this.updateControlButtons();
        });

        this.clearPackagesButton.addEventListener("pointerdown", () => {
            const action = new ClearPackagesAction(this.factory);
            if (action.canClear()) action.clear();
        });

        this.resetFactoryButton.addEventListener("pointerdown", () => {
            new ConfirmUi("Are you sure?", "This will remove all components from the map")
                .setOkCallback(() => {
                    const action = new ResetFactoryAction(this.factory);
                    if (action.canReset()) action.reset();
                })
                .display();
        });

        this.game.getEventManager().addListener(EVENT_KEY, GameEvent.TICKS_STARTED, () => this.updateControlButtons());
        this.game.getEventManager().addListener(EVENT_KEY, GameEvent.TICKS_STOPPED, () => this.updateControlButtons());
        this.game.getEventManager().addListener(EVENT_KEY, GameEvent.BONUS_TICKS_UPDATED, () => this.updateBonusTicksValue());
        
        this.game.getEventManager().addListener(EVENT_KEY,
            GameEvent.COMPONENT_SELECTED, (selected) => {
                this.component = selected;
                this.updateControlButtons();
            }
        );

        this.factory.getEventManager().addListener(EVENT_KEY,
            FactoryEvent.COMPONENT_SELECTED, (selected) => {
                this.component = selected;
                this.updateControlButtons();
            }
        );
    }

    destroy() {
        this.game.getEventManager().removeListenerForType(EVENT_KEY);
        this.factory.getEventManager().removeListenerForType(EVENT_KEY);
        if (this.container) this.container.innerHTML = "";
        this.container = null;
    }
}
