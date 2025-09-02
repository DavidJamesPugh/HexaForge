/**
 * ApiFactory - Creates the appropriate API instance based on configuration
 * Based on the original Factory Idle implementation
 */

define("play/api/ApiFactory", [
    "play/api/PlayFabApi"
], function(PlayFabApi) {
    
    var ApiFactory = function(config, userHash) {
        this.config = config;
        this.userHash = userHash;
    };
    
    ApiFactory.prototype.createApi = function() {
        // For now, always use PlayFab API
        // In the future, this could switch based on platform or configuration
        return new PlayFabApi(this.userHash.getUserHash());
    };
    
    return ApiFactory;
});
