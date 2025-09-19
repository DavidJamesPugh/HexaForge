// ui/factory/componentUi/Sorter.js
import sorterTemplate from "../../../template/factory/component/sorter.html";
import { UpdateSorterSortingResource } from "../../../game/action/UpdateSorterSortingResource.js";

export default class SorterUi {
    constructor(component) {
        this.component = component;
        this.strategy = component.getStrategy();
        this.container = null;
    }

    display(container) {
        this.container = container;
        const resources = [
            { id: null, name: "all other" },
            ...this.component.getFactory().getGame().getMeta().resources.map(r => ({
                id: r.id,
                name: r.name
            }))
        ];

        const sortingIndex = this.strategy.getSortingIndex();
        const locations = Object.keys(sortingIndex).map(key => ({
            id: key,
            name: key,
            resources,
            selected: sortingIndex[key]
        }));

        this.container.html(Handlebars.compile(sorterTemplate)({ locations }));

        // Event binding
        this.container.find("select").each((_, selectEl) => {
            const [x, y] = selectEl.getAttribute("data-id").split(":");
            selectEl.value = this.strategy.getSortingResource(x, y);

            selectEl.addEventListener("change", e => {
                const [offsetX, offsetY] = e.target.getAttribute("data-id").split(":");
                const resource = e.target.value;
                const action = new UpdateSorterSortingResource(this.component, offsetX, offsetY, resource);
                if (action.canUpdate()) {
                    action.update();
                }
            });
        });
    }

    destroy() {
        this.container.innerHTML = "";
        this.container = null;
    }
}
