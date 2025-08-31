/**
 * ComponentsUi - Factory component selection and placement
 * Extracted from original_app.js
 */
define("ui/factory/ComponentsUi", [
    "base/EventManager",
    "config/event/FactoryEvent",
    "config/event/GlobalUiEvent"
], function(EventManager, FactoryEvent, GlobalUiEvent) {
    
    var ComponentsUi = function(globalUiEm, factory) {
        this.globalUiEm = globalUiEm;
        this.factory = factory;
        this.game = factory.getGame();
        this.lastSelectedComponentId = null;
        this.selectedComponentId = null;
    };
    
    ComponentsUi.prototype.display = function(container) {
        var self = this;
        this.container = container;
        
        // Build component selection data
        var components = this._buildComponentSelection();
        
        // Create component selection HTML
        var componentsHtml = this._createComponentsHtml({ components: components });
        this.container.html(componentsHtml);
        
        // Set up event listeners
        this._setupEventListeners();
        
        // Initialize with no component selected
        this.factory.getEventManager().invokeEvent(FactoryEvent.COMPONENT_META_SELECTED, null);
    };
    
    ComponentsUi.prototype._buildComponentSelection = function() {
        var components = [];
        var componentsSelection = this.game.getMeta().componentsSelection;
        
        if (!componentsSelection) {
            // Fallback to basic components if selection not defined
            componentsSelection = [
                ["noComponent", "buyer", "converter", "seller"],
                ["garbage", "sorter", "transport", "researchCenter"],
                ["lab", "conveyor", "splitter", "merger"]
            ];
        }
        
        for (var row = 0; row < componentsSelection.length; row++) {
            components[row] = { sub: [] };
            
            for (var col = 0; col < componentsSelection[row].length; col++) {
                var componentId = componentsSelection[row][col];
                var componentMeta = this.game.getMeta().componentsById[componentId];
                
                components[row].sub[col] = {};
                
                if (componentMeta && this._canBuyComponent(componentMeta)) {
                    components[row].sub[col] = {
                        id: componentMeta.id,
                        name: componentMeta.name,
                        style: "background-position: -" + (26 * (componentMeta.iconX || 0)) + "px -" + (26 * (componentMeta.iconY || 0)) + "px"
                    };
                } else if (componentId === "noComponent") {
                    components[row].sub[col] = {
                        name: "No component",
                        style: "background-position: 0px 0px"
                    };
                }
            }
        }
        
        return components;
    };
    
    ComponentsUi.prototype._canBuyComponent = function(componentMeta) {
        // Placeholder for component buying logic
        // TODO: Extract BuyComponentAction module
        return true;
    };
    
    ComponentsUi.prototype._createComponentsHtml = function(data) {
        var html = '<div class="componentsBox">';
        html += '<div class="title">Components</div>';
        html += '<table cellspacing="0" cellpadding="0" border="0">';
        
        for (var row = 0; row < data.components.length; row++) {
            html += '<tr>';
            
            for (var col = 0; col < data.components[row].sub.length; col++) {
                var component = data.components[row].sub[col];
                html += '<td>';
                html += '<div class="buttonArea">';
                
                if (component.name) {
                    var buttonClass = "button";
                    if (component.id) {
                        buttonClass += " but" + component.id;
                    }
                    if (component.id === "noComponent") {
                        buttonClass += " buttonSelected";
                    }
                    
                    html += '<div class="' + buttonClass + '" data-id="' + (component.id || "") + '">';
                    html += '<div class="icon" data-id="' + (component.id || "") + '" style="' + component.style + '"></div>';
                    html += '</div>';
                }
                
                html += '</div>';
                html += '</td>';
            }
            
            html += '</tr>';
        }
        
        html += '</table>';
        html += '<div style="text-align:center; margin: 10px 0 10px 0;">';
        html += '<a href="javascript:void(0);" id="makeScreenShotButton" style="color:white; font-size:0.9em;">Show whole map</a>';
        html += '</div>';
        html += '</div>';
        
        return html;
    };
    
    ComponentsUi.prototype._setupEventListeners = function() {
        var self = this;
        
        // Component selection event
        this.factory.getEventManager().addListener(
            "componentsUi", 
            FactoryEvent.COMPONENT_META_SELECTED, 
            function(componentId) {
                if (self.selectedComponentId !== componentId) {
                    self.lastSelectedComponentId = self.selectedComponentId;
                }
                
                self.selectedComponentId = componentId;
                self.container.find(".button").removeClass("buttonSelected");
                self.container.find(".but" + (componentId || "")).addClass("buttonSelected");
            }
        );
        
        // Button click events
        this.container.find(".button").click(function(event) {
            var componentId = $(event.target).attr("data-id");
            self.factory.getEventManager().invokeEvent(FactoryEvent.COMPONENT_META_SELECTED, componentId || null);
        });
        
        // Mouse hover events
        this.container.find(".button").mouseenter(function(event) {
            var componentId = $(event.target).attr("data-id");
            self.factory.getEventManager().invokeEvent(FactoryEvent.HOVER_COMPONENT_META, componentId || null);
        });
        
        this.container.find(".button").mouseleave(function(event) {
            $(event.target).attr("data-id");
            self.factory.getEventManager().invokeEvent(FactoryEvent.HOVER_COMPONENT_META, null);
        });
        
        // Keyboard events (spacebar for selection)
        this.globalUiEm.addListener(
            "componentsUi", 
            GlobalUiEvent.KEY_PRESS, 
            function(event) {
                var keyCode = event.charCode !== undefined ? event.charCode : event.keyCode;
                
                if (keyCode === 0 || keyCode === 32) { // Spacebar
                    var componentId = self.selectedComponentId ? null : self.lastSelectedComponentId;
                    self.factory.getEventManager().invokeEvent(FactoryEvent.COMPONENT_META_SELECTED, componentId);
                    event.preventDefault();
                }
            }
        );
        
        // Screenshot button
        this.container.find("#makeScreenShotButton").click(function() {
            self.globalUiEm.invokeEvent(FactoryEvent.OPEN_SCREENSHOT_VIEW);
        });
    };
    
    ComponentsUi.prototype.destroy = function() {
        this.factory.getEventManager().removeListenerForType("componentsUi");
        this.game.getEventManager().removeListenerForType("componentsUi");
        this.globalUiEm.removeListenerForType("componentsUi");
        
        this.container.html("");
        this.container = null;
    };
    
    return ComponentsUi;
});
