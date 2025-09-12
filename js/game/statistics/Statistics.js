// Statistics.js
import StatisticsCollector from "./StatisticsCollector.js";
import GameEvent from "../../config/event/GameEvent.js";
import BinaryArrayWriter from "/js/base/BinaryArrayWriter.js";

export default class Statistics {
    game;
    gameCollector;
    factoryCollectors = {};

    constructor(game) {
        this.game = game;

        this.gameCollector = new StatisticsCollector({
            max_values_length: 80,
            sample_interval: 10,
            fields: ["profit", "researchProduction"]
        });

        for (const factory of this.game.getMeta().factories) {
            this.factoryCollectors[factory.id] = new StatisticsCollector({
                max_values_length: 80,
                sample_interval: 10,
                fields: ["profit", "researchProduction"]
            });
        }
    }

    init() {
        this.game.getEventManager().addListener("Statistics", GameEvent.GAME_TICK, (tickData) => {
            let data = { profit: tickData.profit, researchProduction: tickData.researchProduction };
            this.gameCollector.handleInput(data);

            for (const factory of this.game.getMeta().factories) {
                const result = tickData.factory_results[factory.id];
                if (result && !result.isPaused) {
                    data = { profit: result.profit, researchProduction: result.researchProduction };
                    this.factoryCollectors[factory.id].handleInput(data);
                }
            }
        });

        return this;
    }

    destroy() {
        this.game.getEventManager().removeListenerForType("Statistics");
    }

    reset() {
        this.gameCollector.reset();
        for (const collector of Object.values(this.factoryCollectors)) {
            collector.reset();
        }
    }

    getAvgProfit() {
        return this.gameCollector.getData().variables.profit.sample;
    }

    getAvgResearchPointsProduction() {
        return this.gameCollector.getData().variables.researchProduction.sample;
    }

    getFactoryAvgProfit(factoryId) {
        return this.factoryCollectors[factoryId]?.getData().variables.profit.sample;
    }

    getFactoryAvgResearchPointsProduction(factoryId) {
        return this.factoryCollectors[factoryId]?.getData().variables.researchProduction.sample;
    }

    exportToWriter() {
        return new BinaryArrayWriter();
    }

    importFromReader(reader, version) {
        // Implement as needed
    }
}
