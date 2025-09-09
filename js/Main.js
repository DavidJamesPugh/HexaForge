/**
 * Main application controller
 * Entry point for the game
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

    // Global event constants
    GameEvent = gameEvent;
    FactoryEvent = factoryEvent;
    GameUiEvent = gameUiEvent;
    GlobalUiEvent = globalUiEvent;
    ApiEvent = apiEvent;

    class Main {

        /**
         * Initialize the main application
         * @param {boolean} [isDevMode=false]
         * @param {Function} [callback]
         */
        async init(isDevMode = false, callback) {
            this.imageMap = this._createImageMap();

            // Load all images (Promise-based wrapper)
            await this.imageMap.loadAllAsync();

            // Initialize Play instance (Promise-based wrapper)
            this.play = new Play();
            await new Promise(resolve => this.play.init(isDevMode, resolve));

            // Optional: check dev mode
            this.play.isDevMode();

            // Initialize main UI
            this.mainUi = new MainUi(this.play, this.imageMap);
            this.mainUi.display($("#gameArea"));

            // Call callback if provided
            callback?.();
        }

        /**
         * Create the image map for the game
         * Adds a promise-based loader for async/await
         */
        _createImageMap() {
            const map = new ImageMap("img/").addImages({
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

            // Add promise wrapper for async/await
            map.loadAllAsync = () => new Promise(resolve => map.loadAll(resolve));
            return map;
        }

        /**
         * Clean up resources
         */
        destroy() {
            this.mainUi?.destroy();
            this.play?.destroy();
        }
    }

    return Main;
});
