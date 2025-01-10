import { ONE_SECOND } from '@app/consts/timer.consts';
import { Service } from 'typedi';

@Service({ transient: true })
export class TimerService {
    private intervalId: ReturnType<typeof setInterval>;

    private tickValue: number;
    private isPaused: boolean;
    private tickDelay: number;

    private specificCallback: Map<number, () => void> = new Map();

    constructor() {
        this.initialize();
    }

    togglePause() {
        this.isPaused = !this.isPaused;

        if (!this.isPaused) this.setInterval();
        else clearInterval(this.intervalId);
    }

    updateDelay(newTickDelay: number) {
        this.isPaused = false;
        this.tickDelay = newTickDelay;
        clearInterval(this.intervalId);
        this.setInterval();
    }

    setSpecificCallback(timerValue: number, callback: () => void) {
        this.specificCallback.set(timerValue, callback);
    }

    clearSpecificCallback() {
        this.specificCallback = new Map();
    }

    setOnTickCallBack(callback: (tickValue: number) => void) {
        this.onTick = callback;
        return this;
    }

    setOnTimerEndedCallback(callback: () => void) {
        this.onTimerEnded = callback;
        return this;
    }

    setStopCondition(callback: () => boolean) {
        this.shouldStopTimer = callback;
        return this;
    }

    resetStopCondition() {
        this.shouldStopTimer = () => false;
        return this;
    }

    startTimer(time: number) {
        this.tickValue = time;
        this.specificCallback.get(this.tickValue)?.();

        this.reset();
        this.setInterval();
        this.onTick(this.tickValue);
    }

    stopTimer() {
        clearInterval(this.intervalId);
    }

    private setInterval() {
        this.intervalId = setInterval(() => this.tick(), this.tickDelay);
    }

    private initialize() {
        this.reset();
        this.specificCallback = new Map();
    }

    private reset() {
        this.isPaused = false;
        this.tickDelay = ONE_SECOND;
    }

    private tick() {
        if (this.isPaused) return;

        this.onTick(--this.tickValue);
        this.specificCallback.get(this.tickValue)?.();

        if (this.tickValue && !this.shouldStopTimer()) return;

        this.stopTimer();
        this.onTimerEnded();
    }

    private onTick: (tickValue: number) => void = () => {
        // Default implementation is empty
    };

    private onTimerEnded: () => void = () => {
        // Default implementation is empty
    };

    private shouldStopTimer: () => boolean = () => false;
}
