/**
 * Settings template - Handlebars template for the settings modal
 * Based on the original app's settings template
 */
define("templates/loading", [], function() {
    return '<div class="loadingBg" id="{{idBg}}"></div>\r\n<div class="loading" id="{{id}}">\r\n    <center>\r\n    <img src="img/loader.gif" class="icon"/><br />\r\n    <span class="message">{{{title}}}</span>\r\n    </center>\r\n</div>';
});

