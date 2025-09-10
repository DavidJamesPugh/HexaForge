import Handlebars from "handlebars";
import helpTemplateHtml from "../template/help.html";
import GameUiEvent  from "../config/event/GameEvent.js";
import GameContext from "../base/GameContext.js";

export default class HelpUi {
    constructor(game) {
        this.gameUiEm = GameContext.gameUiBus;
        this.game = game;
        this.isVisible = false;
    }

    init() {
        this.gameUiEm.addListener("help", GameUiEvent.SHOW_HELP, () => this.display());
        return this;
    }

    display() {
        if (this.isVisible) return;

        this.isVisible = true;
        $("body").append(Handlebars.compile(helpTemplateHtml)({}));

        const helpElement = $("#help");
        helpElement.css("left", ($("html").width() - helpElement.outerWidth()) / 2);

        helpElement.find(".closeButton").click(() => this.hide());

        // Menu navigation
        const menuSections = {};
        helpElement.find(".menu a").each(function () {
            const sectionId = $(this).attr("data-id");
            menuSections[sectionId] = helpElement.find(`#${sectionId}`);
            $(this).click(() => {
                for (const key in menuSections) menuSections[key].hide();
                menuSections[sectionId].fadeIn();
            });
        });

        $("#gettingStarted").show();
        $("#helpBg").click(() => this.hide());
    }

    hide() {
        this.isVisible = false;
        $("#help").remove();
        $("#helpBg").remove();
    }

    destroy() {
        this.hide();
        this.game.getEventManager().removeListenerForType("help");
        this.gameUiEm.removeListenerForType("help");
    }
}
