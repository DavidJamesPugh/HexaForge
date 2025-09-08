define("text!template/incentivizedAd.html", [], function () {
    return '<div class="incentivizedAdBox">\r\n    <div class="button {{#if isAvailable}}available{{/if}}">\r\n        {{#if isAvailable}}\r\n        {{message}}\r\n        {{else}}\r\n        No ad to show currently\r\n        {{/if}}\r\n    </div>\r\n</div>';
});