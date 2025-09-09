define("config/main/helper/ProductionCostCalculator", [], function () {
    var e = {
            getSumOfProduction: function (e) {
                var t = 0;
                for (var n in e) "waste" == n || e[n].bonus || (t += e[n].amount);
                return t;
            },
        },
        t = function (t, n) {
            (this.componentsById = t),
                (this.sourceBuildings = n),
                (this.strategies = {
                    buyer: {
                        selfCost: function (t, n) {
                            return (t.strategy.interval * t.runningCostPerTick) / e.getSumOfProduction(t.strategy.purchaseResources) + t.strategy.purchaseResources[n].price;
                        },
                        inputCost: function (e, t) {
                            return 1;
                        },
                    },
                    converter: {
                        selfCost: function (t) {
                            return (t.strategy.interval * t.runningCostPerTick) / e.getSumOfProduction(t.strategy.production);
                        },
                        inputCost: function (t, n) {
                            var i = e.getSumOfProduction(t.strategy.production);
                            if (!t.strategy.inputResources[n]) throw new Error(t.id + " can't handle resources: " + n);
                            return t.strategy.inputResources[n].perOutputResource / i;
                        },
                    },
                    seller: {
                        selfCost: function (t) {
                            return (t.strategy.interval * t.runningCostPerTick) / e.getSumOfProduction(t.strategy.resources);
                        },
                        inputCost: function (e, t) {
                            return 1;
                        },
                    },
                });
        };
    return (
        (t.prototype.calculateCostFor = function (e, t, n) {
            var i = this.componentsById[e],
                r = this.sourceBuildings[e];
            r || (r = []);
            var o = this.strategies[i.strategy.type],
                s = 0,
                a = o.selfCost(i, t);
            if ("seller" == i.strategy.type) (s += this.calculateCostFor(r[t], t, n)), i.strategy.resources[t].bonus && (a = 0);
            else for (var u in r) s += this.calculateCostFor(r[u], u, n) * o.inputCost(i, u);
            var c = a + s;
            return (n[e + "-" + t] = { self: a, input: s, total: c }), c;
        }),
        t
    );
});