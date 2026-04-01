// MainUi.js
import gameConfig from "../config/config.js";
import GameUi from "./GameUi.js";
import GlobalUiEvent from "../config/event/GlobalUiEvent.js";
import GameEvent from "../config/event/GameEvent.js";
import globalUiBus from "../base/GlobalUiBus.js";
import RunningInBackgroundInfoUi from "./RunningInBackgroundInfoUi.js";
import AlertUi from "./helper/AlertUi.js";
import IntroUi from "./IntroUi.js";

export default class MainUi {
    constructor(play, imageMap) {
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
        const ticker = this.play.getGame().getTicker();
        
        const introUi = new IntroUi(); // singleton instance somewhere globally
        const startTime = Date.now();
        
        const listener = () => {
            const elapsed = Date.now() - startTime;
            if (ticker.getNoOfTicks() < 1000 && elapsed >= 100) {
                introUi.display();
                this.play.getGame().getEventManager().removeListener("MainUi", GameEvent.TICKS_STARTED, listener);
            }
        };
        this.play.getGame().getEventManager().addListener("MainUi", GameEvent.TICKS_STARTED, listener);

        this.setupFocusChecker();

        // Google Ads
        // if (this.play.getGame().getIsPremium()) {
        //     console.info("MainUi: Premium version, skipping loading ads");
        //  } else {
        //     GoogleAdsUi();
        //  }

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

        // Dev mode toggle (only on localhost)
        if (this.play.isDevMode()) {
            this._createDevToggle();
        }

        // Show main game UI by default
        this._showUi("mainGame");
    }

    _createDevToggle() {
        const game = this.play.getGame();

        this.devToggle = document.createElement("div");
        this.devToggle.className = "devModeToggle";
        this.devToggle.innerHTML = `
            <div class="devToggle-row">
                <span class="devToggle-indicator"></span>
                <span class="devToggle-label"></span>
            </div>
            <div class="devToggle-status"></div>
        `;
        this.devToggle.addEventListener("click", () => {
            game.isDevMode = !game.isDevMode;
            this._updateDevToggle();
            setTimeout(() => this._showUi("mainGame"), 0);
        });
        document.body.appendChild(this.devToggle);
        this._updateDevToggle();
    }

    _updateDevToggle() {
        const game = this.play.getGame();
        const devOn = game.isDevMode;
        const hasPurchase = game.isPremium;

        this.devToggle.classList.toggle("active", devOn);

        const label = this.devToggle.querySelector(".devToggle-label");
        label.textContent = devOn ? "DEV MODE" : "DEV OFF";

        const indicator = this.devToggle.querySelector(".devToggle-indicator");
        indicator.classList.toggle("on", devOn);

        const status = this.devToggle.querySelector(".devToggle-status");
        if (hasPurchase) {
            status.textContent = "PREMIUM (purchased)";
            status.className = "devToggle-status purchased";
        } else if (devOn) {
            status.textContent = "PREMIUM (dev)";
            status.className = "devToggle-status devGranted";
        } else {
            status.textContent = "FREE";
            status.className = "devToggle-status free";
        }
    }

    _showUi(type, mission) {
        this._destroyCurrentUi();

        if (type === "mainGame") {
            this.currentUi = new GameUi(this.play, this.imageMap);
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
        if (this.devToggle) {
            this.devToggle.remove();
            this.devToggle = null;
        }
        this.container = null;
        clearInterval(this.focusInterval);
    }
}
