// game/action/UpdateSorterSortingResource.js
export class UpdateSorterSortingResource {
    constructor(component, offsetX, offsetY, resource) {
        this.component = component;
        this.factory = component.getFactory();
        this.offsetX = offsetX;
        this.offsetY = offsetY;
        this.resource = resource;
    }

    canUpdate() {
        return this.component.getMeta().strategy.type === "sorter";
    }

    update() {
        this.component.getStrategy().setSortingResource(this.offsetX, this.offsetY, this.resource);
        this.factory.getEventManager().invokeEvent(FactoryEvent.FACTORY_COMPONENTS_CHANGED, this.tile);
        this.factory.getEventManager().invokeEvent(FactoryEvent.REFRESH_COMPONENT_INFO);
    }
}
