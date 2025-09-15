// ui/factory/MapToolsUi.js
import mapToolsTemplate from "../../template/factory/mapTools.html";
import Handlebars from "handlebars";

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

        this.container.html(Handlebars.compile(mapToolsTemplate)({ tools }));

        this.updateMapData();

        const em = this.factory.getEventManager();

        // Mouse move → show location
        em.addListener(EVENT_KEY, FactoryEvent.FACTORY_MOUSE_MOVE, e => {
            this.container.find(".location").html(`${e.x}:${e.y}`);
        });

        // Tile change → refresh map data
        em.addListener(EVENT_KEY, FactoryEvent.TILE_TYPE_CHANGED, () => {
            this.updateMapData();
        });

        // Tool selected → update UI
        em.addListener(EVENT_KEY, FactoryEvent.MAP_TOOL_SELECTED, toolId => {
            this.selectedToolId = toolId;
            this.container.find(".button").removeClass("buttonSelected");
            this.container.find(`.but${toolId || ""}`).addClass("buttonSelected");
        });

        // Component selected → clear tool selection
        em.addListener(EVENT_KEY, FactoryEvent.COMPONENT_META_SELECTED, () => {
            this.factory.getEventManager().invokeEvent(FactoryEvent.MAP_TOOL_SELECTED, null);
        });

        // Button click → set tool
        this.container.find(".button").on("click", e => {
            const toolId = e.target.getAttribute("data-id");
            em.invokeEvent(FactoryEvent.COMPONENT_META_SELECTED, null);
            em.invokeEvent(FactoryEvent.MAP_TOOL_SELECTED, toolId || null);
        });
    }

    updateMapData() {
        const tiles = this.factory.getTiles();
        const meta = this.factory.getMeta();

        const terrainLookup = {};
        for (const [key, value] of Object.entries(meta.terrains)) {
            terrainLookup[value] = key;
        }

        let terrainMap = "terrainMap: '";
        for (let i = 0; i < tiles.length; i++) {
            terrainMap += terrainLookup[tiles[i].getTerrain()];
            meta.tilesX; // (was in original, but looks like unused side effect)
        }
        terrainMap += "',\r\n";

        let buildMap = "buildMap: '";
        for (let i = 0; i < tiles.length; i++) {
            buildMap += tiles[i].getBuildableType();
            meta.tilesX;
        }
        buildMap += "',\r\n";

        this.container.find("#mapData").html(terrainMap + buildMap);
    }

    destroy() {
        this.factory.getEventManager().removeListenerForType(EVENT_KEY);
        if (this.container) {
            this.container.html("");
            this.container = null;
        }
    }
}
