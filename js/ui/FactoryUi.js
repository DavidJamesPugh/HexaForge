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
        this.mapUi = new MapUi(this.globalUiEm, this.imageMap, this.factory, { tileSize: 21 });
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
        
        // Remove the old premium handling code - it's now handled by _applyPremiumMapDimensions()
        // The new system properly handles both premium and non-premium layouts
        
        // Display UI components in their proper containers
        console.log("FactoryUi: Displaying components...");
        console.log("MapContainer:", this.container.find(".mapContainer"));
        console.log("MapContainer dimensions:", this.container.find(".mapContainer").width(), "x", this.container.find(".mapContainer").height());

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
        // Add this right after this.container.html(html); in _createFactoryLayout
// Temporary global access for testing
//DJPP Remove
window.factoryUi = this;
console.log("FactoryUi now accessible globally as window.factoryUi");
        if (this.container && this.container.length > 0) {
            var html = '';
            
            // Use exact same table structure as original app
            html += '<table class="factoryBox" width="100%" cellspacing="0" cellpadding="0" border="0">';
            
            // Top row: Overview + Top controls
            html += '    <tr>';
            html += '        <td class="overviewArea" valign="top">';
            html += '            <div class="overviewContainer"></div>';
            html += '        </td>';
            html += '        <td class="topArea" valign="top">';
            html += '            <div class="topContainer">';
            html += '                <div class="menuContainer"></div>';
            html += '                <div class="infoContainer"></div>';
            html += '                <div class="controlsContainer"></div>';
            html += '            </div>';
            html += '        </td>';
            html += '    </tr>';
            
            // Bottom row: Components + Map
            html += '    <tr>';
            html += '        <td class="componentsArea" valign="top">';
            html += '            <div class="componentsContainer"></div>';
            html += '            <div class="mapToolsContainer"></div>';
            html += '        </td>';
            html += '        <td class="mapArea" valign="top">';
            html += '            <div class="mapContainer"></div>';
            html += '        </td>';
            html += '    </tr>';
            html += '</table>';
            
            this.container.html(html);
            
            // Set up container references
            this.overviewContainer = this.container.find('.overviewContainer');
            this.menuContainer = this.container.find('.menuContainer');
            this.infoContainer = this.container.find('.infoContainer');
            this.controlsContainer = this.container.find('.controlsContainer');
            this.componentsContainer = this.container.find('.componentsContainer');
            this.mapToolsContainer = this.container.find('.mapToolsContainer');
            this.mapContainer = this.container.find('.mapContainer');
            
            // Apply premium user logic for mapArea dimensions
            this._applyPremiumMapDimensions();
            
            // Listen for premium status changes
            this._setupPremiumStatusListener();
        }
    };
    
    /**
     * Set up listener for premium status changes
     * @private
     */
    FactoryUi.prototype._setupPremiumStatusListener = function() {
        if (this.factory && this.factory.getGame()) {
            var game = this.factory.getGame();
            
            // Listen for premium status changes
            game.getEventManager().addListener(
                "FactoryUi",
                "PREMIUM_STATUS_CHANGED",
                function(isPremium) {
                    this.refreshPremiumDimensions();
                }.bind(this)
            );
        }
    };
    
    /**
     * Check if current user is premium
     * Based on original app's premium detection logic
     * @returns {boolean} True if user is premium
     * @private
     */
    FactoryUi.prototype._isPremiumUser = function() {
        // Check if user has premium features enabled
        // This should integrate with your game's premium system
        
        // For now, check if user has any premium achievements or purchases
        if (this.factory && this.factory.getGame()) {
            var game = this.factory.getGame();
            
            // Check for premium achievements (from original app logic)
            if (game.getAchievementsManager) {
                var achievementsManager = game.getAchievementsManager();
                
            }
        }
        
        // Default to non-premium (like original app)
        return false;
    };
    
    /**
     * Apply premium user logic for mapArea dimensions
     * Based on original app's premium user handling
     * @private
     */
    FactoryUi.prototype._applyPremiumMapDimensions = function() {
        if (this.mapContainer && this.mapContainer.length > 0) {
            var isPremium = this._isPremiumUser();
            
            console.log("FactoryUi: Applying premium dimensions, isPremium:", isPremium);
            
            // Apply the correct CSS class based on premium status
            // This matches the original app's behavior
            if (isPremium) {
                // Premium users get full-screen layout (no ads)
                $('.main').removeClass('mainWithAdd');
                
                console.log("FactoryUi: Applied premium (full-screen) layout - removed mainWithAdd class");
            } else {
                // Non-premium users get standard layout with ad space
                $('.main').addClass('mainWithAdd');
                
                console.log("FactoryUi: Applied non-premium (standard) layout with mainWithAdd class");
            }
            
            // Let CSS handle the dimensions - don't override with inline styles
            console.log("FactoryUi: CSS classes applied, dimensions handled by CSS rules");
        }
    };
    
    /**
     * Refresh premium map dimensions
     * Call this when premium status changes
     * @public
     */
    FactoryUi.prototype.refreshPremiumDimensions = function() {
        this._applyPremiumMapDimensions();
    };
    
    /**
     * Set premium status and update dimensions
     * @param {boolean} isPremium - Whether user is premium
     * @public
     */
    FactoryUi.prototype.setPremiumStatus = function(isPremium) {
        if (this.factory && this.factory.getGame()) {
            var game = this.factory.getGame();
            
            // Update premium status in game if method exists
            if (game.setIsPremium && typeof game.setIsPremium === 'function') {
                game.setIsPremium(isPremium);
            }
            
            // Refresh the UI dimensions
            this.refreshPremiumDimensions();
        }
    };
    
    /**
     * Get current premium status
     * @returns {boolean} True if user is premium
     * @public
     */
    FactoryUi.prototype.getPremiumStatus = function() {
        return this._isPremiumUser();
    };
    
    /**
     * Toggle premium status for testing
     * @public
     */
    FactoryUi.prototype.togglePremiumStatus = function() {
        var currentStatus = this.getPremiumStatus();
        this.setPremiumStatus(!currentStatus);
        
        console.log("Premium status toggled to:", !currentStatus);
        return !currentStatus;
    };
    
    /**
     * Debug method to check current CSS class state
     * @public
     */
    FactoryUi.prototype.debugLayoutState = function() {
        console.log("=== Layout Debug Info ===");
        console.log("Body classes:", $('body').attr('class'));
        console.log("Main classes:", $('.main').attr('class'));
        console.log("MapContainer dimensions:", this.mapContainer ? {
            width: this.mapContainer.css('width'),
            height: this.mapContainer.css('height')
        } : "No mapContainer");
        console.log("Current premium status:", this.getPremiumStatus());
        console.log("mainWithAdd class present:", $('.main').hasClass('mainWithAdd'));
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
