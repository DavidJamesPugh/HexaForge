/**
 * FactoryUi class - individual factory interface and rendering
 * Extracted from original_app.js
 */
define("ui/FactoryUi", [
    // TODO: These dependencies will need to be implemented as we extract more modules
    // "text!template/factory.html",
    "ui/factory/MenuUi",
    "ui/factory/MapUi",
    "ui/factory/ComponentsUi",
    // "ui/factory/InfoUi",
    // "ui/factory/ControlsUi",
    // "ui/factory/MapToolsUi",
    // "ui/factory/OverviewUi",
    // "ui/IncentivizedAdButtonUi"
], function(MenuUi, MapUi, ComponentsUi) {
    
    /**
     * FactoryUi constructor
     * @param {Object} globalUiEm - Global UI event manager
     * @param {Object} gameUiEm - Game UI event manager
     * @param {Object} factory - Factory instance
     * @param {Object} play - Play controller instance
     * @param {Object} imageMap - ImageMap instance
     */
    var FactoryUi = function(globalUiEm, gameUiEm, factory, play, imageMap) {
        this.globalUiEm = globalUiEm;
        this.gameUiEm = gameUiEm;
        this.factory = factory;
        this.play = play;
        this.imageMap = imageMap;
        this.game = factory.getGame();
        this.statistics = this.game.getStatistics();
        
        // Initialize UI components
        this.menuUi = new MenuUi(this.globalUiEm, this.gameUiEm, this.factory);
        this.mapUi = new MapUi(this.factory, this.game);
        this.componentsUi = new ComponentsUi(this.globalUiEm, this.factory);
        // TODO: Initialize remaining UI components when their modules are extracted
        // this.mapToolsUi = new MapToolsUi(this.factory);
        // this.infoUi = new InfoUi(this.factory, this.statistics, this.play, imageMap);
        // this.controlsUi = new ControlsUi(this.factory);
        // this.overviewUi = new OverviewUi(this.factory, this.statistics);
        // this.incentivizedAdButtonUi = new IncentivizedAdButtonUi(this.play);
        
        this.container = null;
    };
    
    /**
     * Display the factory UI in the specified container
     * @param {Object} container - Container element
     */
    FactoryUi.prototype.display = function(container) {
        this.container = container;
        
        // Create the factory layout with proper containers
        this._createFactoryLayout();
        
        // Handle premium fullscreen mode
        if (this.game.getIsPremium()) {
            $(".main").addClass("fullScreen");
            var mapContainer = this.container.find(".mapContainer");
            if (mapContainer.length > 0) {
                mapContainer.css("width", $(window).width() - 250);
                mapContainer.css("height", $(window).height() - 150);
            }
        }
        
        // Display UI components in their proper containers
        this.menuUi.display(this.container.find(".menuContainer"));
        this.mapUi.display(this.container.find(".mapContainer"));
        this.componentsUi.display(this.container.find(".componentsContainer"));
        // TODO: Display remaining UI components when they are available
        // this.infoUi.display(this.container.find(".infoContainer"));
        // this.controlsUi.display(this.container.find(".controlsContainer"));
        // this.overviewUi.display(this.container.find(".overviewContainer"));
        
        // Show map tools in dev mode
        if (this.play.isDevMode && this.play.isDevMode()) {
            // TODO: Display map tools when available
            // this.mapToolsUi.display(this.container.find(".mapToolsContainer"));
        }
        
        // TODO: Display incentivized ad button when available
        // this.incentivizedAdButtonUi.display(this.container.find(".incentivizedAd"));
    };
    
    /**
     * Create the factory layout with proper containers for UI components
     * @private
     */
    FactoryUi.prototype._createFactoryLayout = function() {
        if (this.container && this.container.length > 0) {
            var html = '<div class="factory-ui-container" style="font-family: Arial, sans-serif; height: 100%; display: flex; flex-direction: column;">';
            
            // Factory header
            html += '<div class="factory-header" style="padding: 15px; background: #f8f9fa; border-bottom: 1px solid #dee2e6;">';
            html += '<h2 style="color: #4CAF50; margin: 0;">🏭 Factory: ' + this.factory.getMeta().name + '</h2>';
            html += '<p style="margin: 5px 0 0 0; color: #666;">Status: ' + (this.factory.getIsPaused() ? '⏸️ Paused' : '▶️ Running') + ' | Size: ' + this.factory.getMeta().width + ' x ' + this.factory.getMeta().height + '</p>';
            html += '</div>';
            
            // Main factory layout
            html += '<div style="flex: 1; display: flex; overflow: hidden;">';
            
            // Left sidebar - Menu and Components
            html += '<div style="z-index:20;width: 250px; background: #f8f9fa; border-right: 1px solid #dee2e6; display: flex; flex-direction: column;">';
            
            // Menu container
            html += '<div class="menuContainer menu-container" style="flex: 1; padding: 15px; border-bottom: 1px solid #dee2e6;"></div>';
            
            // Components container
            html += '<div class="componentsContainer components-container" style="flex: 1; padding: 15px;"></div>';
            
            html += '</div>';
            
            // Main area - Map
            html += '<div style="flex: 1; position: relative;">';
            html += '<div class="mapContainer map-container" style="width: 100%; height: 100%; background: #e9ecef;"></div>';
            html += '</div>';
            
            html += '</div>';
            
            // Status bar
            html += '<div class="factory-status-bar" style="padding: 10px; background: #f8f9fa; border-top: 1px solid #dee2e6; font-size: 12px; color: #666;">';
            html += '<span>🎉 <strong>FACTORY MAP IS NOW WORKING!</strong> You can see the factory and place components!</span>';
            html += '</div>';
            
            html += '</div>';
            
            this.container.html(html);
        }
    };
    
    /**
     * Show placeholder UI while actual components are being implemented
     * @private
     */
    FactoryUi.prototype._showPlaceholderUi = function() {
        if (this.container && this.container.length > 0) {
            var html = '<div style="padding: 20px; font-family: Arial, sans-serif;">';
            html += '<h2 style="color: #4CAF50;">🏭 Factory: ' + this.factory.getMeta().name + '</h2>';
            
            html += '<div style="padding: 15px; border-radius: 5px; margin: 10px 0;">';
            html += '<h3>Factory Information:</h3>';
            html += '<p><strong>Status:</strong> ' + (this.factory.getIsPaused() ? 'Paused' : 'Running') + '</p>';
            html += '<p><strong>Size:</strong> ' + this.factory.getMeta().width + ' x ' + this.factory.getMeta().height + '</p>';
            html += '<p><strong>Components:</strong> ' + (this.factory.getComponents ? this.factory.getComponents().length : 0) + '</p>';
            html += '</div>';
            
            html += '<div style="margin: 20px 0;">';
            html += '<h3>Factory UI Components (Placeholder):</h3>';
            html += '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">';
            html += '<div style="border: 1px solid #ddd; padding: 15px; border-radius: 5px;">';
            html += '<h4>📋 Menu</h4>';
            html += '<p>Navigation and factory controls</p>';
            html += '</div>';
            html += '<div style="border: 1px solid #ddd; padding: 15px; border-radius: 5px;">';
            html += '<h4>🗺️ Map</h4>';
            html += '<p>Factory grid and tile management</p>';
            html += '</div>';
            html += '<div style="border: 1px solid #ddd; padding: 15px; border-radius: 5px;">';
            html += '<h4>⚙️ Components</h4>';
            html += '<p>Building blocks and placement</p>';
            html += '</div>';
            html += '<div style="border: 1px solid #ddd; padding: 15px; border-radius: 5px;">';
            html += '<h4>ℹ️ Info</h4>';
            html += '<p>Factory statistics and details</p>';
            html += '</div>';
            html += '<div style="border: 1px solid #ddd; padding: 15px; border-radius: 5px;">';
            html += '<h4>🎮 Controls</h4>';
            html += '<p>Game controls and settings</p>';
            html += '</div>';
            html += '<div style="border: 1px solid #ddd; padding: 15px; border-radius: 5px;">';
            html += '<h4>📊 Overview</h4>';
            html += '<p>Factory performance overview</p>';
            html += '</div>';
            html += '</div>';
            html += '</div>';
            
            html += '<div style="padding: 15px; border-radius: 5px; margin: 10px 0;">';
            html += '<h3>FactoryUi Module Status:</h3>';
            html += '<div style="text-align: left; max-width: 400px; margin: 0 auto;">';
            html += '<p>✅ FactoryUi Class Extracted</p>';
            html += '<p>✅ MenuUi (Completed)</p>';
            html += '<p>✅ MapUi (Completed)</p>';
            html += '<p>✅ ComponentsUi (Completed)</p>';
            html += '<p>✅ Strategy Classes (Completed)</p>';
            html += '<p>✅ Helper Modules (Completed)</p>';
            html += '<p>⏳ Game Managers (Next Priority)</p>';
            html += '<p>⏳ InfoUi (Pending)</p>';
            html += '<p>⏳ ControlsUi (Pending)</p>';
            html += '<p>⏳ OverviewUi (Pending)</p>';
            html += '</div>';
            html += '</div>';
            
            html += '<p style="color: #666;">The FactoryUi framework is ready! Ready to integrate individual factory UI components.</p>';
            html += '</div>';
            
            this.container.html(html);
        }
    };
    
    /**
     * Destroy the FactoryUi and clean up resources
     */
    FactoryUi.prototype.destroy = function() {
        // Destroy UI components
        if (this.menuUi) this.menuUi.destroy();
        if (this.mapUi) this.mapUi.destroy();
        if (this.componentsUi) this.componentsUi.destroy();
        // TODO: Destroy remaining UI components when they are available
        // this.infoUi.destroy();
        // this.controlsUi.destroy();
        // this.overviewUi.destroy();
        // this.mapToolsUi.destroy();
        // this.incentivizedAdButtonUi.destroy();
        
        // Remove event listeners
        this.game.getEventManager().removeListenerForType("FactoryUi");
        
        // Clear container
        if (this.container) {
            this.container.html("");
            this.container = null;
        }
        
        // Remove fullscreen class
        $(".main").removeClass("fullScreen");
    };
    
    return FactoryUi;
});
