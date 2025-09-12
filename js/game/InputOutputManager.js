import BinaryBoolean from "/js/base/BinaryBoolean.js";
// InputOutputManager.js
const OPPOSITE = { top: "bottom", bottom: "top", left: "right", right: "left" };
const DIRECTIONS = ["top", "right", "bottom", "left"];

export default class InputOutputManager {
    tile;
    changedCallback;
    inputsByDirection = {};
    outputsByDirection = {};
    inputsList = [];
    outputsList = [];

    constructor(tile, changedCallback) {
        this.tile = tile;
        this.changedCallback = changedCallback;

        DIRECTIONS.forEach(dir => {
            this.inputsByDirection[dir] = null;
            this.outputsByDirection[dir] = null;
        });

        this.reset();
    }

    reset() {
        DIRECTIONS.forEach(dir => {
            this.clearInput(dir);
            this.clearOutput(dir);
        });
    }

    setInput(direction) {
        if (!this.inputsByDirection[direction]) {
            this.clearOutput(direction);

            const neighbor = this.tile.getTileInDirection(direction);
            if (!neighbor) return;

            this.inputsByDirection[direction] = neighbor;
            this._updateInputOutputLists();
            neighbor.getInputOutputManager().setOutput(OPPOSITE[direction]);
            this.changedCallback();
        }
    }

    setOutput(direction) {
        if (!this.outputsByDirection[direction]) {
            this.clearInput(direction);

            const neighbor = this.tile.getTileInDirection(direction);
            if (!neighbor) return;

            this.outputsByDirection[direction] = neighbor;
            this._updateInputOutputLists();
            neighbor.getInputOutputManager().setInput(OPPOSITE[direction]);
            this.changedCallback();
        }
    }

    clearInput(direction) {
        const neighbor = this.inputsByDirection[direction];
        if (neighbor) {
            this.inputsByDirection[direction] = null;
            neighbor.getInputOutputManager().clearOutput(OPPOSITE[direction]);
            this._updateInputOutputLists();
            this.changedCallback();
        }
    }

    clearOutput(direction) {
        const neighbor = this.outputsByDirection[direction];
        if (neighbor) {
            this.outputsByDirection[direction] = null;
            neighbor.getInputOutputManager().clearInput(OPPOSITE[direction]);
            this._updateInputOutputLists();
            this.changedCallback();
        }
    }

    _updateInputOutputLists() {
        this.inputsList = DIRECTIONS.map(dir => this.inputsByDirection[dir]).filter(Boolean);
        this.outputsList = DIRECTIONS.map(dir => this.outputsByDirection[dir]).filter(Boolean);
    }

    getInputsList() {
        return this.inputsList;
    }

    getInputsByDirection() {
        return this.inputsByDirection;
    }

    getOutputsList() {
        return this.outputsList;
    }

    getOutputsByDirection() {
        return this.outputsByDirection;
    }

    exportToWriter(writer) {
        const binary = new BinaryBoolean();
        binary.writeAll(
            this.inputsByDirection.top,
            this.inputsByDirection.right,
            this.inputsByDirection.bottom,
            this.inputsByDirection.left,
            this.outputsByDirection.top,
            this.outputsByDirection.right,
            this.outputsByDirection.bottom,
            this.outputsByDirection.left
        );
        writer.writeBooleanMap(binary);
    }

    importFromReader(reader) {
        const binary = reader.readBooleanMap();
        if (binary.readBoolean()) this.setInput("top");
        if (binary.readBoolean()) this.setInput("right");
        if (binary.readBoolean()) this.setInput("bottom");
        if (binary.readBoolean()) this.setInput("left");
        if (binary.readBoolean()) this.setOutput("top");
        if (binary.readBoolean()) this.setOutput("right");
        if (binary.readBoolean()) this.setOutput("bottom");
        if (binary.readBoolean()) this.setOutput("left");
    }
}
