import config from "../../config/config.js";
import Local from "./Local.js";
import WebApi from "./WebApi.js";
import KongregateApi from "./Kongregate.js";
import logger from "../../base/Logger.js";
import UrlHandler from "../UrlHandler.js";

const ApiFactory = (devMode, userHash) => {
    
    const site = UrlHandler.identifySite();
    if(devMode){
        logger.info("ApiFactory", "Local API loading");
        return new Local(userHash, config.api.local.storageKey, UrlHandler.identifySite());

    } else {
        switch (site) { //Type was the URL UrlHandler.identifySite()
            case "kongregate":
                logger.info("ApiFactory", "Kongregate API loaded");
                return new KongregateApi(userHash, config.api.server.url, type);
            case "localhost":
                logger.info("ApiFactory", "Local API loaded");
                return new Local(userHash, config.api.local.storageKey, type);
            default:
                logger.info("ApiFactory", "Web API loaded");
                return new WebApi(userHash, config.api.server.url, type);
        }
        logger.info("ApiFactory", "Web API loading");
        return new WebApi(userHash, config.api.server.url, UrlHandler.identifySite());

    }
    
};

export default ApiFactory;
