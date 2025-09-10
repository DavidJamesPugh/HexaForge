import Handlebars from "handlebars";
import settingsTemplateHtml from "../template/settings.html";
import LoadingUi from "./helper/LoadingUi.js";
import ConfirmUi from "./helper/ConfirmUi.js";
import GameUiEvent from "../config/event/GameEvent.js";
import GameContext from "../base/GameContext.js";
import { dateToStr } from "../utils/dateUtils.js"; // (assuming you have a helper like this)

export default class SettingsUi {
    constructor(play, game, userHash, saveManager) {
        this.gameUiEm = GameContext.gameUiBus;
        this.play = play;
        this.game = game;
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

        $("body").append(
            Handlebars.compile(settingsTemplateHtml)({
                userHash: this.userHash.toString(),
                cloudSaveInterval: Math.ceil(this.saveManager.getCloudSaveInterval() / 60000) + " minutes",
                localSaveInterval: Math.ceil(this.saveManager.getLocalSaveInterval() / 1000) + " seconds",
                saveSlots,
                devMode: this.play.isDevMode()
            })
        );

        this.isVisible = true;
        const el = $("#settings");

        // Center horizontally
        el.css("left", ($("html").width() - el.outerWidth()) / 2);

        // Events
        el.find(".closeButton").click(() => this.hide());

        el.find("#userHash").click(function () {
            this.setSelectionRange(0, $(this).val().length);
        });

        el.find("#updateUserHashButton").click(() => {
            const newHash = el.find("#updateUserHash").val();
            if (newHash) {
                this.userHash.updateUserHash(newHash);
                document.location = document.location; // refresh
            }
        });

        el.find("#copyToClipboardButton").click(() => {
            $("#userHash").get(0).select();
            try {
                const success = document.execCommand("copy");
                console.log("Copying text command was " + (success ? "successful" : "unsuccessful"));
            } catch (err) {
                console.log("Oops, unable to copy");
            }
        });

        el.find(".saveToSlot").click((ev) => {
            const slotId = $(ev.currentTarget).attr("data-id");
            this.saveManager.saveManual(slotId, () => this.hide());
        });

        el.find(".loadSlot").click((ev) => {
            const slotId = $(ev.currentTarget).attr("data-id");
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

        el.find("#loadDataButton").click(() => {
            const raw = el.find("#loadData").val();
            this.saveManager.updateGameFromSaveData({ data: raw });
            this.hide();
            this.gameUiEm.invokeEvent(GameUiEvent.SHOW_FACTORIES);
        });

        el.find("#resetGame").click(() => {
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

        $("#settingsBg").click(() => this.hide());
    }

    hide() {
        this.isVisible = false;
        $("#settings").remove();
        $("#settingsBg").remove();
    }

    destroy() {
        this.hide();
        this.game.getEventManager().removeListenerForType("settingsUi");
        this.gameUiEm.removeListenerForType("settingsUi");
    }
}
