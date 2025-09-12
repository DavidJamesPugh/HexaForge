// MainUi.js
import gameConfig from "../config/config.js";
import imageMap from "../config/gameAssets.js";
import GameUi from "./GameUi.js";
import GlobalUiEvent from "../config/event/GlobalUiEvent.js";
import GameEvent from "../config/event/GameEvent.js";
import globalUiBus from "../base/GlobalUiBus.js";
//import MissionsUi from "./MissionsUi.js";
import RunningInBackgroundInfoUi from "./RunningInBackgroundInfoUi.js";
//import AlertUi from "./helper/AlertUi.js";
//import GoogleAddsUi from "./GoogleAddsUi.js";
import IntroUi from "./IntroUi.js";

export default class MainUi {
    constructor(play) {
        this.play = play;
        this.imageMap = imageMap;
        this.globalUiEm = globalUiBus; // shared singleton
    }

    setupFocusChecker() {
        let hasFocus = document.hasFocus();
        this.focusInterval = setInterval(() => {
            const currentFocus = document.hasFocus();
            if (hasFocus !== currentFocus) {
                hasFocus = currentFocus;
                hasFocus
                    ? this.globalUiEm.invokeEvent(GlobalUiEvent.FOCUS)
                    : this.globalUiEm.invokeEvent(GlobalUiEvent.BLUR);
            }
        }, 200);
    }

    display(container) {
        this.container = container;

        // Initialize background info UI
        this.runningInBackgroundInfoUi = new RunningInBackgroundInfoUi(this.globalUiEm);
        this.runningInBackgroundInfoUi.init();

        // Intro UI if first time
        if (this.play.getGame().getTicker().getNoOfTicks() < 1000) {
            new IntroUi().display();
        }

        this.setupFocusChecker();

        // Google Ads
        if (this.play.getGame().getIsPremium()) {
            console.info("MainUi: Premium version, skipping loading ads");
        }
            // } else {
        //     GoogleAddsUi();
        // }

        // Key press listener
        window.addEventListener("keypress", (e) => {
            this.globalUiEm.invokeEvent(GlobalUiEvent.KEY_PRESS, e);
        });

        // Save on unload
        window.addEventListener("beforeunload", () => {
            this.play.getSaveManager().saveAuto();
        });

        // Global UI events
        this.globalUiEm.addListener("MainUi", GlobalUiEvent.SHOW_MAIN_GAME, () => {
            this._showUi("mainGame");
        });

        // Periodic user hash alert
        this.play.getGame().getEventManager().addListener("MainUi", GameEvent.GAME_TICK, () => {
            const tickCount = this.play.getGame().getTicker().getNoOfTicks();
            if (gameConfig.meta.warnToStoreUserHashAfterTicks[tickCount]) {
                const inputId = `userHashTmpAlert${Math.round(1e10 * Math.random())}`;
                const html = `
                    You seem to be enjoying the game! Here is a good tip that maybe will save the day once!<br/>
                    Make a copy of your user hash. User hash is used to find your save game and purchases if you have any.<br/>
                    Your user hash: 
                    <input type="text" readonly id="${inputId}" value="${this.play.getUserHash()}" 
                        style="border:1px solid red; background:black; color:red; font-weight:bold; padding:4px; margin:3px; width:280px; font-size:0.9em; text-align:center;"/><br/>
                    Ignore this reminder if you already did and have fun!<br/>
                `;
                new AlertUi("SAVE USER HASH TO A SAFE PLACE!", html).display();

                const inputEl = document.getElementById(inputId);
                inputEl.addEventListener("click", () => {
                    inputEl.setSelectionRange(0, inputEl.value.length);
                });
            }
        });

        // Show main game UI by default
        this._showUi("mainGame");
    }

    _showUi(type, mission) {
        this._destroyCurrentUi();

        if (type === "mainGame") {
            this.currentUi = new GameUi(this.play);
        } 
        this.currentUi.display(this.container);
    }

    _destroyCurrentUi() {
        if (this.currentUi) {
            this.currentUi.destroy();
            this.currentUi = null;
        }
    }

    destroy() {
        this.runningInBackgroundInfoUi.destroy();
        this.globalUiEm.removeListenerForType("MainUi");
        this.play.getGame().getEventManager().removeListenerForType("MainUi");
        this.container = null;
        clearInterval(this.focusInterval);
    }
}
