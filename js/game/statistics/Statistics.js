/**
 * Statistics module - tracks game statistics
 * Based on the original Factory Idle implementation
 */
define("game/statistics/Statistics", [], function() {

    /**
     * Statistics class
     * @constructor
     * @param {Object} game - Game instance
     */
    var Statistics = function(game) {
        this.game = game;
        this.stats = {};
        this.avgProfit = 0;
        this.avgResearchPointsProduction = 0;
    };

    /**
     * Initialize the statistics
     */
    Statistics.prototype.init = function() {
        // Initialize statistics tracking
        this.updateAverages();
    };

    /**
     * Destroy the statistics
     */
    Statistics.prototype.destroy = function() {
        // Cleanup
    };

    /**
     * Reset statistics
     */
    Statistics.prototype.reset = function() {
        this.avgProfit = 0;
        this.avgResearchPointsProduction = 0;
        this.stats = {};
    };

    /**
     * Update average profit calculation
     */
    Statistics.prototype.updateAverages = function() {
        // Calculate average profit per tick from all factories
        var totalProfit = 0;
        var factoryCount = 0;

        if (this.game && this.game.getFactories) {
            var factories = this.game.getFactories();
            for (var i = 0; i < factories.length; i++) {
                var factory = factories[i];
                if (factory && factory.getStatistics) {
                    var factoryStats = factory.getStatistics();
                    if (factoryStats && typeof factoryStats.getAvgProfit === 'function') {
                        totalProfit += factoryStats.getAvgProfit();
                        factoryCount++;
                    }
                }
            }
        }

        this.avgProfit = factoryCount > 0 ? totalProfit / factoryCount : 0;

        // Calculate average research points production
        var totalResearchPoints = 0;
        factoryCount = 0;

        if (this.game && this.game.getFactories) {
            var factories = this.game.getFactories();
            for (var i = 0; i < factories.length; i++) {
                var factory = factories[i];
                if (factory && factory.getStatistics) {
                    var factoryStats = factory.getStatistics();
                    if (factoryStats && typeof factoryStats.getAvgResearchPointsProduction === 'function') {
                        totalResearchPoints += factoryStats.getAvgResearchPointsProduction();
                        factoryCount++;
                    }
                }
            }
        }

        this.avgResearchPointsProduction = factoryCount > 0 ? totalResearchPoints / factoryCount : 0;
    };

    /**
     * Get average profit per tick
     * @returns {number} Average profit per tick
     */
    Statistics.prototype.getAvgProfit = function() {
        return this.avgProfit;
    };

    /**
     * Get average research points production per tick
     * @returns {number} Average research points production per tick
     */
    Statistics.prototype.getAvgResearchPointsProduction = function() {
        return this.avgResearchPointsProduction;
    };

    return Statistics;
});
