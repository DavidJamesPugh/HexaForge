import Handlebars from "handlebars";
import menuTemplateHtml from "../../template/factory/menu.html";

export default class MenuUi {
    constructor(globalUiEm, gameUiEm, factory) {
        this.globalUiEm = globalUiEm;
        this.gameUiEm = gameUiEm;
        this.factory = factory;
        this.game = factory.getGame();
    }

    display(container) {
        const isMission = this.game.getMeta().isMission;
        this.container = container;

        this.container.html(
            Handlebars.compile(menuTemplateHtml)({
                isMission,
                hasResearch: this.game.getMeta().research.length > 0,
                hasUpgrades: this.game.getMeta().upgrades.length > 0,
                hasAchievements: this.game.getMeta().achievements.length > 0,
                hasStatistics: !isMission,
            })
        );

        // Button click handlers
        this.container.find("#missionsButton").click(() => this.globalUiEm.invokeEvent(GlobalUiEvent.SHOW_MISSIONS));
        this.container.find("#mainGameButton").click(() => this.globalUiEm.invokeEvent(GlobalUiEvent.SHOW_MAIN_GAME));
        this.container.find("#factoriesButton").click(() => this.gameUiEm.invokeEvent(GameUiEvent.SHOW_FACTORIES));
        this.container.find("#researchButton").click(() => this.gameUiEm.invokeEvent(GameUiEvent.SHOW_RESEARCH, this.factory.getMeta().id));
        this.container.find("#upgradesButton").click(() => this.gameUiEm.invokeEvent(GameUiEvent.SHOW_UPGRADES, this.factory.getMeta().id));
        this.container.find("#achievementsButton").click(() => this.gameUiEm.invokeEvent(GameUiEvent.SHOW_ACHIEVEMENTS, this.factory.getMeta().id));
        this.container.find("#helpButton").click(() => this.gameUiEm.invokeEvent(GameUiEvent.SHOW_HELP));
        this.container.find("#statisticsButton").click(() => this.gameUiEm.invokeEvent(GameUiEvent.SHOW_STATISTICS));
        this.container.find("#extraButton").click(() => this.gameUiEm.invokeEvent(GameUiEvent.SHOW_PURCHASES));
        this.container.find("#settingsButton").click(() => this.gameUiEm.invokeEvent(GameUiEvent.SHOW_SETTINGS));
        this.container.find("#timeTravelButton").click(() => this.gameUiEm.invokeEvent(GameUiEvent.SHOW_TIME_TRAVEL));

        // Listen to game ticks
        this.game.getEventManager().addListener("factoryMenuUi", GameEvent.GAME_TICK, () => this.updateButtons());

        this.updateButtons();
    }

    updateButtons() {
        const achievements = this.factory.getGame().getAchievementsManager();
        achievements.getAchievement("makingProfit")
            ? this.container.find("#researchButton").show()
            : this.container.find("#researchButton").hide();

        achievements.getAchievement("gettingSmarter")
            ? this.container.find("#upgradesButton").show()
            : this.container.find("#upgradesButton").hide();

        achievements.getAchievement("collectingCash2")
            ? this.container.find("#statisticsButton").show()
            : this.container.find("#statisticsButton").hide();

        achievements.getAchievement("collectingCash")
            ? (this.container.find("#extraButton").show(), this.container.find("#timeTravelButton").show())
            : (this.container.find("#extraButton").hide(), this.container.find("#timeTravelButton").hide());
    }

    destroy() {
        this.game.getEventManager().removeListenerForType("factoryMenuUi");
        this.gameUiEm.removeListenerForType("factoryMenuUi");
        this.globalUiEm.removeListenerForType("factoryMenuUi");
        this.container.html("");
        this.container = null;
    }
}
