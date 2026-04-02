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
            const ticker = this.game.getTicker();
            const ticks = ticker.getBonusTicks();
            const ticksPerSec = ticker.getTicksPerSec();
            const totalSeconds = Math.floor(ticks / ticksPerSec);
            const timeStr = this._formatTime(totalSeconds);
            span.textContent = `${numberFormat.formatNumber(ticks)} (${timeStr})`;
        }
        this.updateControlButtons();
    }

    _formatTime(totalSeconds) {
        if (totalSeconds < 60) return `${totalSeconds}s`;
        if (totalSeconds < 3600) {
            const m = Math.floor(totalSeconds / 60);
            const s = totalSeconds % 60;
            return s > 0 ? `${m}m ${s}s` : `${m}m`;
        }
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        return m > 0 ? `${h}h ${m}m` : `${h}h`;
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
            this.factory.getEventManager().invokeEvent(FactoryEvent.COMPONENT_PAUSED, this.component
            );
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
