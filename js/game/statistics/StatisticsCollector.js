// StatisticsCollector.js
export default class StatisticsCollector {
    config;
    data;

    constructor(config) {
        this.config = config;
        this.reset();
    }

    getData() {
        return this.data;
    }

    _buildDataStructure(config) {
        const data = {
            variables: {},
            sampleCounter: 0,
        };

        for (const field of config.fields) {
            data.variables[field] = { sum: 0, values: [], sample: null };
        }

        if (config.child) {
            data.addToChildCounter = 0;
            data.child = this._buildDataStructure(config.child);
        }

        return data;
    }

    reset() {
        this.data = this._buildDataStructure(this.config);
    }

    handleInput(input) {
        this._handleCollector(this.config, this.data, input);
    }

    _handleCollector(config, data, input) {
        data.sampleCounter++;

        const averages = {};

        for (const field of config.fields) {
            const variable = data.variables[field];
            variable.sum += input[field];

            // Maintain max values length
            if (variable.values.length >= config.max_values_length) {
                variable.sum -= variable.values.shift();
            }

            variable.values.push(input[field]);

            const avg = variable.sum / variable.values.length;
            averages[field] = avg;

            if (data.sampleCounter >= config.sample_interval) {
                variable.sample = avg;
            }
        }

        if (data.sampleCounter >= config.sample_interval) {
            data.sampleCounter = 0;
        }

        if (config.child && config.add_to_child_interval) {
            data.addToChildCounter++;
            if (data.addToChildCounter >= config.add_to_child_interval) {
                data.addToChildCounter = 0;
                this._handleCollector(config.child, data.child, averages);
            }
        }
    }
}
