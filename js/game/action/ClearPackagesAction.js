// ClearPackagesAction.js
import FactoryEvent from "../../config/event/FactoryEvent";
export default class ClearPackagesAction {
    constructor(factory) {
        this.factory = factory;
    }

    canClear() {
        return true;
    }

    clear() {
        const tiles = this.factory.getTiles();
        for (let tile of tiles) {
            const component = tile.getComponent();
            if (component) {
                component.getStrategy().clearContents();
            }
        }
        this.factory.getEventManager().invokeEvent(FactoryEvent.FACTORY_COMPONENTS_CHANGED, tiles);
    }
}
