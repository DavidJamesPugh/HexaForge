/**
 * PassTimeAction - Handles time travel functionality
 * Based on the original Factory Idle implementation
 */

define("game/action/PassTimeAction", [], function() {

    /**
     * PassTimeAction class - calculates time travel effects
     * @constructor
     * @param {Object} game - Game instance
     * @param {number} hours - Hours to travel (converted to seconds)
     */
    var PassTimeAction = function(game, hours) {
        this.game = game;
        this.seconds = hours * 3600; // Convert hours to seconds
        this.ticks = this.seconds * this.game.getTicker().getNormalTicksPerSec();
        this.profit = this.game.getStatistics().getAvgProfit() * this.ticks;
        this.researchPoints = this.game.getStatistics().getAvgResearchPointsProduction() * this.ticks;
    };

    /**
     * Get the number of ticks that will pass
     * @returns {number} Number of ticks
     */
    PassTimeAction.prototype.getTicks = function() {
        return this.ticks;
    };

    /**
     * Get the total profit that will be gained
     * @returns {number} Total profit
     */
    PassTimeAction.prototype.getProfit = function() {
        return this.profit;
    };

    /**
     * Get the total research points that will be gained
     * @returns {number} Total research points
     */
    PassTimeAction.prototype.getResearchPoints = function() {
        return this.researchPoints;
    };

    /**
     * Check if time can be passed (has tickets available)
     * @returns {boolean} True if time travel is possible
     */
    PassTimeAction.prototype.canPassTime = function() {
        return this.game.getTicker().getTimeTravelTickets() > 0;
    };

    /**
     * Execute the time travel
     */
    PassTimeAction.prototype.passTime = function() {
        if (this.canPassTime()) {
            // Add profit and research points
            if (this.game.addMoney) {
                this.game.addMoney(this.profit);
            }
            if (this.game.addResearchPoints) {
                this.game.addResearchPoints(this.researchPoints);
            }

            // Add ticks to ticker
            this.game.getTicker().addNoOfTicks(this.ticks);

            // Consume a time travel ticket
            this.game.getTicker().addTimeTravelTickets(-1);

            console.log("Time travel completed: " + this.ticks + " ticks, $" + this.profit + ", " + this.researchPoints + " RP");
        } else {
            console.warn("Cannot pass time: no time travel tickets available");
        }
    };

    return PassTimeAction;
});
