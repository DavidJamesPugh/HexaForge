import FactoriesUi from "./FactoriesUi.js";
import FactoryUi from "./FactoryUi.js";
import ResearchUi from "./ResearchUi.js";
import UpgradesUi from "./UpgradesUi.js";
import AchievementsUi from "./AchievementsUi.js";
import AchievementPopupUi from "./AchievementPopupUi.js";
import HelpUi from "./HelpUi.js";
import StatisticsUi from "./StatisticsUi.js";
import PurchasesUi from "./PurchasesUi.js";
import SettingsUi from "./SettingsUi.js";
import TimeTravelUi from "./TimeTravelUi.js";

import gameConfig from "../config/config.js";
import GameUiEvent from "../config/event/GameUiEvent.js";
import GameEvent from "../config/event/GameEvent.js";
import GlobalUiEvent from "../config/event/GlobalUiEvent.js";
import globalUiBus from "../base/GlobalUiBus.js";
import GameContext from "../base/GameContext.js";

export default class GameUi {
    constructor(play, imageMap) { 
        this.globalUiEm = globalUiBus;
        this.gameUiEm = GameContext.gameUiBus;
        this.play = play;
        this.game = play.getGame();
        this.imageMap = imageMap;
        this.focusInterval = null;
        this.currentUi = null;
    }

    display(container) {
        if (this.game.getMeta().isMission) this.game.init();

        this.container = container;
        this.setupEvents();

        this.helpUi = new HelpUi().init();
        this.purchasesUi = new PurchasesUi(this.play).init();
        this.settingsUi = new SettingsUi(this.play, this.game, this.play.getUserHash(), this.play.getSaveManager()).init();
        this.timeTravelUi = new TimeTravelUi(this.play).init();

        this._showUi("factories");

        if (this.game.getMeta().isMission) {
            this.gameUiEm.invokeEvent(GameUiEvent.SHOW_FACTORY, "mission");
        }
    }

    setupEvents() {
        let lastFactoryId = null;

        this.gameUiEm.addListener("GameUi", GameUiEvent.SHOW_FACTORY, (id) => {
            id ??= lastFactoryId;
            lastFactoryId = id;
            console.log("GameUi: SHOW_FACTORY", id);
            this._showUi("factory", id);
        });

        this.gameUiEm.addListener("GameUi", GameUiEvent.SHOW_FACTORIES, () => this._showUi("factories"));
        this.gameUiEm.addListener("GameUi", GameUiEvent.SHOW_RESEARCH, () => this._showUi("research"));
        this.gameUiEm.addListener("GameUi", GameUiEvent.SHOW_UPGRADES, (id) => {
            id ??= lastFactoryId;
            lastFactoryId = id;
            this._showUi("upgrades", id);
        });
        this.gameUiEm.addListener("GameUi", GameUiEvent.SHOW_ACHIEVEMENTS, () => this._showUi("achievements"));
        this.gameUiEm.addListener("GameUi", GameUiEvent.SHOW_STATISTICS, () => this._showUi("statistics", lastFactoryId));

        this.game.getEventManager().addListener("GameUi", GameEvent.ACHIEVEMENT_RECEIVED, (achievement) => {
            new AchievementPopupUi(this.game, achievement).display();
        });

        this.globalUiEm.addListener("GameUi", GlobalUiEvent.FOCUS, () => this.game.getEventManager().invokeEvent(GameEvent.FOCUS));
        this.globalUiEm.addListener("GameUi", GlobalUiEvent.BLUR, () => this.game.getEventManager().invokeEvent(GameEvent.BLUR));
    }

    _showUi(type, factoryId) {
        this._destroyCurrentUi();

        switch (type) {
            case "factory":
                this.currentUi = new FactoryUi(this.game.getFactory(factoryId), this.play, this.imageMap);
                break;
            case "factories":
                this.currentUi = new FactoriesUi(this.game);
                break;
            case "research":
                this.currentUi = new ResearchUi(this.game);
                break;
            case "upgrades":
                this.currentUi = new UpgradesUi(this.game.getFactory(factoryId));
                break;
            case "achievements":
                this.currentUi = new AchievementsUi(this.game);
                break;
            case "statistics":
                this.currentUi = new StatisticsUi(this.game.getFactory(factoryId), this.imageMap);
                break;
        }

        this.currentUi?.display(this.container);
    }

    _destroyCurrentUi() {
        if (this.currentUi) {
            this.currentUi.destroy();
            this.currentUi = null;
        }
    }

    destroy() {
        this._destroyCurrentUi();

        this.helpUi?.destroy();
        this.purchasesUi?.destroy();
        this.settingsUi?.destroy();
        this.timeTravelUi?.destroy();

        if (this.game.getMeta().isMission) this.game.destroy();

        this.globalUiEm.removeListenerForType("GameUi");
        this.gameUiEm.removeListenerForType("GameUi");
        this.game.getEventManager().removeListenerForType("GameUi");

        this.container = null;
        if (this.focusInterval) clearInterval(this.focusInterval);
    }
}
