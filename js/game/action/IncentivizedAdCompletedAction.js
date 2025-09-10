import Meta from "config/Meta.js";
import logger from "base/Logger.js";

export default class IncentivizedAdCompletedAction {
    constructor(game) {
        this.game = game;
    }

    getMessage() {
        return `Show ad for ${Meta.main.incentivizedAdBonusTicks} bonus ticks`;
    }

    complete() {
        logger.info(
            "IncentivizedAdCompletedAction",
            `Incentivized ad completed, added ${Meta.main.incentivizedAdBonusTicks} bonus ticks`
        );
        this.game.getTicker().addBonusTicks(Meta.main.incentivizedAdBonusTicks);
    }
}
