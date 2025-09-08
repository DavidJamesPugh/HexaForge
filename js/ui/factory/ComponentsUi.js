/**
 * ComponentsUi - Factory component selection interface
 * Handles component icon clicks and communicates with MouseLayer for placement
 */
define("ui/factory/ComponentsUi", [
    "text!template/factory/components.html",
    "config/event/FactoryEvent",
    "config/event/GlobalUiEvent",
    "handlebars"
], function(componentsTemplate, FactoryEvent, GlobalUiEvent, Handlebars) {

    var ComponentsUi = function(globalUiEventManager, factory) {
        this.globalUiEventManager = globalUiEventManager;
        this.factory = factory;
        this.game = factory.getGame();
        this.lastSelectedComponentId = null;
        this.currentlySelectedComponentId = null;
    };

    /**
     * Display the component selection UI
     */
    ComponentsUi.prototype.display = function(container) {
        var self = this;
        this.container = container;

        // Build component selection data from game metadata
        var componentGroups = this._buildComponentSelectionData();

        var compiledTemplate = Handlebars.compile(componentsTemplate)({ components: componentGroups });
        
        this.container.html(compiledTemplate);

        // Set up event listeners for user interactions
        this._setupInteractionHandlers();

        // Initialize with no component selected
        this.factory.getEventManager().invokeEvent(FactoryEvent.COMPONENT_META_SELECTED, null);
    };

    /**
     * Build component selection data from game metadata
     */
    ComponentsUi.prototype._buildComponentSelectionData = function() {
        var components = [];
        var componentSelectionLayout = this.game.getMeta().componentsSelection;

        // Fallback to basic component layout if not defined
        if (!componentSelectionLayout) {
            componentSelectionLayout = [
                ["noComponent", "buyer", "converter", "seller"],
                ["garbage", "sorter", "transport", "researchCenter"],
                ["lab", "conveyor", "splitter", "merger"]
            ];
        }

        // Process each row of components
        for (var rowIndex = 0; rowIndex < componentSelectionLayout.length; rowIndex++) {
            components[rowIndex] = { sub: [] };

            // Process each component in the current row
            for (var colIndex = 0; colIndex < componentSelectionLayout[rowIndex].length; colIndex++) {
                var componentId = componentSelectionLayout[rowIndex][colIndex];
                var componentMetadata = this.game.getMeta().componentsById[componentId];

                components[rowIndex].sub[colIndex] = {};

                // Check if component is available for purchase
                if (componentMetadata && this._isComponentAvailableForPurchase(componentMetadata)) {
                    components[rowIndex].sub[colIndex] = {
                        id: componentMetadata.id,
                        name: componentMetadata.name,
                        style: "background-position: -" + (26 * (componentMetadata.iconX || 0)) + "px -" + (26 * (componentMetadata.iconY || 0)) + "px"
                    };
                } else if (componentId === "noComponent") {
                    // Special case for "no component" selection
                    components[rowIndex].sub[colIndex] = {
                        name: "No component",
                        style: "background-position: 0px 0px"
                    };
                }
            }
        }
console.log(components);
        return components;
    };

    /**
     * Check if a component is available for purchase (respects research requirements)
     */
    ComponentsUi.prototype._isComponentAvailableForPurchase = function(componentMetadata) {
        // Check research requirements
        if (componentMetadata && componentMetadata.requiresResearch) {
            var researchManager = this.game.getResearchManager && this.game.getResearchManager();
            if (!researchManager || !researchManager.getResearch) {
                return false; // Hide locked components if research manager not available
            }
            return researchManager.getResearch(componentMetadata.requiresResearch) > 0;
        }
        return true; // No research requirements, component is available
    };

    /**
     * Set up event handlers for user interactions
     */
    ComponentsUi.prototype._setupInteractionHandlers = function() {
        var self = this;

        // Handle component meta selection events from MouseLayer
        this.factory.getEventManager().addListener(
            "componentsUi",
            FactoryEvent.COMPONENT_META_SELECTED,
            function(selectedComponentId) {
                // Update selection state if component changed
                if (self.currentlySelectedComponentId !== selectedComponentId) {
                    self.lastSelectedComponentId = self.currentlySelectedComponentId;
                }

                self.currentlySelectedComponentId = selectedComponentId;

                // Update visual selection state
                self.container.find(".button").removeClass("buttonSelected");
                self.container.find(".but" + (selectedComponentId || "")).addClass("buttonSelected");
            }
        );

        // Handle component button clicks
        this.container.find(".button").click(function(event) {
            var clickedElement = $(event.target);
            var selectedComponentId = clickedElement.attr("data-id");
                                    

            // Notify MouseLayer of component selection
            self.factory.getEventManager().invokeEvent(
                FactoryEvent.COMPONENT_META_SELECTED,
                selectedComponentId || null
            );
        });

        this.container.on("mouseenter mouseleave", ".button", function (event) {
            var componentId = (event.type === "mouseenter")
                ? $(event.target).attr("data-id")
                : null;
        
            self.factory.getEventManager().invokeEvent(
                FactoryEvent.HOVER_COMPONENT_META,
                componentId
            );
        });

        // Handle keyboard shortcuts (spacebar toggles selection)
        this.globalUiEventManager.addListener(
            "componentsUi",
            GlobalUiEvent.KEY_PRESS,
            function(keyboardEvent) {
                var keyCode = keyboardEvent.charCode !== undefined ? keyboardEvent.charCode : keyboardEvent.keyCode;

                if (keyCode === 0 || keyCode === 32) { // Spacebar pressed
                    var componentIdToSelect = self.currentlySelectedComponentId ? null : self.lastSelectedComponentId;
                    self.factory.getEventManager().invokeEvent(FactoryEvent.COMPONENT_META_SELECTED, componentIdToSelect);
                    keyboardEvent.preventDefault();
                }
            }
        );

        // Handle screenshot/map view button
        this.container.on("click", "#makeScreenShotButton", function() {
            self.globalUiEventManager.invokeEvent(FactoryEvent.OPEN_SCREENSHOT_VIEW);
        });
    };

    /**
     * Clean up resources and event listeners
     */
    ComponentsUi.prototype.destroy = function() {
        // Remove all event listeners
        this.factory.getEventManager().removeListenerForType("componentsUi");
        this.game.getEventManager().removeListenerForType("componentsUi");
        this.globalUiEventManager.removeListenerForType("componentsUi");

        // Clear container
        if (this.container) {
            this.container.off(); // Remove all event handlers
            this.container.html("");
            this.container = null;
        }
    };

    return ComponentsUi;
});
