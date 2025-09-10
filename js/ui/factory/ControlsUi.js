import Handlebars from "handlebars";
import controlsTemplate from "../../template/factory/controls.html";
import ClearPackagesAction from "../../game/action/ClearPackagesAction.js";
import ResetFactoryAction from "../../game/action/ResetFactoryAction.js";
import ConfirmUi from "../helper/ConfirmUi.js";

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
        this.bonusTicks = null;
        this.clearPackagesButton = null;
        this.resetFactoryButton = null;
    }

    updateControlButtons() {
        const ticker = this.game.getTicker();
        if (ticker.getBonusTicks()) {
            this.bonusTicks.show();
            if (ticker.getIsFastActive()) {
                this.playFastButton.hide();
                this.playNormalButton.show();
            } else {
                this.playFastButton.show();
                this.playNormalButton.hide();
            }
        } else {
            this.bonusTicks.hide();
            this.playFastButton.hide();
            this.playNormalButton.hide();
        }

        if (this.factory.getIsPaused()) {
            this.playButton.show();
            this.pauseButton.hide();
        } else {
            this.playButton.hide();
            this.pauseButton.show();
        }
    }

    updateBonusTicksValue() {
        this.bonusTicks.find("span").html(nf(this.game.getTicker().getBonusTicks()));
        this.updateControlButtons();
    }

    display(container) {
        this.container = container;
        this.container.html(Handlebars.compile(controlsTemplate)());

        const ticker = this.game.getTicker();

        this.pauseButton = this.container.find("#stopButton");
        this.playButton = this.container.find("#playButton");
        this.playFastButton = this.container.find("#playFastButton");
        this.playNormalButton = this.container.find("#playNormalButton");
        this.bonusTicks = this.container.find("#bonusTicks");
        this.clearPackagesButton = this.container.find("#clearPackages");
        this.resetFactoryButton = this.container.find("#resetFactory");

        this.updateControlButtons();
        this.updateBonusTicksValue();

        this.pauseButton.click(() => {
            ticker.stopFast();
            this.factory.setIsPaused(true);
            this.updateControlButtons();
        });

        this.playButton.click(() => {
            ticker.stopFast();
            this.factory.setIsPaused(false);
            this.updateControlButtons();
        });

        this.playFastButton.click(() => {
            ticker.startFast();
            this.factory.setIsPaused(false);
            this.updateControlButtons();
        });

        this.playNormalButton.click(() => {
            ticker.stopFast();
            this.factory.setIsPaused(false);
            this.updateControlButtons();
        });

        this.clearPackagesButton.click(() => {
            const action = new ClearPackagesAction(this.factory);
            if (action.canClear()) action.clear();
        });

        this.resetFactoryButton.click(() => {
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
    }

    destroy() {
        this.game.getEventManager().removeListenerForType(EVENT_KEY);
        if (this.container) this.container.html("");
        this.container = null;
    }
}
