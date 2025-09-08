define("text!template/helper/alert.html", [], function () {
    return '<div class="alertBg" id="{{idBg}}"></div>\r\n<div class="alert" id="{{id}}">\r\n    <span class="title">{{title}}</span><br/>\r\n    <span class="message">{{{message}}}</span><br/>\r\n    <span class="button">{{buttonTitle}}</span>\r\n</div>';
});