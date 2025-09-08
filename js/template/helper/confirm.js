define("text!template/helper/confirm.html", [], function () {
    return '<div class="confirmBg" id="{{idBg}}"></div>\r\n<div class="confirm" id="{{id}}">\r\n    <span class="title">{{title}}</span><br/>\r\n    <span class="message">{{{message}}}</span><br/>\r\n    <span class="cancelButton">{{cancelTitle}}</span>\r\n    <span class="okButton">{{okTitle}}</span>\r\n</div>';
});