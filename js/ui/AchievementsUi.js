import Handlebars from "handlebars";
import achievementsTemplateHtml from "../template/achievements.html";
import GameEvent from "../config/event/GameEvent.js";
import GameContext from "../base/GameContext.js";
export default class AchievementsUi {
    constructor(game) {
        this.gameUiEm = GameContext.gameUiBus;
        this.game = game;
        this.manager = this.game.getAchievementsManager();
        this.container = null;
    }

    display(container) {
        this.container = container;
        const achievementsList = [];

        const achievementsMeta = this.game.getMeta().achievements;
        for (const achievement of achievementsMeta) {
            if (this.manager.isVisible(achievement.id)) {
                achievementsList.push({
                    id: achievement.id,
                    name: achievement.name,
                    requirements: this.manager.getTesterDescriptionText(achievement.id),
                    bonus: this.manager.getBonusDescriptionText(achievement.id),
                });
            }
        }

        this.container.html(
            Handlebars.compile(achievementsTemplateHtml)({ achievements: achievementsList })
        );

        this.container.find(".backButton").click(() => {
            this.gameUiEm.invokeEvent(GameEvent.SHOW_FACTORY);
        });

        this.game.getEventManager().addListener(
            "achievementsUi",
            GameEvent.ACHIEVEMENT_RECEIVED,
            () => this.update()
        );

        this.update();
    }

    update() {
        this.container.find(".item").each((_, el) => {
            const id = $(el).attr("data-id");
            if (this.manager.getAchievement(id)) {
                $(el).addClass("achieved");
            } else {
                $(el).removeClass("achieved");
            }
        });
    }

    destroy() {
        this.game.getEventManager().removeListenerForType("achievementsUi");
        this.gameUiEm.removeListenerForType("achievementsUi");
        if (this.container) {
            this.container.html("");
            this.container = null;
        }
    }
}
