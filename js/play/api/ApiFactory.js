import config from "../../config/config.js";
import Local from "./Local.js";
import WebApi from "./WebApi.js";
import logger from "../../base/Logger.js";
import UrlHandler from "../UrlHandler.js";

const ApiFactory = (devMode, userHash) => {
    
    const site = UrlHandler.identifySite();
    if(devMode){
        logger.info("ApiFactory", "Local API loading");
        return new Local(userHash, config.api.local.storageKey, UrlHandler.identifySite());

    } else {
        logger.info("ApiFactory", "Web API loading");
        return new WebApi(userHash, config.api.server.url, UrlHandler.identifySite());

    }
    
};

export default ApiFactory;
