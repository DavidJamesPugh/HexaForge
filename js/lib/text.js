/**
 * RequireJS Text Plugin - loads text files (like HTML templates)
 * Standard RequireJS plugin interface
 */

define(function() {
    'use strict';

    var text = {
        load: function(name, req, onload, config) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', req.toUrl(name), true);
            xhr.onreadystatechange = function(evt) {
                if (xhr.readyState === 4) {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        onload(xhr.responseText);
                    } else {
                        onload.error(new Error('Failed to load ' + name + ': ' + xhr.status));
                    }
                }
            };
            xhr.send(null);
        },

        normalize: function(name, normalize) {
            return name;
        }
    };

    return text;
});

