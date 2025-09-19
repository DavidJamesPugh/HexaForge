import Handlebars from "handlebars";
import settingsTemplateHtml from "../template/settings.html?raw";
import LoadingUi from "./helper/LoadingUi.js";
import ConfirmUi from "./helper/ConfirmUi.js";
import GameUiEvent from "../config/event/GameUiEvent.js";
import GameContext from "../base/GameContext.js";
import { dateToStr } from "../utils/dateUtils.js"; // (assuming you have a helper like this)

export default class SettingsUi {
    constructor(play, game, userHash, saveManager) {
        this.play = play;
        this.game = game;
        this.gameUiEm = this.game.getEventManager();
        this.userHash = userHash;
        this.saveManager = saveManager;
        this.isVisible = false;
    }

    init() {
        this.gameUiEm.addListener("settingsUi", GameUiEvent.SHOW_SETTINGS, () => {
            this.display();
        });
        return this;
    }

    display() {
        if (this.isVisible) return;

        let cancelled = false;
        const loading = new LoadingUi()
            .setClickCallback(() => {
                cancelled = true;
            })
            .display();

        this.saveManager.getSavesInfo(["slot1", "slot2", "slot3"], (slots) => {
            if (!cancelled) {
                loading.hide();
                this._display(slots);
            }
        });
    }

    _display(slots) {
        const saveSlots = [];
        for (let i = 1; i <= 3; i++) {
            const slot = slots[`slot${i}`];
            saveSlots.push({
                id: `slot${i}`,
                name: `Slot ${i}`,
                hasSave: !!slot,
                lastSave: slot ? dateToStr(new Date(slot.timestamp * 1000), false) : "-",
                ticks: slot ? slot.ver : "-"
            });
        }

        document.body.insertAdjacentHTML('beforeend', Handlebars.compile(settingsTemplateHtml)({
            userHash: this.userHash.toString(),
            cloudSaveInterval: Math.ceil(this.saveManager.getCloudSaveInterval() / 60000) + " minutes",
            localSaveInterval: Math.ceil(this.saveManager.getLocalSaveInterval() / 1000) + " seconds",
            saveSlots,
            devMode: this.play.isDevMode()
        }));

        this.bg = document.getElementById("settingsBg");
        this.element = document.getElementById("settings");

        this.isVisible = true;

        // Center horizontally
        this.element.style.left = `${(document.documentElement.offsetWidth - this.element.offsetWidth) / 2}px`;

        // Events
        this.element.querySelector(".closeButton").addEventListener("click", () => this.hide());

        this.element.querySelector("#userHash").addEventListener("click", function () {
            this.setSelectionRange(0, this.value.length);
        });

        this.element.querySelector("#updateUserHashButton").addEventListener("click", () => {
            const newHash = this.element.querySelector("#updateUserHash").value;
            if (newHash) {
                this.userHash.updateUserHash(newHash);
                document.location = document.location; // refresh
            }
        });

        this.element.querySelector("#copyToClipboardButton").addEventListener("click", () => {
            this.element.querySelector("#userHash").select();
            try {
                const success = document.execCommand("copy");
                console.log("Copying text command was " + (success ? "successful" : "unsuccessful"));
            } catch (err) {
                console.log("Oops, unable to copy");
            }
        });

        this.element.querySelector(".saveToSlot").addEventListener("click", (ev) => {
            const slotId = $(ev.currentTarget).attr("data-id");
            this.saveManager.saveManual(slotId, () => this.hide());
        });

        this.element.addEventListener("click", (ev) => {
            const slot = ev.target.closest(".loadSlot");
            if (!slot) return; // ignore clicks outside
            const slotId = $(slot).attr("data-id");
            new ConfirmUi("Load game", "Are you sure you want to load game?")
                .setCancelTitle("Yes, load game")
                .setOkTitle("Nooooo!!!")
                .setCancelCallback(() => {
                    this.saveManager.loadManual(slotId, () => {
                        this.hide();
                        this.gameUiEm.invokeEvent(GameUiEvent.SHOW_FACTORIES);
                    });
                })
                .display();
        });
        

        this.element.querySelector("#loadDataButton").addEventListener("click", () => {
            const raw = this.element.querySelector("#loadData").value;
            this.saveManager.updateGameFromSaveData({ data: raw });
            this.hide();
            this.gameUiEm.invokeEvent(GameUiEvent.SHOW_FACTORIES);
        });

        this.element.querySelector("#resetGame").addEventListener("click", () => {
            new ConfirmUi("Reset game", "Are you sure you want to reset the game?")
                .setCancelTitle("Yes, RESET GAME")
                .setOkTitle("Nooooo!!!")
                .setCancelCallback(() => {
                    MainInstance.destroy();
                    MainInstance.init(true);
                    this.destroy();
                })
                .display();
        });

        this.bg.addEventListener("click", () => this.hide());
    }

    hide() {
        this.isVisible = false;
        this.element.remove();
        this.bg.remove();
    }

    destroy() {
        this.hide();
        this.game.getEventManager().removeListenerForType("settingsUi");
        this.gameUiEm.removeListenerForType("settingsUi");
    }
}
