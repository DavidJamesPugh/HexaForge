/**
 * TimeTravelUi - Displays the time travel modal with ticket usage functionality
 * Based on the original Factory Idle implementation
 */

define("ui/TimeTravelUi", [
    //"text!template/timeTravel.html",
    "game/action/PassTimeAction",
    "lib/handlebars",
    "config/event/GameUiEvent"
], function( PassTimeAction, Handlebars, GameUiEvent) {

    /**
     * TimeTravelUi constructor
     * @param {Object} gameUiEm - Game UI event manager
     * @param {Object} play - Play instance
     */
    var TimeTravelUi = function(gameUiEm, play) {
        this.gameUiEm = gameUiEm;
        this.play = play;
        this.game = play.getGame();
        this.isVisible = false;
    };

    /**
     * Initialize the time travel UI
     * @returns {TimeTravelUi} This instance for chaining
     */
    TimeTravelUi.prototype.init = function() {
        this.gameUiEm.addListener("timeTravel", GameUiEvent.SHOW_TIME_TRAVEL, function() {
            this.display();
        }.bind(this));

        return this;
    };

    /**
     * Display the time travel modal
     */
    TimeTravelUi.prototype.display = function() {
        if (!this.isVisible) {
            this._display();
        }
    };

    /**
     * Internal display method
     * @private
     */
    TimeTravelUi.prototype._display = function() {
        var passTimeAction = new PassTimeAction(this.game, this.play.getMeta().timeTravelTicketValue);

        // Format numbers for display
        var formatNumber = function(num) {
            if (num >= 1000000) {
                return (num / 1000000).toFixed(1) + "M";
            } else if (num >= 1000) {
                return (num / 1000).toFixed(1) + "K";
            }
            return Math.round(num).toString();
        };

        var templateData = {
            ticketValue: this.play.getMeta().timeTravelTicketValue,
            tickets: this.game.getTicker().getTimeTravelTickets(),
            hasTickets: this.game.getTicker().getTimeTravelTickets() > 0,
            ticks: formatNumber(passTimeAction.getTicks()),
            profit: formatNumber(passTimeAction.getProfit()),
            profitPerTick: formatNumber(Math.round(passTimeAction.getProfit() / passTimeAction.getTicks())),
            researchPoints: formatNumber(passTimeAction.getResearchPoints()),
            researchPointsPerTick: formatNumber(Math.round(passTimeAction.getResearchPoints() / passTimeAction.getTicks()))
        };

        // Use Handlebars to compile the template with data
        var html = Handlebars.compile(timeTravelTemplate)(templateData);
        $("body").append(html);

        this.isVisible = true;
        var self = this;
        var timeTravelElement = $("#timeTravel");

        // Center the modal
        timeTravelElement.css("left", ($("html").width() - timeTravelElement.outerWidth()) / 2);

        // Close button
        timeTravelElement.find(".closeButton").click(function() {
            self.hide();
        });

        // Background click to close
        $("#timeTravelBg").click(function() {
            self.hide();
        });

        // Get more tickets button
        timeTravelElement.find(".getMore").click(function() {
            self.gameUiEm.invokeEvent(GameUiEvent.SHOW_PURCHASES);
            self.hide();
        });

        // Travel button
        timeTravelElement.find(".travel").click(function() {
            if (passTimeAction.canPassTime()) {
                passTimeAction.passTime();
                self.hide();
                // Refresh the display with updated values
                self.display();
            } else {
                alert("You don't have a ticket for time travel!");
            }
        });

        // Refresh button
        timeTravelElement.find(".refresh").click(function() {
            self.hide();
            self.display();
        });
    };

    /**
     * Hide the time travel modal
     */
    TimeTravelUi.prototype.hide = function() {
        this.isVisible = false;
        $("#timeTravel").remove();
        $("#timeTravelBg").remove();
    };

    /**
     * Destroy the TimeTravelUi and clean up resources
     */
    TimeTravelUi.prototype.destroy = function() {
        this.hide();

        // Remove event listeners
        if (this.game.getEventManager) {
            this.game.getEventManager().removeListenerForType("timeTravel");
        }

        if (this.gameUiEm) {
            this.gameUiEm.removeListenerForType("timeTravel");
        }
    };

    return TimeTravelUi;
});
