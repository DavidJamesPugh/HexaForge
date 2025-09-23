import config from "../../config/config.js";
import Local from "./Local.js";
import WebApi from "./WebApi.js";
// import KongregateApi from "play/api/Kongregate.js";
import logger from "../../base/Logger.js";
import UrlHandler from "../UrlHandler.js";

const ApiFactory = (devMode, userHash) => {
    if(devMode){
        logger.info("ApiFactory", "Local API loaded");
        return new Local(userHash, config.api.local.storageKey, UrlHandler.identifySite());

    } else {
        logger.info("ApiFactory", "Web API loaded");
        return new WebApi(userHash, config.api.server.url, UrlHandler.identifySite());

    }
    // switch (type) { //Type was the URL UrlHandler.identifySite()
    //     // case "kongregate":
    //     //     logger.info("ApiFactory", "Kongregate API loaded");
    //     //     return new KongregateApi(userHash, config.api.server.url, type);
    //     case "localhost":
    //         logger.info("ApiFactory", "Local API loaded");
    //         return new Local(userHash, config.api.local.storageKey, type);
    //     default:
    //         logger.info("ApiFactory", "Web API loaded");
    //         return new WebApi(userHash, config.api.server.url, type);
    // }
};

export default ApiFactory;
