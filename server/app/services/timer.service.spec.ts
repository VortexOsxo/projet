import { expect } from 'chai';
import { TimerService } from './timer.service';
import { SinonFakeTimers, useFakeTimers, SinonSpy, spy, stub } from 'sinon';

const ONE_SECOND = 1000;

interface TimerServiceAcessPrivate {
    onTick: (tickValue: number) => void;
    onTimerEnded: () => void;
}

describe('TimerService', () => {
    let timerService: TimerService;
    let clock: SinonFakeTimers;
    let clearIntervalSpy: SinonSpy;

    const mockTime = 5;

    beforeEach(() => {
        timerService = new TimerService();
        clock = useFakeTimers();
        clearIntervalSpy = spy(global, 'clearInterval');
    });

    afterEach(() => {
        clock.restore();
        clearIntervalSpy.restore();
    });

    it('should be created', () => {
        expect(timerService).to.be.an.instanceOf(TimerService);
    });

    describe('should be able to properly set callback', () => {
        it('onTick callback', () => {
            const fakeCallback = stub();

            timerService.setOnTickCallBack(fakeCallback);

            expect(timerService['onTick']).to.equal(fakeCallback);
        });

        it('onTimerEnded callback', () => {
            const fakeCallback = stub();

            timerService.setOnTimerEndedCallback(fakeCallback);

            expect(timerService['onTimerEnded']).to.equal(fakeCallback);
        });
    });

    it('should execute onTick callback every second', () => {
        const onTickMock = stub();
        timerService.setOnTickCallBack(onTickMock);
        timerService.startTimer(mockTime);

        clock.tick(ONE_SECOND);
        expect(onTickMock.calledWith(mockTime - 1));

        clock.tick(ONE_SECOND);
        expect(onTickMock.calledWith(mockTime - 2));

        timerService.stopTimer();
    });

    it('should execute onTimerEnded callback when timer reaches 0', () => {
        const onTimerEndedMock = stub();
        timerService.setOnTimerEndedCallback(onTimerEndedMock);
        timerService.startTimer(mockTime);

        clock.tick(mockTime * ONE_SECOND);
        expect(onTimerEndedMock.called);

        timerService.stopTimer();
    });

    it('should use default empty callback if none have been set', () => {
        const onTickSpy = spy(timerService as unknown as TimerServiceAcessPrivate, 'onTick');
        const onTimerEndedSpy = spy(timerService as unknown as TimerServiceAcessPrivate, 'onTimerEnded');

        timerService.startTimer(mockTime);

        clock.tick(mockTime * ONE_SECOND);

        timerService.stopTimer();

        expect(onTickSpy.callCount).to.equal(mockTime + 1);
        expect(onTimerEndedSpy.calledOnce);
    });

    it('should stop the timer', () => {
        timerService.startTimer(mockTime);

        timerService.stopTimer();

        expect(clearIntervalSpy.calledOnceWithExactly(timerService['intervalId'])).to.equal(true);
    });

    it('should set the stop condition callback properly', () => {
        const fakeCallback = stub().returns(true);

        timerService.setStopCondition(fakeCallback);

        expect(timerService['shouldStopTimer']).to.equal(fakeCallback);
    });

    it('should reset the stop condition callback properly', () => {
        const initialCallback = stub().returns(true);
        timerService.setStopCondition(initialCallback);

        expect(timerService['shouldStopTimer']).to.equal(initialCallback);

        timerService.resetStopCondition();

        expect(timerService['shouldStopTimer']()).to.equal(false);
    });

    it('should be able to set specific callbacks', () => {
        const timerValue1 = 5;
        const timerValue2 = 10;

        const callback1 = spy();
        const callback2 = spy();
        timerService.setSpecificCallback(timerValue1, callback1);
        timerService.setSpecificCallback(timerValue2, callback2);

        timerService.startTimer(timerValue1);
        clock.tick(timerValue1 * ONE_SECOND);
        expect(callback1.calledOnce).to.equal(true);
        expect(callback2.called).to.equal(false);

        timerService.setSpecificCallback(timerValue1, callback1);
        timerService.setSpecificCallback(timerValue2, callback2);

        timerService.clearSpecificCallback();
        timerService.startTimer(timerValue2);
        clock.tick(timerValue2 * ONE_SECOND);
        expect(callback1.calledOnce).to.equal(true);
        expect(callback2.called).to.equal(false);
    });

    it('should toggle pause state and start/stop interval accordingly', () => {
        const timerValue = 5;
        const timerValue2 = 10;

        const onTickMock = stub();
        timerService.setOnTickCallBack(onTickMock);

        timerService.startTimer(timerValue2);
        timerService.togglePause();
        clock.tick(timerValue * ONE_SECOND);
        expect(onTickMock.callCount).to.equal(1);

        timerService.togglePause();
        clock.tick(timerValue * ONE_SECOND);
        expect(onTickMock.callCount).to.equal(timerValue + 1);
    });

    it('should update tick delay when calling updateDelay', () => {
        const newDelay = 500;
        const tickCount = 5;
        const timerValue = 10;

        const onTickMock = stub();
        timerService.setOnTickCallBack(onTickMock);

        timerService.startTimer(timerValue);
        timerService.updateDelay(newDelay);
        clock.tick(tickCount * ONE_SECOND);

        expect(onTickMock.callCount).to.equal(timerValue + 1);
    });

    it('should not tick if paused', () => {
        const onTickMock = stub();
        timerService.setOnTickCallBack(onTickMock);

        timerService['isPaused'] = true;

        timerService['tick']();

        expect(onTickMock.called).to.equal(false);
    });

    it('should call specific callback on tick', () => {
        const mockTickValue = 10;
        timerService['tickValue'] = mockTickValue + 1;

        const onSpecifcTickMock = stub();
        timerService.setSpecificCallback(mockTickValue, onSpecifcTickMock);

        timerService['tick']();

        expect(onSpecifcTickMock.called).to.equal(true);
    });
});
