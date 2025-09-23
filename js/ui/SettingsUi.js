import Handlebars from "handlebars";
import settingsTemplateHtml from "../template/settings.html?raw";
import LoadingUi from "./helper/LoadingUi.js";
import ConfirmUi from "./helper/ConfirmUi.js";
import GameUiEvent from "../config/event/GameUiEvent.js";
import GameContext from "../base/GameContext.js";
import { dateToStr } from "../utils/dateUtils.js"; // assumes you have this helper
import MainSingleton from "../MainSingleton.js";


export default class SettingsUi {
  constructor(play, game, userHash, saveManager) {
    this.play = play;
    this.game = game;
    this.gameUiEm = this.game.getEventManager();
    this.userHash = userHash;
    this.saveManager = saveManager;
    this.isVisible = false;
    this.bg = null;
    this.element = null;
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
    const saveSlots = Array.from({ length: 3 }, (_, i) => {
      const idx = i + 1;
      const slot = slots[`slot${idx}`];
      return {
        id: `slot${idx}`,
        name: `Slot ${idx}`,
        hasSave: !!slot,
        lastSave: slot ? dateToStr(new Date(slot.timestamp * 1000), false) : "-",
        ticks: slot ? slot.ver : "-",
      };
    });

    document.body.insertAdjacentHTML(
      "beforeend",
      Handlebars.compile(settingsTemplateHtml)({
        userHash: this.userHash.toString(),
        cloudSaveInterval:
          Math.ceil(this.saveManager.getCloudSaveInterval() / 60000) +
          " minutes",
        localSaveInterval:
          Math.ceil(this.saveManager.getLocalSaveInterval() / 1000) +
          " seconds",
        saveSlots,
        devMode: this.play.isDevMode(),
      })
    );

    this.bg = document.getElementById("settingsBg");
    this.element = document.getElementById("settings");
    this.isVisible = true;

    // Center horizontally
    this.element.style.left = `${
      (document.documentElement.offsetWidth - this.element.offsetWidth) / 2
    }px`;

    // Events
    this.element
      .querySelector(".closeButton")
      .addEventListener("click", () => this.hide());

    this.element.querySelector("#userHash").addEventListener("click", (ev) => {
      ev.target.setSelectionRange(0, ev.target.value.length);
    });

    this.element
      .querySelector("#updateUserHashButton")
      .addEventListener("click", () => {
        const newHash = this.element.querySelector("#updateUserHash").value;
        if (newHash) {
          this.userHash.updateUserHash(newHash);
          window.location.reload();
        }
      });

    this.element
      .querySelector("#copyToClipboardButton")
      .addEventListener("click", async () => {
        const input = this.element.querySelector("#userHash");
        input.select();
        try {
          await navigator.clipboard.writeText(input.value);
          console.log("Copied to clipboard successfully!");
        } catch (err) {
          console.log("Failed to copy: ", err);
        }
      });

    // Save to slot
    this.element.querySelectorAll(".saveToSlot").forEach((btn) => {
      btn.addEventListener("click", (ev) => {
        const slotId = ev.currentTarget.dataset.id;
        this.saveManager.saveManual(slotId, () => this.hide());
      });
    });

    // Load from slot
    this.element.addEventListener("click", (ev) => {
      const slot = ev.target.closest(".loadSlot");
      if (!slot) return;
      const slotId = slot.dataset.id;

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

    if(this.play.isDevMode()) {
    // Load raw save
      this.element
        .querySelector("#loadDataButton")
        .addEventListener("click", () => {
          const raw = this.element.querySelector("#loadData").value;
          this.saveManager.updateGameFromSaveData({ data: raw });
          this.hide();
          this.gameUiEm.invokeEvent(GameUiEvent.SHOW_FACTORIES);
        });
    }

    // Reset game
    this.element
      .querySelector("#resetGame")
      .addEventListener("click", () => {
        new ConfirmUi("Reset game", "Are you sure you want to reset the game?")
          .setCancelTitle("Yes, RESET GAME")
          .setOkTitle("Nooooo!!!")
          .setCancelCallback(() => {
            MainSingleton.reset(true); // restart in dev mode, or reset save
            this.destroy();
          })
          .display();
      });

    // Close when clicking on background
    this.bg.addEventListener("click", () => this.hide());
  }

  hide() {
    this.isVisible = false;
    this.element?.remove();
    this.bg?.remove();
  }

  destroy() {
    this.hide();
    this.game.getEventManager().removeListenerForType("settingsUi");
    this.gameUiEm.removeListenerForType("settingsUi");
  }
}
