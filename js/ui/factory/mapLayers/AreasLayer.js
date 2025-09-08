/**
 * AreasLayer - Factory expansion areas with interactive purchasing
 * Extracted from original_app.js
 */
define("ui/factory/mapLayers/AreasLayer", [
    "game/action/BuyAreaAction",
    "ui/helper/ConfirmUi",
    "ui/helper/AlertUi"
], function(BuyAreaAction, ConfirmUi, AlertUi) {

    console.log("AreasLayer module loading...");

    /**
     * AreasLayer constructor
     * @param {Object} imageMap - ImageMap instance
     * @param {Object} factory - Factory instance
     * @param {Object} options - Options with tileSize
     */
    var AreasLayer = function(imageMap, factory, options) {
        console.log("AreasLayer constructor called");
        this.imageMap = imageMap;
        this.factory = factory;
        this.game = factory.getGame();
        this.tileSize = (options && options.tileSize) ? options.tileSize : 21;
        this.tilesX = factory.getMeta().tilesX;
        this.tilesY = factory.getMeta().tilesY;

        // Create container div for areas
        this.area = null;
    };

    /**
     * Display the areas layer (like original app)
     * @param {Object} container - Container element (jQuery object)
     */
    AreasLayer.prototype.display = function(container) {
        var self = this;
        this.container = container;

        // Create areas layer div (like original app)
        this.container.append('<div id="areasLayer" style="position:absolute"></div>');
        this.area = this.container.find("#areasLayer");

        // Set up event listeners (like original app)
        this.factory.getEventManager().addListener("AreasLayer", FactoryEvent.FACTORY_COMPONENTS_CHANGED, function() {
            self.redraw();
        });

        // Initial render
        this.redraw();
    };

    /**
     * Redraw the areas layer (like original app)
     */
    AreasLayer.prototype.redraw = function() {
        var self = this;

        // Clear existing areas
        this.area.html("");

        // Get areas metadata and check which are bought
        var areas = this.factory.getMeta().areas;
        if (!areas) return;

        // Create buyable area elements for unbought areas
        areas.forEach(function(area) {
            if (!self.factory.getAreasManager().getIsAreaBought(area.id)) {
                // Create area divs for each location
                area.locations.forEach(function(location, index) {
                    var areaDiv = $('<div class="mapBuyArea" data-id="' + area.id + '"></div>')
                        .css("left", self.tileSize * location.x)
                        .css("top", self.tileSize * location.y)
                        .css("width", self.tileSize * location.x2)
                        .css("height", self.tileSize * location.y2);

                    var titleDiv = "";
                    if (index === 0) { // Only show title on first location
                        titleDiv = $('<div class="mapBuyAreaTitle money">' + area.name + '<br />Buy for <br /><b>$' + self._formatNumber(area.price) + '</b></div>')
                            .css("left", self.tileSize * location.x)
                            .css("top", self.tileSize * location.y)
                            .css("width", self.tileSize * location.x2)
                            .css("marginTop", (self.tileSize * location.y2) / 2 - 23);
                    }

                    self.area.append(areaDiv);
                    if (titleDiv) {
                        self.area.append(titleDiv);
                    }
                });
            }
        });

        // Set up mouse interaction handlers (like original app)
        this._setupMouseHandlers();
    };

    /**
     * Set up mouse event handlers for area interaction
     * @private
     */
    AreasLayer.prototype._setupMouseHandlers = function() {
        var self = this;
        var currentHoverArea = null;
        var isScrolling = false;

        // Handle scroll start/end to prevent clicks during scrolling
        this.factory.getEventManager().addListener(
            "AreasLayer",
            FactoryEvent.FACTORY_SCROLL_START,
            function() {
                isScrolling = true;
            }.bind(this)
        );

        this.factory.getEventManager().addListener(
            "AreasLayer",
            FactoryEvent.FACTORY_SCROLL_END,
            function() {
                setTimeout(function() {
                    isScrolling = false;
                }, 100);
            }.bind(this)
        );

        // Mouse over handler
        this.area.find(".mapBuyArea").mouseover(function(e) {
            var areaId = $(this).attr("data-id");
            if (currentHoverArea !== areaId) {
                self.area.find(".mapBuyArea").removeClass("mapBuyAreaOver");
                self.area.find(".mapBuyArea[data-id='" + areaId + "']").addClass("mapBuyAreaOver");
                currentHoverArea = areaId;
            }
        });

        // Mouse out handler
        this.area.find(".mapBuyArea").mouseout(function(e) {
            self.area.find(".mapBuyArea").removeClass("mapBuyAreaOver");
            currentHoverArea = null;
        });

        // Click handler
        this.area.find(".mapBuyArea").click(function(e) {
            if (!isScrolling) {
                var areaId = $(this).attr("data-id");
                var areaMeta = self.factory.getMeta().areasById[areaId];

                var buyAction = new BuyAreaAction(self.factory, areaId);
                if (buyAction.canBuy()) {
                    // Show confirmation dialog
                    new ConfirmUi("", '<center>Are you sure you want to buy this area for <br /><b class="money" style="font-size:1.1em">$' + self._formatNumber(areaMeta.price) + '</b></center>')
                        .setOkTitle("Yes, buy")
                        .setCancelTitle("No")
                        .setOkCallback(function() {
                            var action = new BuyAreaAction(self.factory, areaId);
                            if (action.canBuy()) {
                                action.buy();
                                self.redraw();
                            }
                        })
                        .display();
                } else {
                    // Show error dialog
                    new AlertUi("", "<center>You don't have enough money to buy selected area</center>").display();
                }
            }
        });
    };

    /**
     * Format number for display
     * @param {number} num - Number to format
     * @returns {string} Formatted number string
     * @private
     */
    AreasLayer.prototype._formatNumber = function(num) {
        if (num === undefined || num === null) return "?";
        if (Math.abs(num) < 10) return Math.round(100 * num) / 100;
        if (Math.abs(num) < 1e3) return Math.round(10 * num) / 10;
        if (Math.abs(num) < 1e6) {
            return Number(num)
                .toFixed(0)
                .replace(/\d(?=(\d{3})+$)/g, "$& ");
        }

        var parts = num.toString().split("e+", 2);
        var mantissa = parts[0];
        var decimalPlaces = mantissa < 0 ? 2 : 1;
        var power = 3 * Math.floor((Number(mantissa).toFixed(0).length - decimalPlaces) / 3);
        var totalPower = power + (parts[1] ? Number(parts[1]) : 0);
        var remainder = totalPower % 3;

        mantissa *= Math.pow(10, remainder - power);
        totalPower -= remainder;

        return Math.round(100 * mantissa) / 100 + (this._getNumberNames()[totalPower] ? this._getNumberNames()[totalPower] : "e" + totalPower);
    };

    /**
     * Get number name mappings
     * @returns {Object} Number name mappings
     * @private
     */
    AreasLayer.prototype._getNumberNames = function() {
        return {
            6: " million",
            9: " billion",
            12: " trillion",
            15: " quadrillion",
            18: " quintillion",
            21: " sextillion",
            24: " septillion",
            27: " octillion",
            30: " nonillion",
            33: " decillion",
            36: " undecillion",
            39: " duodecillion",
            42: " tredecillion",
            45: " quattuordecillion",
            48: " quindecillion",
            51: " sexdecillion",
            54: " septendecillion",
            57: " octodecillion",
            60: " novemdecillion",
            63: " vigintillion"
        };
    };

    /**
     * Destroy the areas layer (like original app)
     */
    AreasLayer.prototype.destroy = function() {
        this.factory.getEventManager().removeListenerForType("AreasLayer");
        if (this.container) {
            this.container.html("");
            this.container = null;
        }
    };

    return AreasLayer;
});
