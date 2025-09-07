/**
 * Main application controller module
 * This is the primary entry point for the game application
 */

define("Main", [
    "config/Meta",
    "config/config", 
    "config/event/GlobalUiEvent",
    "config/event/GameUiEvent",
    "config/event/GameEvent",
    "config/event/FactoryEvent",
    "config/event/ApiEvent",
    "play/Play",
    "base/ImageMap",
    "base/BinaryArrayWriter",
    "ui/MainUi"
], function (
    metaConfig, 
    gameConfig, 
    globalUiEvent, 
    gameUiEvent, 
    gameEvent, 
    factoryEvent, 
    apiEvent, 
    Play, 
    ImageMap, 
    BinaryArrayWriter,
    MainUi
) {
    // Set global event constants for easy access
    GameEvent = gameEvent;
    FactoryEvent = factoryEvent;
    GameUiEvent = gameUiEvent;
    GlobalUiEvent = globalUiEvent;
    ApiEvent = apiEvent;

    /**
     * Main application class
     */
    var Main = function() {};

    /**
     * Initialize the main application
     * @param {boolean} isDevMode - Whether to run in development mode
     * @param {Function} callback - Callback function to execute after initialization
     */
    Main.prototype.init = function(isDevMode, callback) {
        // Create and load the image map
        this.imageMap = this._createImageMap();

        this.imageMap.loadAll(function() {
            // Create the play instance (it handles its own userHash and API creation)
            this.play = new Play();

            // Initialize the play instance
            this.play.init(isDevMode, function() {
                // Check if in development mode
                this.play.isDevMode();

                // Create and initialize the main UI
                this.mainUi = new MainUi(this.play, this.imageMap);

                // Display the main UI in the game area
                this.mainUi.display($("#gameArea"));

                // Execute callback if provided
                if (callback) {
                    callback();
                }
            }.bind(this));
        }.bind(this));
    };

    /**
     * Create the image map for the game
     * @returns {ImageMap} The configured image map instance
     */
    Main.prototype._createImageMap = function() {
        return new ImageMap(gameConfig.imageMap.path).addImages({
            yellowSelection: "mouse/yellow.png",
            greenSelection: "mouse/green.png", 
            redSelection: "mouse/red.png",
            blueSelection: "mouse/selected.png",
            cantPlace: "mouse/cantPlace.png",
            terrains: "terrains.png",
            components: "components.png",
            componentIcons: "componentIcons.png",
            transportLine: "transportLine.png",
            resources: "resources.png"
        });
    };

    /**
     * Clean up resources when destroying the application
     */
    Main.prototype.destroy = function() {
        if (this.mainUi) {
            this.mainUi.destroy();
        }
        if (this.play) {
            this.play.destroy();
        }
    };

    return Main;
});
