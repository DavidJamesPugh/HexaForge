import logger from "../base/Logger.js";

export default class ConfirmedTimestamp {
    constructor(loaderFunction) {
        this.serverTs = 0;
        this.localTs = 0;
        this.timeDif = 0;
        this.loaderFunction = loaderFunction;
    }

    init() {
        return new Promise((resolve) => {
            this.loaderFunction((ts) => {
                this.serverTs = ts && !isNaN(Number(ts)) ? Number(ts) : Math.round(Date.now() / 1000);
                this.localTs = Math.round(Date.now() / 1000);
                this.timeDif = this.serverTs - this.localTs;
                logger.info("Ts", `Loaded ${ts} Used: ${this.serverTs} Dif: ${this.timeDif}`);
                resolve(); // resolves the promise
            });
        });
    }
    

    getConfirmedNow() {
        return Math.round(Date.now() / 1000) + this.timeDif;
    }
}
