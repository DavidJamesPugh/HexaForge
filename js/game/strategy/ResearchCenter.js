/**
 * ResearchCenter Strategy - Research point production
 * Extracted from original_app.js
 */
define("game/strategy/ResearchCenter", [
    "game/strategy/helper/ResourceIntake",
    "game/strategy/helper/DelayedAction"
], function(ResourceIntake, DelayedAction) {
    
    var ResearchCenter = function(component, meta) {
        this.component = component;
        this.meta = meta;
        this.game = this.component.getFactory().getGame();
        this.productionBonus = 0;
        
        // Initialize resource intake manager (placeholder until extracted)
        this.inResourcesManager = this._createPlaceholderResourceIntake();
        
        // Initialize production timer (placeholder until extracted)
        this.producer = this._createPlaceholderDelayedAction();
        
        // Bind production methods
        this.producer.canStart = this.canProduce.bind(this);
        this.producer.start = this.startProduction.bind(this);
        this.producer.finished = this.finishProduction.bind(this);
    };
    
    ResearchCenter.prototype._createPlaceholderResourceIntake = function() {
        return {
            reset: function() { console.log("ResourceIntake reset"); },
            takeIn: function() { console.log("ResourceIntake takeIn"); },
            getResource: function(resourceId) { return 0; },
            addResource: function(resourceId, amount) { console.log("ResourceIntake addResource", resourceId, amount); },
            updateWithDescriptionData: function(data) { console.log("ResourceIntake updateWithDescriptionData"); }
        };
    };
    
    ResearchCenter.prototype._createPlaceholderDelayedAction = function() {
        return {
            reset: function() { console.log("DelayedAction reset"); },
            calculate: function(tick) { console.log("DelayedAction calculate", tick); },
            updateWithDescriptionData: function(data) { console.log("DelayedAction updateWithDescriptionData"); },
            toString: function() { return "DelayedAction"; }
        };
    };
    
    ResearchCenter.prototype.clearContents = function() {
        this.inResourcesManager.reset();
        this.producer.reset();
    };
    
    ResearchCenter.getMetaBonus = function(componentMeta, resourceId, factory) {
        var strategy = componentMeta.strategy;
        var resourceBonus = strategy.resources[resourceId].bonus;
        var upgradesManager = factory.getUpgradesManager();
        var componentBonuses = upgradesManager.getComponentBonuses(
            componentMeta.applyUpgradesFrom || componentMeta.id
        );
        var researchPaperBonus = componentBonuses.researchPaperBonus || 1;
        
        return resourceBonus * researchPaperBonus;
    };
    
    ResearchCenter.prototype.getBonus = function(resourceId) {
        return ResearchCenter.getMetaBonus(
            this.component.getMeta(), 
            resourceId, 
            this.component.getFactory()
        );
    };
    
    ResearchCenter.getResearchProduction = function(componentMeta, factory) {
        var strategy = componentMeta.strategy;
        var baseProduction = strategy.researchProduction;
        var game = factory.getGame();
        var multiplier = game.getResearchProductionMultiplier ? game.getResearchProductionMultiplier() : 1;
        
        return baseProduction * multiplier;
    };
    
    ResearchCenter.prototype.getResearchProduction = function() {
        return ResearchCenter.getResearchProduction(
            this.component.getMeta(), 
            this.component.getFactory()
        );
    };
    
    ResearchCenter.getMetaDescriptionData = function(componentMeta, factory, instance) {
        var strategy = componentMeta.strategy;
        var game = factory.getGame();
        var resourcesById = game.getMeta().resourcesById;
        var bonusStrings = [];
        
        // Build bonus strings for each resource
        for (var resourceId in strategy.resources) {
            var resource = resourcesById[resourceId];
            var resourceName = resource ? resource.name : resourceId;
            var bonus = ResearchCenter.getMetaBonus(componentMeta, resourceId, factory);
            
            bonusStrings.push(
                "<span class='" + resourceId + "'>" + 
                resourceName.toLowerCase() + ": <b>" + 
                (bonus || 0) + "</b></span>"
            );
        }
        
        var production = ResearchCenter.getResearchProduction(componentMeta, factory);
        
        return {
            interval: strategy.interval,
            bonusStr: bonusStrings.join(" "),
            productionStr: "<span class='research'><b>" + (production || 0) + "</b> research points</span>"
        };
    };
    
    ResearchCenter.prototype.getDescriptionData = function() {
        var data = ResearchCenter.getMetaDescriptionData(
            this.component.getMeta(), 
            this.component.getFactory(), 
            this
        );
        
        this.producer.updateWithDescriptionData(data);
        this.inResourcesManager.updateWithDescriptionData(data);
        
        return data;
    };
    
    ResearchCenter.prototype.calculateInputTick = function(tick) {
        this.inResourcesManager.takeIn();
        this.producer.calculate(tick);
    };
    
    ResearchCenter.prototype.canProduce = function() {
        return true;
    };
    
    ResearchCenter.prototype.startProduction = function() {
        var bonus = 1;
        
        // Calculate bonus from input resources
        for (var resourceId in this.meta.resources) {
            var resourceAmount = this.inResourcesManager.getResource(resourceId);
            var resourceBonus = this.getBonus(resourceId);
            
            bonus += resourceAmount * resourceBonus;
            
            // Consume the resources
            this.inResourcesManager.addResource(resourceId, -resourceAmount);
        }
        
        this.productionBonus = bonus;
    };
    
    ResearchCenter.prototype.finishProduction = function(factory) {
        var researchProduction = this.getResearchProduction();
        var totalProduction = researchProduction * this.productionBonus;
        
        factory.researchProduction += totalProduction;
    };
    
    ResearchCenter.prototype.toString = function() {
        var str = "";
        str += this.producer.toString();
        str += "<br />";
        return str;
    };
    
    ResearchCenter.prototype.exportToWriter = function(writer) {
        // TODO: Extract BinaryArrayWriter module
        // writer.writeUint32(this.productionBonus);
        // this.producer.exportToWriter(writer);
        console.log("ResearchCenter exportToWriter - BinaryArrayWriter not yet extracted");
    };
    
    ResearchCenter.prototype.importFromReader = function(reader, factory) {
        // TODO: Extract BinaryArrayReader module
        // this.noOfItems = reader.readUint32();
        // this.producer.importFromReader(reader, factory);
        console.log("ResearchCenter importFromReader - BinaryArrayReader not yet extracted");
    };
    
    return ResearchCenter;
});
