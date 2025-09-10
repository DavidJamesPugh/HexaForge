// Ticker.js
import Benchmarker from "../base/Benchmarker.js";

export default class Ticker {
    game;
    confirmedTimestamp;
    ticks = 0;
    bonusTicks = 0;
    purchaseBonusTicks = 0;
    timeTravelTickets = 1;
    focused = true;
    isPlaying = false;
    isFastActive = false;
    interval = null;
    noOfTicks = 0;
    lastSaveTimestamp = null;
    benchmarker;
    backgroundModeTimeout = null;
    actualTicksPerSec = { ticks: 0, second: 0, actual: 0 };

    constructor(game, confirmedTimestamp) {
        this.game = game;
        this.confirmedTimestamp = confirmedTimestamp;
        this.benchmarker = new Benchmarker(game.getMeta()?.id);
    }

    init() {
        this.start();

        this.game.getEventManager().addListener("Ticker", GameEvent.FOCUS, () => this.disableBackgroundMode());
        this.game.getEventManager().addListener("Ticker", GameEvent.BLUR, () => this.startBackgroundModeTimer());
        this.game.getEventManager().addListener("Ticker", GameEvent.RESEARCH_BOUGHT, () => this.updateInterval());

        logger.info("Ticker", `Ticker initialized for game ${this.game.getMeta()?.id}`);
        this.benchmarker.init();
        return this;
    }

    startBackgroundModeTimer() {
        if (this.backgroundModeTimeout) clearTimeout(this.backgroundModeTimeout);

        this.backgroundModeTimeout = setTimeout(() => {
            const wasFocused = this.focused;
            this.focused = false;
            if (wasFocused) this.updateInterval();
            this.game.getEventManager().invokeEvent(GameEvent.BACKGROUND_MODE_ACTIVATED);
        }, 15000);
    }

    disableBackgroundMode() {
        if (this.backgroundModeTimeout) clearTimeout(this.backgroundModeTimeout);
        const wasNotFocused = !this.focused;
        this.focused = true;
        if (wasNotFocused) this.updateInterval();
        this.game.getEventManager().invokeEvent(GameEvent.BACKGROUND_MODE_DISABLED);
    }

    destroy() {
        this.stop();
        this.game.getEventManager().removeListenerForType("Ticker");
        this.benchmarker.destroy();
    }

    // Bonus ticks
    getBonusTicks() { return this.bonusTicks; }
    addBonusTicks(amount) { this.bonusTicks = Math.round(this.bonusTicks + amount); this.game.getEventManager().invokeEvent(GameEvent.BONUS_TICKS_UPDATED); }
    setBonusTicks(amount) { this.bonusTicks = amount; this.game.getEventManager().invokeEvent(GameEvent.BONUS_TICKS_UPDATED); }
    setPurchaseBonusTicks(amount) { this.purchaseBonusTicks = amount; this.updateInterval(); }

    // Time travel tickets
    getTimeTravelTickets() { return this.timeTravelTickets; }
    addTimeTravelTickets(amount) { this.timeTravelTickets = Math.round(this.timeTravelTickets + amount); this.game.getEventManager().invokeEvent(GameEvent.TIME_TRAVEL_TICKETS_UPDATED); }
    setTimeTravelTickets(amount) { this.timeTravelTickets = amount; this.game.getEventManager().invokeEvent(GameEvent.TIME_TRAVEL_TICKETS_UPDATED); }

    // Status getters
    getLastSaveTimestamp() { return this.lastSaveTimestamp; }
    getIsPlaying() { return this.isPlaying; }
    getIsFastActive() { return this.isFastActive; }
    getIsFocused() { return this.focused; }
    getNoOfTicks() { return this.noOfTicks; }
    addNoOfTicks(amount) { this.noOfTicks += amount; }

    // Tick calculations
    getNormalTicksPerSec() {
        return 4 + this.game.getResearchManager().getResearch("chronometer") + this.purchaseBonusTicks;
    }

    getTicksPerSec() {
        return this.isFastActive ? 200 : this.getNormalTicksPerSec();
    }

    getActualTicksPerSec() { return this.actualTicksPerSec.actual; }

    getTickData() {
        let runs = 1;
        let ticksPerSec = this.getTicksPerSec();
        if (!this.focused) {
            runs = ticksPerSec;
            ticksPerSec = 1;
        }
        return { runs, ticksPerSec };
    }

    updateInterval() {
        if (this.interval) clearInterval(this.interval);
        this.interval = null;

        if (!this.isPlaying) return;

        const { runs, ticksPerSec } = this.getTickData();
        this.interval = setInterval(() => {
            this.benchmarker.start();
            for (let i = 0; i < runs; i++) this.tick();
            this.benchmarker.stop(runs);
        }, Math.round(1000 / ticksPerSec));

        this.game.getEventManager().invokeEvent(GameEvent.TICKS_STARTED);
    }

    start() { this.isPlaying = true; this.updateInterval(); }
    stop() {
        this.isPlaying = false;
        this.isFastActive = false;
        if (this.interval) clearInterval(this.interval);
        this.interval = null;
        this.game.getEventManager().invokeEvent(GameEvent.TICKS_STOPPED);
    }

    startFast() { if (this.bonusTicks > 0) { this.isPlaying = true; this.isFastActive = true; this.updateInterval(); } }
    stopFast() { this.isFastActive = false; this.updateInterval(); }

    calculateOfflineGains() {
        const meta = this.game.getMeta();
        if (!this.lastSaveTimestamp || !meta.maxBonusTicks) return 0;

        let offlineTicks = (this.confirmedTimestamp.getConfirmedNow() - this.lastSaveTimestamp) * this.getNormalTicksPerSec();
        offlineTicks = Math.round(offlineTicks / meta.offlineSlower);

        const maxTicks = meta.maxBonusTicks * this.getNormalTicksPerSec();
        if (offlineTicks > maxTicks) offlineTicks = maxTicks;
        if (offlineTicks < meta.minBonusTicks) offlineTicks = 0;

        return offlineTicks;
    }

    addOfflineGains() {
        const gains = this.calculateOfflineGains();
        logger.info("Ticker", `Bonus ticks gained: ${gains}`);
        this.addBonusTicks(gains);
    }

    tick() {
        const calc = this.game.getCalculator().calculate();
        this.game.getEventManager().invokeEvent(GameEvent.GAME_TICK, calc);

        this.noOfTicks++;
        if (this.noOfTicks % 5 === 0) this.game.getAchievementsManager().testAll();

        if (this.isFastActive) {
            this.addBonusTicks(-1);
            if (this.bonusTicks <= 0) {
                this.isFastActive = false;
                this.updateInterval();
            }
        }

        const nowSec = Math.floor(Date.now() / 1000);
        this.actualTicksPerSec.ticks++;
        if (nowSec !== this.actualTicksPerSec.second) {
            this.actualTicksPerSec.actual = this.actualTicksPerSec.ticks;
            this.actualTicksPerSec.ticks = 0;
            this.actualTicksPerSec.second = nowSec;
        }
    }

    exportToWriter() {
        const writer = new BinaryArrayWriter();
        writer.writeUint32(this.bonusTicks);
        writer.writeUint16(this.timeTravelTickets);
        writer.writeUint32(this.noOfTicks);
        writer.writeUint32(this.confirmedTimestamp.getConfirmedNow());
        return writer;
    }

    importFromReader(reader, version) {
        this.setBonusTicks(reader.readUint32());
        if (version >= 5) this.timeTravelTickets = reader.readUint16();
        this.noOfTicks = reader.readUint32();
        this.lastSaveTimestamp = reader.readUint32();
    }
}
