import Handlebars from "handlebars";
import menuTemplateHtml from "../../template/factory/menu.html?raw";
import GlobalUiBus from "../../base/GlobalUiBus.js";
import GameEvent from "/js/config/event/GameEvent.js"; 
import GameUiEvent from "/js/config/event/GameUiEvent.js";

export default class MenuUi {
    constructor(factory) {
        this.globalUiEm = GlobalUiBus;
        this.game = factory.getGame();
        this.gameUiEm = this.game.getEventManager();
        this.factory = factory;
    }

    display(container) {
        this.container = container;

        this.container.insertAdjacentHTML("beforeend",
            Handlebars.compile(menuTemplateHtml)({
                hasResearch: this.game.getMeta().research.length > 0,
                hasUpgrades: this.game.getMeta().upgrades.length > 0,
                hasAchievements: this.game.getMeta().achievements.length > 0,
                hasStatistics: true,
            })
        );

        // Button click handlers
        // this.container.find("#missionsButton").click(() => this.globalUiEm.invokeEvent(GlobalUiEvent.SHOW_MISSIONS));
        
        this.container.querySelector("#factoriesButton").addEventListener("click", () => {this.gameUiEm.invokeEvent(GameUiEvent.SHOW_FACTORIES)});
        this.container.querySelector("#researchButton").addEventListener("click", () => this.gameUiEm.invokeEvent(GameUiEvent.SHOW_RESEARCH, this.factory.getMeta().id));
        this.container.querySelector("#upgradesButton").addEventListener("click", () => this.gameUiEm.invokeEvent(GameUiEvent.SHOW_UPGRADES, this.factory.getMeta().id));
        this.container.querySelector("#achievementsButton").addEventListener("click", () => this.gameUiEm.invokeEvent(GameUiEvent.SHOW_ACHIEVEMENTS, this.factory.getMeta().id));
        this.container.querySelector("#helpButton").addEventListener("click", () => this.gameUiEm.invokeEvent(GameUiEvent.SHOW_HELP));
        this.container.querySelector("#statisticsButton").addEventListener("click", () => this.gameUiEm.invokeEvent(GameUiEvent.SHOW_STATISTICS));
        this.container.querySelector("#extraButton").addEventListener("click", () => this.gameUiEm.invokeEvent(GameUiEvent.SHOW_PURCHASES));
        this.container.querySelector("#settingsButton").addEventListener("click", () => this.gameUiEm.invokeEvent(GameUiEvent.SHOW_SETTINGS));
        this.container.querySelector("#timeTravelButton").addEventListener("click", () => this.gameUiEm.invokeEvent(GameUiEvent.SHOW_TIME_TRAVEL));

        this.gameUiEm.addListener("factoryMenuUi", GameEvent.GAME_TICK, () => {
            this.updateButtons();
        });
        this.updateButtons();
    }

    updateButtons() {
        const achievements = this.factory.getGame().getAchievementsManager();
    
        this.toggleVisibility("#researchButton", achievements.getAchievement("makingProfit"));
        this.toggleVisibility("#upgradesButton", achievements.getAchievement("gettingSmarter"));
        this.toggleVisibility("#statisticsButton", achievements.getAchievement("collectingCash2"));
    
        const hasCash = achievements.getAchievement("collectingCash");
        this.toggleVisibility("#extraButton", hasCash);
        this.toggleVisibility("#timeTravelButton", hasCash);

        const visibilityMap = [
            {selector: "#researchButton", achievement:"makingProfit"},
            {selector: "#upgradesButton", achievement:"gettingSmarter"},
            {selector: "#statisticsButton", achievement:"collectingCash2"},
            {selector: "#extraButton", achievement:"collectingCash"},
            {selector: "#timeTravelButton", achievement:"collectingCash"}

        ];

        visibilityMap.forEach(({ selector, achievement }) => {
            const unlocked = achievements.getAchievement(achievement);
            this.toggleVisibility(selector, unlocked);
        })

    }
    
    toggleVisibility(selector, isVisible) {
        const el = this.container.querySelector(selector);
        if (!el) return;
    
        el.classList.toggle("hidden", !isVisible);
    }
    
    destroy() {
        this.gameUiEm.removeListenerForType("factoryMenuUi");
        this.globalUiEm.removeListenerForType("factoryMenuUi");
    
        this.container.innerHTML = "";
        this.container = null;
    }
}
