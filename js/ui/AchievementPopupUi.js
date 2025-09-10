
import GameContext from "../base/GameContext.js";

let zIndexOffset = 0;

export default class AchievementPopupUi {
    static counter = 1;

    constructor(achievementId) {
        this.game = GameContext.gameUiBus;
        this.achievementId = achievementId;
        this.id = `achievementPopup${AchievementPopupUi.counter++}`;
        this.interval = null;
        this.container = null;
        this.element = null;
        this.templateHtml = null;
    }

    async loadTemplate(url = "/template/achievementPopup.html") {
        const res = await fetch(url);
        this.templateHtml = await res.text();
    }

    display() {
        this.container = $("body");
        const achievement = this.game.getMeta().achievementsById[this.achievementId];
        this.container.append(
            Handlebars.compile(this.templateHtml)({
                idStr: this.id,
                name: achievement.name,
                requirement: this.game.getAchievementsManager().getTesterDescriptionText(achievement.id),
                bonus: this.game.getAchievementsManager().getBonusDescriptionText(achievement.id),
            })
        );

        this.element = this.container.find(`#${this.id}`).hide();
        this.element.click(() => this.hide());

        this.interval = setTimeout(() => this.hide(), 8000);

        const left = this.container.width() / 2 - this.element.outerWidth() / 2;
        const top = 150 + zIndexOffset * (this.element.outerHeight() + 10);
        this.element.css({ left, top });
        this.element.slideDown(400);

        zIndexOffset++;
    }

    hide() {
        if (!this.element) return;

        this.element.slideUp(400, () => {
            this.element.remove();
            this.element = null;
        });

        clearTimeout(this.interval);
        zIndexOffset = Math.max(0, zIndexOffset - 1);
    }
}
