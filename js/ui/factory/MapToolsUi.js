// ui/factory/MapToolsUi.js
import mapToolsTemplate from "../../template/factory/mapTools.html?raw";
import Handlebars from "handlebars";
import FactoryEvent from "/js/config/event/FactoryEvent.js"

const EVENT_KEY = "factoryMapToolsUi";

export default class MapToolsUi {
    constructor(factory) {
        this.factory = factory;
        this.game = factory.getGame();
        this.selectedToolId = null;
        this.container = null;
    }

    display(container) {
        this.container = container;
        // Build tool list
        const tools = [
            { id: "buildable-road", name: "Partial buildable area", showBreak: false },
            ...Object.values(this.factory.getMeta().terrains).map(terrain => ({
                id: `terrain-${terrain}`,
                name: terrain,
                showBreak: false
            }))
        ];

        this.container.insertAdjacentHTML("beforeend", Handlebars.compile(mapToolsTemplate)({ tools }));

        this.locationElement = this.container.querySelector(".location");
        this.mapDataElement = this.container.querySelector("#mapData");
        this.buttons = this.container.querySelectorAll(".button");
        
        this.updateMapData();

        const em = this.factory.getEventManager();

        // Mouse move → show location
        em.addListener(EVENT_KEY, FactoryEvent.FACTORY_MOUSE_MOVE, e => {
            if (this.locationElement) {
                this.locationElement.textContent = `${e.x}:${e.y}`;
            }
        });

        // Tile change → refresh map data
        em.addListener(EVENT_KEY, FactoryEvent.TILE_TYPE_CHANGED, () => {
            this.updateMapData();
        });

        // Tool selected → update UI
        em.addListener(EVENT_KEY, FactoryEvent.MAP_TOOL_SELECTED, toolId => {
            this.selectedToolId = toolId;
            this.buttons.forEach(element => {
                element.classList.toggle("buttonSelected", element.dataset.id === toolId);
            });
        });

        // Component selected → clear tool selection
        em.addListener(EVENT_KEY, FactoryEvent.COMPONENT_META_SELECTED, () => {
            this.factory.getEventManager().invokeEvent(FactoryEvent.MAP_TOOL_SELECTED, null);
        });

        // Button click → set tool
        this.buttons.forEach(button => {
            button.addEventListener("pointerdown", e => {
                const toolId = e.target.dataset.id;
                
                em.invokeEvent(FactoryEvent.COMPONENT_META_SELECTED, null);
                em.invokeEvent(FactoryEvent.MAP_TOOL_SELECTED, toolId ?? null);
            });
        });
    }

    updateMapData() {
        const { tiles } = this.factory;
        const { terrains } = this.factory.getMeta();
    
        const terrainLookup = Object.fromEntries(
          Object.entries(terrains).map(([k, v]) => [v, k])
        );

        const terrainMap = "terrainMap: '" + 
            tiles.map(tile => terrainLookup[tile.getTerrain()]).join("") + 
            "',\r\n";

        const buildMap = "buildMap: '" + 
            tiles.map(tile => tile.getBuildableType()).join("") + 
            "',\r\n";


        this.mapDataElement && (this.mapDataElement.textContent = terrainMap + buildMap);

    }

    destroy() {
        this.factory.getEventManager().removeListenerForType(EVENT_KEY);
        if (this.container) {
            this.container.innerHTML = "";
            this.container = null;
        }
        this.buttons.forEach(button => {
            button.replaceWith(button.cloneNode(true));
        });
    }
}
