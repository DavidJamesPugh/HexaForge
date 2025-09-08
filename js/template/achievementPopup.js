define("text!template/achievementPopup.html", [], function () {
    return '<div class="achievementPopup" id="{{idStr}}">\r\n    <span class="name">{{name}}</span>\r\n    <span class="bonus">{{{bonus}}}</span>\r\n    <br/>\r\n    <span class="requirements">{{{requirement}}}</span>\r\n</div>';
});