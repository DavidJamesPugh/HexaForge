/**
 * Game class - main game logic controller
 * Extracted from original_app.js
 */
define("game/Game", [
    "game/Factory", 
    "base/EventManager", 
    "game/ResearchManager", 
    "game/AchievementsManager", 
    "game/calculator/Calculator", 
    "game/statistics/Statistics", 
    "game/Ticker"
], function(Factory, EventManager, ResearchManager, AchievementsManager, Calculator, Statistics, Ticker) {
    
    /**
     * Main Game class constructor
     * @param {Object} meta - Game meta configuration
     * @param {Object} confirmedTimestamp - Confirmed timestamp object
     */
    var Game = function(meta, confirmedTimestamp) {
        this.meta = meta || {};
        this.confirmedTimestamp = confirmedTimestamp || { timestamp: Date.now() };
        this.money = (meta && meta.startingMoney !== undefined) ? meta.startingMoney : 1000;
        this.researchPoints = (meta && meta.startingResearchPoints !== undefined) ? meta.startingResearchPoints : 100;
        
        // Create event manager for game events
        try {
            this.em = new EventManager(GameEvent, "Game");
        } catch (error) {
            console.warn("Failed to create EventManager:", error);
            this.em = null;
        }
        
        // Initialize factories
        this.factories = {};
        if (meta && meta.factories && Array.isArray(meta.factories)) {
            for (var i = 0; i < meta.factories.length; i++) {
                try {
                    var factoryMeta = meta.factories[i];
                    this.factories[factoryMeta.id] = new Factory(factoryMeta, this);
                } catch (error) {
                    console.warn("Failed to create factory:", factoryMeta, error);
                }
            }
        }
        
        // Initialize these managers when their modules are extracted
        try {
            this.researchManager = new ResearchManager(this);
            this.achievementsManager = new AchievementsManager(this);
            this.calculator = new Calculator(this);
            this.statistics = new Statistics(this);
            this.ticker = new Ticker(this, this.confirmedTimestamp);
        } catch (error) {
            console.warn("Failed to create managers:", error);
        }
        
        this.profitMultiplier = 1;
        this.researchProductionMultiplier = 1;
        this.isPremium = false;
        
        // Initialize premium status based on achievements and purchases
        this._initializePremiumStatus();
    };

    /**
     * Initialize premium status based on user's achievements and purchases
     * Based on original app's premium detection logic
     * @private
     */
    Game.prototype._initializePremiumStatus = function() {
        // Check if user has premium achievements
        if (this.achievementsManager) {
            var hasCollectingCash = this.achievementsManager.getAchievement("collectingCash");
            var hasCollectingCash2 = this.achievementsManager.getAchievement("collectingCash2");
            
            // Premium users typically have access to extra features
            if (hasCollectingCash && hasCollectingCash.isUnlocked && 
                hasCollectingCash2 && hasCollectingCash2.isUnlocked) {
                this.isPremium = true;
            }
        }
        
        // Check for premium purchases (time travel tickets, bonus ticks, etc.)
        // This would be set when user makes premium purchases
    };

    /**
     * Initialize the game
     * @returns {Game} This game instance for chaining
     */
    Game.prototype.init = function() {
        try {
            if (this.calculator && this.calculator.init) {
                this.calculator.init();
            }
            if (this.statistics && this.statistics.init) {
                this.statistics.init();
            }
            if (this.ticker && this.ticker.init) {
                this.ticker.init();
            }
        } catch (error) {
            console.warn("Error during game initialization:", error);
        }
        return this;
    };

    /**
     * Clean up game resources
     */
    Game.prototype.destroy = function() {
        try {
            if (this.calculator && this.calculator.destroy) {
                this.calculator.destroy();
            }
            if (this.statistics && this.statistics.destroy) {
                this.statistics.destroy();
            }
            if (this.ticker && this.ticker.destroy) {
                this.ticker.destroy();
            }
        } catch (error) {
            console.warn("Error during game destruction:", error);
        }
    };

    /**
     * Get the game meta configuration
     * @returns {Object} Meta configuration object
     */
    Game.prototype.getMeta = function() {
        return this.meta;
    };
    
    /**
     * Get the game event manager
     * @returns {Object} EventManager instance
     */
    Game.prototype.getEventManager = function() {
        return this.em;
    };
    
    /**
     * Get the research manager
     * @returns {Object} ResearchManager instance
     */
    Game.prototype.getResearchManager = function() {
        return this.researchManager;
    };
    
    /**
     * Get the achievements manager
     * @returns {Object} AchievementsManager instance
     */
    Game.prototype.getAchievementsManager = function() {
        return this.achievementsManager;
    };
    
    /**
     * Get the calculator
     * @returns {Object} Calculator instance
     */
    Game.prototype.getCalculator = function() {
        return this.calculator;
    };
    
    /**
     * Get the statistics
     * @returns {Object} Statistics instance
     */
    Game.prototype.getStatistics = function() {
        return this.statistics;
    };
    
    /**
     * Get all factories
     * @returns {Object} Factories object
     */
    Game.prototype.getFactories = function() {
        return this.factories;
    };
    
    /**
     * Get the current money
     * @returns {number} Current money amount
     */
    Game.prototype.getMoney = function() {
        return this.money || 0;
    };
    
    /**
     * Set the current money
     * @param {number} amount - Money amount to set
     */
    Game.prototype.setMoney = function(amount) {
        if (isNaN(Number(amount))) {
            amount = 0;
        }
        
        if (this.meta && this.meta.minNegativeMoney !== undefined && amount < this.meta.minNegativeMoney) {
            amount = this.meta.minNegativeMoney;
        }
        
        this.money = amount;
        
        if (this.em && this.em.invokeEvent) {
            try {
                this.em.invokeEvent("MONEY_UPDATED", this.money);
            } catch (error) {
                console.warn("Error invoking MONEY_UPDATED event:", error);
            }
        }
    };
    
    /**
     * Get the current research points
     * @returns {number} Current research points
     */
    Game.prototype.getResearchPoints = function() {
        return this.researchPoints || 0;
    };
    
    /**
     * Set the current research points
     * @param {number} amount - Research points to set
     */
    Game.prototype.setResearchPoints = function(amount) {
        if (isNaN(Number(amount))) {
            amount = 0;
        }
        
        this.researchPoints = amount;
        
        if (this.em && this.em.invokeEvent) {
            try {
                this.em.invokeEvent("RESEARCH_POINTS_UPDATED", this.researchPoints);
            } catch (error) {
                console.warn("Error invoking RESEARCH_POINTS_UPDATED event:", error);
            }
        }
    };
    
    /**
     * Get a specific factory by ID
     * @param {string} factoryId - Factory identifier
     * @returns {Object|null} Factory instance or null if not found
     */
    Game.prototype.getFactory = function(factoryId) {
        if (!factoryId || !this.factories) {
            return null;
        }
        return this.factories[factoryId] || null;
    };
    
    /**
     * Get component metadata by component ID
     * @param {string} componentId - Component identifier
     * @returns {Object|null} Component metadata or null if not found
     */
    Game.prototype.getComponentMeta = function(componentId) {
        if (!this.meta || !this.meta.componentsById) {
            return null;
        }
        return this.meta.componentsById[componentId] || null;
    };
    
    /**
     * Add money to current amount
     * @param {number} amount - Amount to add
     */
    Game.prototype.addMoney = function(amount) {
        if (isNaN(Number(amount))) {
            amount = 0;
        }
        this.setMoney((this.money || 0) + amount);
    };
    
    /**
     * Add research points to current amount
     * @param {number} amount - Amount to add
     */
    Game.prototype.addResearchPoints = function(amount) {
        if (isNaN(Number(amount))) {
            amount = 0;
        }
        this.setResearchPoints((this.researchPoints || 0) + amount);
    };
    
    /**
     * Get the current profit multiplier
     * @returns {number} Profit multiplier value
     */
    Game.prototype.getProfitMultiplier = function() {
        return this.profitMultiplier || 1;
    };
    
    /**
     * Get the current research production multiplier
     * @returns {number} Research production multiplier value
     */
    Game.prototype.getResearchProductionMultiplier = function() {
        return this.researchProductionMultiplier || 1;
    };
    
    /**
     * Check if user has premium status
     * @returns {boolean} True if premium
     */
    Game.prototype.getIsPremium = function() {
        return !!this.isPremium;
    };
    
    /**
     * Get the game ticker instance
     * @returns {Object} Ticker instance
     */
    Game.prototype.getTicker = function() {
        return this.ticker;
    };
    
    /**
     * Export game state to writer
     * @returns {Object} BinaryArrayWriter with game data
     */
    Game.prototype.exportToWriter = function() {
        // TODO: Implement BinaryArrayWriter when available
        console.log("Game.exportToWriter - TODO: Implement BinaryArrayWriter");
        return null;
    };
    
    /**
     * Import game data from a binary reader
     * @param {Object} reader - BinaryArrayReader with game data
     */
    Game.prototype.importFromReader = function(reader) {
        // TODO: Implement BinaryArrayReader when available
        console.log("Game.importFromReader - TODO: Implement BinaryArrayReader");
    };
    
    /**
     * Import game data from JSON save data
     * @param {Object} saveData - JSON save data
     */
    Game.prototype.importFromJson = function(saveData) {
        if (!saveData) return;
        
        console.log("Game.importFromJson called with:", saveData);
        
        // Import basic game state
        if (saveData.game) {
            if (saveData.game.money !== undefined) {
                this.setMoney(saveData.game.money);
            }
            if (saveData.game.researchPoints !== undefined) {
                this.setResearchPoints(saveData.game.researchPoints);
            }
        }
        
        // Import factories
        if (saveData.factories) {
            for (var factoryId in saveData.factories) {
                var factoryData = saveData.factories[factoryId];
                var factory = this.getFactory(factoryId);
                if (factory && factory.importFromJson) {
                    factory.importFromJson(factoryData);
                }
            }
        }
        
        // Reset statistics like the original app
        if (this.statistics && this.statistics.reset) {
            this.statistics.reset();
        }
    };
    
    /**
     * Set premium status
     * @param {boolean} isPremium - Whether user is premium
     */
    Game.prototype.setIsPremium = function(isPremium) {
        this.isPremium = !!isPremium;
    };
    
    /**
     * Set the profit multiplier
     * @param {number} multiplier - Profit multiplier value
     */
    Game.prototype.setProfitMultiplier = function(multiplier) {
        if (isNaN(Number(multiplier))) {
            multiplier = 1;
        }
        this.profitMultiplier = multiplier;
    };
    
    /**
     * Set the research production multiplier
     * @param {number} multiplier - Research production multiplier value
     */
    Game.prototype.setResearchProductionMultiplier = function(multiplier) {
        if (isNaN(Number(multiplier))) {
            multiplier = 1;
        }
        this.researchProductionMultiplier = multiplier;
    };
    
    /**
     * Check if user has premium access to specific features
     * @param {string} feature - Feature to check (e.g., 'fullScreen', 'noAds')
     * @returns {boolean} True if user has access to the feature
     */
    Game.prototype.hasPremiumFeature = function(feature) {
        if (!feature || !this.isPremium) {
            return false;
        }
        
        // Premium users get access to all features
        switch (feature) {
            case 'fullScreen':
            case 'noAds':
            case 'extraTicks':
            case 'timeTravel':
            case 'bonusMultipliers':
                return true;
            default:
                return false;
        }
    };

    return Game;
});
