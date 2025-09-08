define("ui/factory/mapLayers/helper/MouseInfoHelper", ["game/action/BuyComponentAction", "ui/helper/TipUi"], function(BuyComponentAction, TipUi) {
    var MouseInfoHelper = function(factory, imageMap, tileSize) {
        this.factory = factory;
        this.game = factory.getGame();
        this.imageMap = imageMap;
        this.tileSize = tileSize;
        this.lastTip = null;
    };

    MouseInfoHelper.prototype.display = function(container) {
        this.container = container;
    };

    MouseInfoHelper.prototype.destroy = function() {
        this.container = null;
    };

    MouseInfoHelper.prototype.updateMouseInformationModes = function(componentId, mousePosition) {
        if (!mousePosition || !componentId) {
            this.turnOffBuildMode();
            this.turnOffCantBuildMode();
            this.turnOffNotEnoughMoneyTip();
            return;
        }

        var componentMetadata = this.game.getMeta().componentsById[componentId];
        var canBuildOnTerrain = this.factory.isPossibleToBuildOnTypeWithSize(mousePosition.x, mousePosition.y, componentMetadata.width, componentMetadata.height, componentMetadata);
        var canBuildInArea = this.factory.getAreasManager().canBuildAt(mousePosition.x, mousePosition.y, componentMetadata.width, componentMetadata.height);
        var isOutsideMap = !this.factory.isOnMap(mousePosition.x, mousePosition.y, componentMetadata.width, componentMetadata.height);
        var targetTile = this.factory.getTile(mousePosition.x, mousePosition.y);
        var buyAction = new BuyComponentAction(targetTile, componentMetadata);

        if (isOutsideMap) {
            this.turnOffBuildMode();
        } else {
            this.updateBuildMode(componentId, mousePosition);
        }

        if ((canBuildOnTerrain && canBuildInArea) || isOutsideMap) {
            if (buyAction.canBuy()) {
                this.turnOffCantBuildMode();
                this.turnOffNotEnoughMoneyTip();
            } else {
                this.updateCantBuildMode(componentId, mousePosition);
                this.updateNotEnoughMoneyTip();
            }
        } else {
            this.updateCantBuildMode(componentId, mousePosition);
        }
    };

    MouseInfoHelper.prototype.updateComponentSelected = function(component) {
        if (!component) {
            this.turnOffComponentSelected();
            return;
        }

        var componentMetadata = component.getMeta();

        if (!this.componentSelectedElement) {
            this.componentSelectedElement = $(this.imageMap.getImage("blueSelection"));
            this.container.append(this.componentSelectedElement);
        }

        this.componentSelectedElement
            .css("position", "absolute")
            .css("opacity", 0.5)
            .css("pointer-events", "none")
            .css("left", component.getX() * this.tileSize)
            .css("top", component.getY() * this.tileSize)
            .css("width", this.tileSize * componentMetadata.width)
            .css("height", this.tileSize * componentMetadata.height);
    };

    MouseInfoHelper.prototype.turnOffComponentSelected = function() {
        if (this.componentSelectedElement) {
            this.componentSelectedElement.remove();
            this.componentSelectedElement = null;
        }
    };

    MouseInfoHelper.prototype.updateBuildMode = function(componentId, mousePosition) {
        var componentMetadata = this.game.getMeta().componentsById[componentId];

        if (!this.mouseSelectionElement) {
            this.mouseSelectionElement = $(this.imageMap.getImage("yellowSelection"));
            this.container.append(this.mouseSelectionElement);
        }

        this.mouseSelectionElement
            .css("position", "absolute")
            .css("opacity", 0.5)
            .css("pointer-events", "none")
            .css("left", mousePosition.x * this.tileSize)
            .css("top", mousePosition.y * this.tileSize)
            .css("width", this.tileSize * componentMetadata.width)
            .css("height", this.tileSize * componentMetadata.height);
    };

    MouseInfoHelper.prototype.turnOffBuildMode = function() {
        if (this.mouseSelectionElement) {
            this.mouseSelectionElement.remove();
            this.mouseSelectionElement = null;
        }
    };

    MouseInfoHelper.prototype.updateCantBuildMode = function(componentId, mousePosition) {
        var componentMetadata = this.game.getMeta().componentsById[componentId];

        if (!this.cantPlaceElement) {
            this.cantPlaceElement = $(this.imageMap.getImage("cantPlace"));
            this.container.append(this.cantPlaceElement);
        }

        this.cantPlaceElement
            .css("position", "absolute")
            .css("opacity", 0.5)
            .css("pointer-events", "none")
            .css("left", mousePosition.x * this.tileSize)
            .css("top", mousePosition.y * this.tileSize)
            .css("width", this.tileSize * componentMetadata.width)
            .css("height", this.tileSize * componentMetadata.height);
    };

    MouseInfoHelper.prototype.turnOffCantBuildMode = function() {
        if (this.cantPlaceElement) {
            this.cantPlaceElement.remove();
            this.cantPlaceElement = null;
        }
    };

    MouseInfoHelper.prototype.updateNotEnoughMoneyTip = function() {
        if (!this.lastTip) {
            this.lastTip = new TipUi(this.container, '<span class="red">You don\'t have enough money!</span>').init();
            $("body").css("cursor", "no-drop");
        }
    };

    MouseInfoHelper.prototype.turnOffNotEnoughMoneyTip = function() {
        if (this.lastTip) {
            this.lastTip.destroy();
            this.lastTip = null;
            $("body").css("cursor", "");
        }
    };

    return MouseInfoHelper;
});
