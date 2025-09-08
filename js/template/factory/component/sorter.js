define("text!template/factory/component/sorter.html", [], function () {
    return '{{#each locations}}\r\n{{name}}\r\n<select data-id="{{id}}">\r\n    {{#each resources}}\r\n    <option value="{{id}}">{{name}}</option>\r\n    {{/each}}\r\n</select><br/>\r\n{{/each}}\r\n';
});