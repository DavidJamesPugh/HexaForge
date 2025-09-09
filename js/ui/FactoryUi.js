/**
 * FactoryUi class - individual factory interface and rendering
 * Extracted from original_app.js
 */
define("ui/FactoryUi", [
    "text!template/factory.html",
    "ui/factory/MenuUi",
    "ui/factory/MapUi",
    "ui/factory/ComponentsUi",
    "ui/factory/InfoUi",
    "lib/handlebars"
    // "ui/factory/ControlsUi",
    // "ui/factory/MapToolsUi",
    // "ui/factory/OverviewUi",
    // "ui/IncentivizedAdButtonUi"
], function(factoryTemplate, MenuUi, MapUi, ComponentsUi, InfoUi, Handlebars) {
    
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
        this.infoUi = new InfoUi(this.factory, this.statistics, this.play, this.imageMap);
        
        // Initialize UI components
        this.menuUi = new MenuUi(this.globalUiEm, this.gameUiEm, this.factory);
        this.mapUi = new MapUi(this.globalUiEm, this.imageMap, this.factory, { tileSize: 21 });
        this.componentsUi = new ComponentsUi(this.globalUiEm, this.factory);
        // TODO: Initialize remaining UI components when their modules are extracted
        // this.mapToolsUi = new MapToolsUi(this.factory);
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
        this.container.html(Handlebars.compile(factoryTemplate)());
        // Create the factory layout with proper containers
        this._createFactoryLayout();
        
        this.menuUi.display(this.container.find(".menuContainer"));
        this.mapUi.display(this.container.find(".mapContainer"));
        this.componentsUi.display(this.container.find(".componentsContainer"));
        this.infoUi.display(this.container.find(".infoContainer"));
        // this.controlsUi.display(this.container.find(".controlsContainer")),
        // this.overviewUi.display(this.container.find(".overviewContainer")),
        
        // this.incentivizedAdButtonUi.display(this.container.find(".incentivizedAd"));

        // Show map tools in dev mode
        if (this.play.isDevMode && this.play.isDevMode()) {
            // TODO: Display map tools when available
             //this.mapToolsUi.display(this.container.find(".mapToolsContainer"));
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
        if (this.container && this.container.length > 0) {
            
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
