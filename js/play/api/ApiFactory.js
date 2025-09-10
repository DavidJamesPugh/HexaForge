import config from "../../config/config.js";
import LocalApi from "./Local.js";
// import WebApi from "play/api/Web.js";
// import KongregateApi from "play/api/Kongregate.js";
import logger from "../../base/Logger.js";

const ApiFactory = (type, userHash) => {
    switch (type) {
        // case "kongregate":
        //     logger.info("ApiFactory", "Kongregate API loaded");
        //     return new KongregateApi(userHash, config.api.server.url, type);
        case "localhost":
            logger.info("ApiFactory", "Local API loaded");
            return new LocalApi(userHash, config.api.local.storageKey, type);
        default:
            logger.info("ApiFactory", "Web API loaded");
            return new LocalApi(userHash, config.api.server.url, type);
    }
};

export default ApiFactory;
