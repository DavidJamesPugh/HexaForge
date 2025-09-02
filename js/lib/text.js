/**
 * Text loader module - loads text files (like HTML templates) asynchronously
 * Based on the original app's text loader functionality
 */
define("lib/text", [], function() {
    
    /**
     * Load text content from a URL
     * @param {string} url - URL to load text from
     * @param {Function} callback - Callback function with loaded text
     */
    function loadText(url, callback) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    callback(xhr.responseText);
                } else {
                    console.error('Failed to load text from:', url, 'Status:', xhr.status);
                    callback('');
                }
            }
        };
        xhr.send();
    }
    
    /**
     * Load text content synchronously (for AMD compatibility)
     * @param {string} url - URL to load text from
     * @returns {string} Loaded text content
     */
    function loadTextSync(url) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, false); // Synchronous
        xhr.send();
        
        if (xhr.status === 200) {
            return xhr.responseText;
        } else {
            console.error('Failed to load text from:', url, 'Status:', xhr.status);
            return '';
        }
    }
    
    return {
        loadText: loadText,
        loadTextSync: loadTextSync
    };
});

