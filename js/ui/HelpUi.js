/**
 * HelpUi class - game tutorials and help system interface
 * Extracted from original_app.js
 */
define("ui/HelpUi", [
    // TODO: These dependencies will need to be implemented as we extract more modules
    // "text!template/help.html"
], function() {
    
    /**
     * HelpUi constructor
     * @param {Object} gameUiEm - Game UI event manager
     * @param {Object} game - Game instance
     */
    var HelpUi = function(gameUiEm, game) {
        this.gameUiEm = gameUiEm;
        this.game = game;
        this.isVisible = false;
        this.container = null;
    };
    
    /**
     * Initialize the help UI
     * @returns {HelpUi} This instance for chaining
     */
    HelpUi.prototype.init = function() {
        // Setup help display event listener
        this.gameUiEm.addListener("help", "SHOW_HELP", function() {
            this.display();
        }.bind(this));
        
        return this;
    };
    
    /**
     * Display the help UI
     */
    HelpUi.prototype.display = function() {
        if (!this.isVisible) {
            this.isVisible = true;
            
            // Create help content
            this._createHelpContent();
            
            // Setup event listeners
            this._setupEventListeners();
        }
    };
    
    /**
     * Create the help content
     * @private
     */
    HelpUi.prototype._createHelpContent = function() {
        var html = '<div id="helpBg" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 9998;"></div>';
        html += '<div id="help" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 20px; border-radius: 8px; max-width: 800px; max-height: 80vh; overflow-y: auto; z-index: 9999; font-family: Arial, sans-serif;">';
        
        html += '<a href="javascript:void(0);" class="closeButton" style="float:right; display:block; background: #f44336; color: white; padding: 5px 10px; border-radius: 3px; text-decoration: none;">Close</a>';
        html += '<h2 style="color: #2196F3; margin-bottom: 20px;">🎮 Factory Idle Help</h2>';
        
        // Help menu
        html += '<div class="menu" style="margin-bottom: 20px; border-bottom: 1px solid #ddd; padding-bottom: 15px;">';
        html += '<a href="javascript:void(0);" data-id="gettingStarted" style="display: block; padding: 8px; margin: 5px 0; background: #e3f2fd; border-radius: 3px; text-decoration: none; color: #1976d2;">1. Getting started</a>';
        html += '<a href="javascript:void(0);" data-id="ironProduction" style="display: block; padding: 8px; margin: 5px 0; background: #e3f2fd; border-radius: 3px; text-decoration: none; color: #1976d2;">2. Setting up iron production</a>';
        html += '<a href="javascript:void(0);" data-id="labProduction" style="display: block; padding: 8px; margin: 5px 0; background: #e3f2fd; border-radius: 3px; text-decoration: none; color: #1976d2;">3. Setting up lab production</a>';
        html += '<a href="javascript:void(0);" data-id="plasticProduction" style="display: block; padding: 8px; margin: 5px 0; background: #e3f2fd; border-radius: 3px; text-decoration: none; color: #1976d2;">4. Setting up plastic</a>';
        html += '<a href="javascript:void(0);" data-id="sorter" style="display: block; padding: 8px; margin: 5px 0; background: #e3f2fd; border-radius: 3px; text-decoration: none; color: #1976d2;">5. Setting up sorter</a>';
        html += '<a href="javascript:void(0);" data-id="proTips" style="display: block; padding: 8px; margin: 5px 0; background: #e3f2fd; border-radius: 3px; text-decoration: none; color: #1976d2;">6. Pro tips</a>';
        html += '<a href="javascript:void(0);" data-id="faq" style="display: block; padding: 8px; margin: 5px 0; background: #e3f2fd; border-radius: 3px; text-decoration: none; color: #1976d2;">7. Frequent questions</a>';
        html += '<a href="javascript:void(0);" data-id="updates" style="display: block; padding: 8px; margin: 5px 0; background: #e3f2fd; border-radius: 3px; text-decoration: none; color: #1976d2;">UPDATES</a>';
        html += '</div>';
        
        // Help sections
        html += this._createHelpSection("gettingStarted", "Getting Started", this._getGettingStartedContent());
        html += this._createHelpSection("ironProduction", "Setting up Iron Production", this._getIronProductionContent());
        html += this._createHelpSection("labProduction", "Setting up Lab Production", this._getLabProductionContent());
        html += this._createHelpSection("plasticProduction", "Setting up Plastic Production", this._getPlasticProductionContent());
        html += this._createHelpSection("sorter", "Sorter Setup", this._getSorterContent());
        html += this._createHelpSection("proTips", "Pro Tips", this._getProTipsContent());
        html += this._createHelpSection("faq", "Frequently Asked Questions", this._getFaqContent());
        html += this._createHelpSection("updates", "Game Updates", this._getUpdatesContent());
        
        html += '</div>';
        
        // Append to body
        $("body").append(html);
        
        // Show getting started by default
        $("#gettingStarted").show();
    };
    
    /**
     * Create a help section
     * @param {string} id - Section identifier
     * @param {string} title - Section title
     * @param {string} content - Section content
     * @returns {string} HTML for the section
     * @private
     */
    HelpUi.prototype._createHelpSection = function(id, title, content) {
        return '<div class="section" id="' + id + '" style="display: none; margin-top: 20px;">' +
               '<h3 style="color: #333; border-bottom: 2px solid #2196F3; padding-bottom: 10px;">' + title + '</h3>' +
               '<div class="content" style="line-height: 1.6;">' + content + '</div>' +
               '</div>';
    };
    
    /**
     * Get getting started content
     * @returns {string} Content HTML
     * @private
     */
    HelpUi.prototype._getGettingStartedContent = function() {
        return '<div style="margin: 15px 0;">' +
               '<p><strong>🏭 Left panel contains components.</strong> Click on one and then click on the map to where you would like to place it.</p>' +
               '<p><strong>🔄 Use conveyors</strong> to connect components, so they start producing stuff.</p>' +
               '<p><strong>📏 Make conveyors by click dragging</strong> from inside the component to the component you want the conveyor to drop off.</p>' +
               '<p><strong>💰 Sell components</strong> by selecting any component from left panel and right clicking on the map to clear its footprint.</p>' +
               '<p><strong>🗺️ Drag the map around</strong> and read stats using the cursor "component".</p>' +
               '</div>' +
               '<div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">' +
               '<h4>🎯 Keys:</h4>' +
               '<p><strong>Left click</strong> - most actions, buy component etc.</p>' +
               '<p><strong>Right click OR SHIFT + left click/drag</strong> - Sell components</p>' +
               '<p><strong>SPACE</strong> - Toggle mouse to last selected component and back</p>' +
               '</div>' +
               '<div style="background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 15px 0;">' +
               '<h4>🚀 What to expect?</h4>' +
               '<p>• More challenging game play as time goes on!</p>' +
               '<p>• Bigger and more complicated factories consisting of complicated product chains.</p>' +
               '<p>• Joy and happiness when you make a mess! :)</p>' +
               '</div>';
    };
    
    /**
     * Get iron production content
     * @returns {string} Content HTML
     * @private
     */
    HelpUi.prototype._getIronProductionContent = function() {
        return '<div style="margin: 15px 0;">' +
               '<p>In the start you should produce <strong style="color: #8B4513;">iron</strong> from <strong style="color: #A0522D;">iron ore</strong></p>' +
               '<p>For a 100% effective layout you need 4 iron buyers, 2 iron foundry and 1 seller.</p>' +
               '<p>Later as you research more technologies, these relationships change. For each component a chart shows how much of everything you need.</p>' +
               '<p>Depending on your upgrades, these numbers may be very odd, then use your best judgement to get the best layout!</p>' +
               '<p><strong>Have fun!</strong></p>' +
               '</div>';
    };
    
    /**
     * Get lab production content
     * @returns {string} Content HTML
     * @private
     */
    HelpUi.prototype._getLabProductionContent = function() {
        return '<div style="margin: 15px 0;">' +
               '<p>Labs give huge bonus to research centers, so use them as many as you can afford if you want to research new more advanced technologies.</p>' +
               '<p>Luckily for you, setting up a lab can be quite a task. Labs require many different resources to be effective, but at the same time make production chain quite costly.</p>' +
               '</div>';
    };
    
    /**
     * Get plastic production content
     * @returns {string} Content HTML
     * @private
     */
    HelpUi.prototype._getPlasticProductionContent = function() {
        return '<div style="margin: 15px 0;">' +
               '<p>Plastic production is a bit more complicated, as it also produces waste.</p>' +
               '<p>Resources come out clockwise starting from top left: plastic, waste, plastic, waste and so on. Using this piece of information, you can design your layout.</p>' +
               '<p>Later sorters will help to organize waste handling, additionally you can research clean production that will remove waste completely after you get electronics.</p>' +
               '</div>';
    };
    
    /**
     * Get sorter content
     * @returns {string} Content HTML
     * @private
     */
    HelpUi.prototype._getSorterContent = function() {
        return '<div style="margin: 15px 0;">' +
               '<p><strong>Sorter is a safe way to sort out waste in your production lines.</strong></p>' +
               '<p>Sorter needs to be configured - <strong>click on the sorter</strong> and set which exit should transport waste (or some other resource).</p>' +
               '</div>';
    };
    
    /**
     * Get pro tips content
     * @returns {string} Content HTML
     * @private
     */
    HelpUi.prototype._getProTipsContent = function() {
        return '<div style="margin: 15px 0;">' +
               '<p><strong>Order of outputs/inputs and conveyor crossings is always top → right → bottom → left (clockwise).</strong> This rule works everywhere.</p>' +
               '<p>You can construct multiple input/output lines from/to same component. Very useful if component produces more than one resource per tick.</p>' +
               '<p>Producing 20 items over 10 ticks means you need two output lines to get 100% efficiency.</p>' +
               '<p><strong>Splitting conveyor path can be used to sort resources, but has limited throughput.</strong></p>' +
               '<p>Multiple outputs from same component can also be used for sorting, but may jam if line gets full.</p>' +
               '<p>Ultimately you can use sorter component, but it also has its flaws.</p>' +
               '</div>';
    };
    
    /**
     * Get FAQ content
     * @returns {string} Content HTML
     * @private
     */
    HelpUi.prototype._getFaqContent = function() {
        return '<div style="margin: 15px 0;">' +
               '<div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #ffc107;">' +
               '<h4>🐛 I found a bug</h4>' +
               '<p>You probably didn\'t :) Think through your setup 3 times, if still seems like a bug, ask forums for a solution. Don\'t forget that this game is designed to be more difficult and challenging than an average game in the same category.</p>' +
               '</div>' +
               '<div style="background: #d1ecf1; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #17a2b8;">' +
               '<h4>❓ Why can\'t I get 100% efficiency for a buyer</h4>' +
               '<p>Check that you actually transport everything out from buyer. Sometimes one exit conveyor is not enough.</p>' +
               '</div>' +
               '<div style="background: #d4edda; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #28a745;">' +
               '<h4>🔄 Waste & plastic switched order</h4>' +
               '<p>It can happen if one of the lines gets full, therefore all resources would be sent to another output lines.</p>' +
               '</div>' +
               '<div style="background: #f8d7da; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #dc3545;">' +
               '<h4>⚠️ Upgrade is useless</h4>' +
               '<p>Some upgrades may seem useless at some points - just don\'t buy them yet - they will be useful later. It is wise to think which upgrades are good for you and which are not.</p>' +
               '</div>' +
               '</div>';
    };
    
    /**
     * Get updates content
     * @returns {string} Content HTML
     * @private
     */
    HelpUi.prototype._getUpdatesContent = function() {
        return '<div style="margin: 15px 0; max-height: 400px; overflow-y: auto;">' +
               '<div style="background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 15px 0;">' +
               '<h4>📅 V1.07 - Latest Update</h4>' +
               '<p>Quite a huge update that adds a lot of new content to the game!</p>' +
               '<ul>' +
               '<li>New very big factory - Terafactory!</li>' +
               '<li>A lot more upgrades... like a lot!</li>' +
               '<li>New late game production</li>' +
               '<li>New research center with new quite fun to setup production cycle.</li>' +
               '</ul>' +
               '</div>' +
               '<div style="background: #f3e5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">' +
               '<h4>📅 V1.06 - Balancing Update</h4>' +
               '<p>This is a huge balancing update! The game now progresses up to 3x faster!</p>' +
               '<ul>' +
               '<li>Profits of most sellers increased</li>' +
               '<li>Most research is now cheaper to get</li>' +
               '<li>Lots of more upgrades for late game</li>' +
               '<li>8x more offline bonus ticks</li>' +
               '</ul>' +
               '</div>' +
               '</div>';
    };
    
    /**
     * Setup event listeners for the help UI
     * @private
     */
    HelpUi.prototype._setupEventListeners = function() {
        var self = this;
        
        // Close button
        $("#help").find(".closeButton").click(function() {
            self.hide();
        });
        
        // Background click to close
        $("#helpBg").click(function() {
            self.hide();
        });
        
        // Menu navigation
        var sections = {};
        $("#help").find(".menu a").each(function() {
            var id = $(this).attr("data-id");
            sections[id] = $("#" + id);
            
            $(this).click(function() {
                // Hide all sections
                for (var sectionId in sections) {
                    sections[sectionId].hide();
                }
                // Show selected section
                sections[id].fadeIn();
            });
        });
    };
    
    /**
     * Hide the help UI
     */
    HelpUi.prototype.hide = function() {
        this.isVisible = false;
        $("#help").remove();
        $("#helpBg").remove();
    };
    
    /**
     * Destroy the HelpUi and clean up resources
     */
    HelpUi.prototype.destroy = function() {
        this.hide();
        
        // Remove event listeners
        if (this.game.getEventManager) {
            this.game.getEventManager().removeListenerForType("help");
        }
        
        if (this.gameUiEm) {
            this.gameUiEm.removeListenerForType("help");
        }
    };
    
    return HelpUi;
});
