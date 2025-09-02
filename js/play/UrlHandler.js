/**
 * UrlHandler - Utility class for parsing URL parameters
 * Based on the original Factory Idle implementation
 */

define("play/UrlHandler", [], function() {
    
    var UrlHandler = {};
    
    UrlHandler.getUrlVars = function() {
        var vars = {};
        var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) {
            vars[key] = value;
        });
        return vars;
    };
    
    UrlHandler.getUrlParam = function(name) {
        return this.getUrlVars()[name];
    };
    
    return UrlHandler;
});
