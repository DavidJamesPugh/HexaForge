/**
 * Simplified Handlebars implementation
 * Based on the original app's Handlebars functionality
 * Supports basic templating features: variables, each loops, and if conditions
 */
define("lib/handlebars", [], function() {
    
    var Handlebars = {};
    
    /**
     * Compile a template string into a function
     * @param {string} template - Template string with Handlebars syntax
     * @returns {Function} Compiled template function
     */
    Handlebars.compile = function(template) {
        return function(data) {
            var result = template;
            
            // Replace variables: {{variable}}
            result = result.replace(/\{\{([^}]+)\}\}/g, function(match, key) {
                var keys = key.trim().split('.');
                var value = data;
                for (var i = 0; i < keys.length; i++) {
                    if (value && typeof value === 'object') {
                        value = value[keys[i]];
                    } else {
                        value = undefined;
                        break;
                    }
                }
                return value !== undefined ? value : '';
            });
            
            // Handle each loops: {{#each array}}...{{/each}}
            result = result.replace(/\{\{#each\s+([^}]+)\}\}([\s\S]*?)\{\{\/each\}/g, function(match, key, content) {
                var keys = key.trim().split('.');
                var array = data;
                for (var i = 0; i < keys.length; i++) {
                    if (array && typeof array === 'object') {
                        array = array[keys[i]];
                    } else {
                        array = [];
                        break;
                    }
                }
                
                if (!Array.isArray(array)) {
                    return '';
                }
                
                var loopResult = '';
                for (var j = 0; j < array.length; j++) {
                    var itemContent = content;
                    // Replace variables within the loop context
                    itemContent = itemContent.replace(/\{\{([^}]+)\}\}/g, function(match, key) {
                        var keys = key.trim().split('.');
                        var value = array[j];
                        for (var k = 0; k < keys.length; k++) {
                            if (value && typeof value === 'object') {
                                value = value[keys[k]];
                            } else {
                                value = undefined;
                                break;
                            }
                        }
                        return value !== undefined ? value : '';
                    });
                    loopResult += itemContent;
                }
                
                return loopResult;
            });
            
            // Handle if conditions: {{#if condition}}...{{else}}...{{/if}}
            result = result.replace(/\{\{#if\s+([^}]+)\}\}([\s\S]*?)(?:\{\{else\}\}([\s\S]*?))?\{\{\/if\}/g, function(match, key, ifContent, elseContent) {
                var keys = key.trim().split('.');
                var value = data;
                for (var i = 0; i < keys.length; i++) {
                    if (value && typeof value === 'object') {
                        value = value[keys[i]];
                    } else {
                        value = undefined;
                        break;
                    }
                }
                
                // Check if condition is truthy
                var isTruthy = value && value !== false && value !== 0 && value !== '';
                
                if (isTruthy) {
                    return ifContent;
                } else {
                    return elseContent || '';
                }
            });
            
            return result;
        };
    };
    
    return Handlebars;
});

