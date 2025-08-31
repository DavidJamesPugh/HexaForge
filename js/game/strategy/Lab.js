/**
 * Lab Strategy - Laboratory research and development
 * Extracted from original_app.js
 */
define("game/strategy/Lab", [
    "game/strategy/helper/ResourceIntake",
    "game/strategy/helper/ResourceOutput",
    "game/strategy/helper/DelayedAction"
], function(ResourceIntake, ResourceOutput, DelayedAction) {
    
    var Lab = function(component, meta) {
        this.component = component;
        this.meta = meta;
        
        // Initialize resource intake manager (placeholder until extracted)
        this.inResourcesManager = this._createPlaceholderResourceIntake();
        
        // Initialize resource output manager (placeholder until extracted)
        this.outResourcesManager = this._createPlaceholderResourceOutput();
        
        this.productionBonus = 0;
        
        // Initialize production timer (placeholder until extracted)
        this.producer = this._createPlaceholderDelayedAction();
        
        // Bind production methods
        this.producer.canStart = this.canStartProduction.bind(this);
        this.producer.start = this.startProduction.bind(this);
        this.producer.finished = this.finishedProduction.bind(this);
    };
    
    Lab.prototype._createPlaceholderResourceIntake = function() {
        return {
            reset: function() { console.log("ResourceIntake reset"); },
            takeIn: function() { console.log("ResourceIntake takeIn"); },
            getResource: function(resourceId) { return 0; },
            addResource: function(resourceId, amount) { console.log("ResourceIntake addResource", resourceId, amount); },
            updateWithDescriptionData: function(data) { console.log("ResourceIntake updateWithDescriptionData"); }
        };
    };
    
    Lab.prototype._createPlaceholderResourceOutput = function() {
        return {
            reset: function() { console.log("ResourceOutput reset"); },
            distribute: function() { console.log("ResourceOutput distribute"); },
            getResource: function(resourceId) { return 0; },
            addResource: function(resourceId, amount) { console.log("ResourceOutput addResource", resourceId, amount); },
            getMax: function(resourceId) { return 1000; },
            updateWithDescriptionData: function(data) { console.log("ResourceOutput updateWithDescriptionData"); }
        };
    };
    
    Lab.prototype._createPlaceholderDelayedAction = function() {
        return {
            reset: function() { console.log("DelayedAction reset"); },
            calculate: function() { console.log("DelayedAction calculate"); },
            updateWithDescriptionData: function(data) { console.log("DelayedAction updateWithDescriptionData"); },
            toString: function() { return "DelayedAction"; }
        };
    };
    
    Lab.prototype.clearContents = function() {
        this.inResourcesManager.reset();
        this.outResourcesManager.reset();
        this.producer.reset();
    };
    
    Lab.getMetaDescriptionData = function(componentMeta, factory, instance) {
        var strategy = componentMeta.strategy;
        var game = factory.getGame();
        var resourcesById = game.getMeta().resourcesById;
        var inputStrings = [];
        var outputStrings = [];
        var storageStrings = [];
        var bonusStrings = [];
        var maxBonus = 0;
        
        // Build input resource strings
        for (var resourceId in strategy.inputResources) {
            var inputResource = strategy.inputResources[resourceId];
            var resource = resourcesById[resourceId];
            var resourceName = resource ? resource.nameShort : resourceId;
            
            inputStrings.push(
                "<span class='" + resourceId + "'><b>" + 
                inputResource.perOutputResource + "</b> " + 
                resourceName.toLowerCase() + "</span>"
            );
            
            storageStrings.push(
                "<span class='" + resourceId + "'>" + 
                resourceName.toLowerCase() + ": <b>" + 
                inputResource.max + "</b></span>"
            );
            
            bonusStrings.push(
                "<span class='" + resourceId + "'>" + 
                resourceName.toLowerCase() + ": <b>" + 
                inputResource.bonus + "</b></span>"
            );
            
            maxBonus += inputResource.bonus;
        }
        
        // Build output resource strings
        for (var resourceId in strategy.production) {
            if (Lab.isProducing(game, strategy, resourceId)) {
                var productionResource = strategy.production[resourceId];
                var resource = resourcesById[resourceId];
                var resourceName = resource ? resource.nameShort : resourceId;
                
                outputStrings.push(
                    "<span class='" + resourceId + "'><b>" + 
                    productionResource.amount + "</b> " + 
                    resourceName.toLowerCase() + "</span>"
                );
                
                storageStrings.push(
                    "<span class='" + resourceId + "'>" + 
                    resourceName.toLowerCase() + ": <b>" + 
                    productionResource.max + "</b></span>"
                );
            }
        }
        
        return {
            interval: strategy.interval,
            inputStr: inputStrings.join(" "),
            outputStr: outputStrings.join(" "),
            storageStr: storageStrings.join(" "),
            bonusStr: bonusStrings.join(" "),
            maxBonus: maxBonus
        };
    };
    
    Lab.isProducing = function(game, strategy, resourceId) {
        if (!strategy.productionRemoveResearch) {
            return true;
        }
        
        var removeResearch = strategy.productionRemoveResearch[resourceId];
        if (!removeResearch) {
            return true;
        }
        
        var researchManager = game.getResearchManager();
        if (!researchManager) {
            return true;
        }
        
        var research = researchManager.getResearch(removeResearch);
        return !research;
    };
    
    Lab.prototype.getDescriptionData = function() {
        var data = Lab.getMetaDescriptionData(
            this.component.getMeta(), 
            this.component.getFactory(), 
            this
        );
        
        this.producer.updateWithDescriptionData(data);
        this.inResourcesManager.updateWithDescriptionData(data);
        this.outResourcesManager.updateWithDescriptionData(data);
        
        return data;
    };
    
    Lab.prototype.calculateInputTick = function() {
        this.inResourcesManager.takeIn();
    };
    
    Lab.prototype.calculateOutputTick = function() {
        this.producer.calculate();
        this.outResourcesManager.distribute();
    };
    
    Lab.prototype.canStartProduction = function() {
        // Check if output storage can accommodate production
        for (var resourceId in this.meta.production) {
            var currentAmount = this.outResourcesManager.getResource(resourceId);
            var productionAmount = this.meta.production[resourceId].amount;
            var maxStorage = this.outResourcesManager.getMax(resourceId);
            
            if (currentAmount + productionAmount > maxStorage) {
                return false;
            }
        }
        
        return true;
    };
    
    Lab.prototype.startProduction = function() {
        var bonus = 1;
        
        // Consume input resources and calculate bonus
        for (var resourceId in this.meta.inputResources) {
            var inputResource = this.meta.inputResources[resourceId];
            var currentAmount = this.inResourcesManager.getResource(resourceId);
            var requiredAmount = inputResource.perOutputResource;
            
            if (currentAmount >= requiredAmount) {
                this.inResourcesManager.addResource(resourceId, -requiredAmount);
                bonus += inputResource.bonus;
            }
        }
        
        this.productionBonus = bonus;
    };
    
    Lab.prototype.finishedProduction = function() {
        var game = this.component.getFactory().getGame();
        
        // Produce output resources
        for (var resourceId in this.meta.production) {
            if (Lab.isProducing(game, this.meta, resourceId)) {
                var productionResource = this.meta.production[resourceId];
                var amount = productionResource.amount * this.productionBonus;
                
                this.outResourcesManager.addResource(resourceId, amount);
            }
        }
    };
    
    Lab.prototype.toString = function() {
        var str = "";
        str += this.inResourcesManager.toString() + "<br />";
        str += this.outResourcesManager.toString() + "<br />";
        str += this.producer.toString() + "<br />";
        return str;
    };
    
    Lab.prototype.exportToWriter = function(writer) {
        // TODO: Extract BinaryArrayWriter module
        // writer.writeUint32(this.productionBonus);
        // this.outResourcesManager.exportToWriter(writer);
        // this.inResourcesManager.exportToWriter(writer);
        // this.producer.exportToWriter(writer);
        console.log("Lab exportToWriter - BinaryArrayWriter not yet extracted");
    };
    
    Lab.prototype.importFromReader = function(reader, factory) {
        // TODO: Extract BinaryArrayReader module
        // this.noOfItems = reader.readUint32();
        // this.outResourcesManager.importFromReader(reader, factory);
        // this.inResourcesManager.importFromReader(reader, factory);
        // this.producer.importFromReader(reader, factory);
        console.log("Lab importFromReader - BinaryArrayReader not yet extracted");
    };
    
    return Lab;
});
