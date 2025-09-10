import Handlebars from "handlebars";
import incentivizedAdTemplate from "../template/incentivizedAd.html";
import AlertUi from "./helper/AlertUi.js";
import IncentivizedAdCompletedAction from "../game/action/IncentivizedAdCompletedAction.js";
import ApiEvent from "../config/event/ApiEvent.js";


export default class IncentivizedAdButtonUi {
    constructor(play) {
        this.play = play;
        this.apiEm = play.getApi().getEventManager();
        this.isAdAvailable = null;
        this.designInterval = null;
        this.element = null;
        this.container = null;
    }

    display(container) {
        this.container = container;

        this.apiEm.addListener(
            "IncentivizedAd",
            ApiEvent.INCENTIVIZED_AD_STATUS,
            (status) => {
                this.isAdAvailable = status;
                this.update();
            }
        );

        this.apiEm.addListener(
            "IncentivizedAd",
            ApiEvent.INCENTIVIZED_AD_ABANDONED,
            () => {
                new AlertUi("Incentivized ad", "You left too quickly, watch the ad till the end to get the bonus! :)").display();
            }
        );

        this.apiEm.invokeEvent(ApiEvent.INCENTIVIZED_AD_CHECK_STATUS);

        this.update();
    }

    update() {
        if (this.isAdAvailable !== null && this.container) {
            const adAction = new IncentivizedAdCompletedAction(this.play.getGame());
            this.container.html(
                Handlebars.compile(incentivizedAdTemplate)({
                    isAvailable: this.isAdAvailable,
                    message: adAction.getMessage(),
                })
            );

            this.element = this.container.find(".incentivizedAdBox");
            this.element.click(() => {
                this.apiEm.invokeEvent(ApiEvent.INCENTIVIZED_AD_SHOW);
            });
        }
    }

    destroy() {
        if (this.container) this.container.html("");
        this.apiEm.removeListenerForType("IncentivizedAd");
        if (this.designInterval) clearInterval(this.designInterval);
    }
}
