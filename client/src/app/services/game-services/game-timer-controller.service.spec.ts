import { TestBed } from '@angular/core/testing';
import { GameTimerControllerService } from './game-timer-controller.service';
import { SocketFactoryService } from '@app/services/socket-service/socket-factory.service';
import { SocketService } from '@app/services/socket-service/socket.service';
import { BehaviorSubject } from 'rxjs';
import { AudioService } from '@app/services/audio.service';
import { PANIC_SOUND_MP3 } from '@app/consts/file-consts';
import { GameTimerSocketEvent } from '@common/enums/socket-event/game-timer-socket-event';

describe('GameTimerControllerService', () => {
    let service: GameTimerControllerService;

    let audioServiceSpy: jasmine.SpyObj<AudioService>;

    let socketFactoryServiceSpy: jasmine.SpyObj<SocketFactoryService>;
    let socketServiceSpy: jasmine.SpyObj<SocketService>;

    beforeEach(() => {
        socketServiceSpy = jasmine.createSpyObj('SocketService', ['on', 'emit']);

        socketFactoryServiceSpy = jasmine.createSpyObj('SocketFactoryService', ['getSocket']);
        socketFactoryServiceSpy.getSocket.and.returnValue(socketServiceSpy);

        audioServiceSpy = jasmine.createSpyObj('AudioService', ['playSound']);

        TestBed.configureTestingModule({
            providers: [
                GameTimerControllerService,
                { provide: SocketFactoryService, useValue: socketFactoryServiceSpy },
                { provide: AudioService, useValue: audioServiceSpy },
            ],
        });
        service = TestBed.inject(GameTimerControllerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should emit TOGGLE_TIMER_PAUSE event when toggleStop is called', () => {
        service['canToggleStopSubject'].next(true);
        service.toggleStop();
        expect(socketServiceSpy.emit).toHaveBeenCalledWith(GameTimerSocketEvent.TogglePause);
    });

    it('should not emit TOGGLE_TIMER_PAUSE event when toggleStop is called if it cant', () => {
        service['canToggleStopSubject'].next(false);
        service.toggleStop();
        expect(socketServiceSpy.emit).not.toHaveBeenCalled();
    });

    it('should emit START_TIMER_PANIC event when startPanic is called', () => {
        service['canStartPanicSubject'].next(true);
        service.togglePanic();
        expect(socketServiceSpy.emit).toHaveBeenCalledWith(GameTimerSocketEvent.StartPanic);
    });

    it('should not emit START_TIMER_PANIC event when startPanic is calledif it cant', () => {
        service['canStartPanicSubject'].next(false);
        service.togglePanic();
        expect(socketServiceSpy.emit).not.toHaveBeenCalled();
    });

    it('should update canToggleStopSubject when receiving CAN_TOGGLE_TIMER_PAUSE event', () => {
        const canToggle = true;
        service['canToggleStopSubject'] = new BehaviorSubject<boolean>(false);
        service['setUpSocket']();

        const callback = socketServiceSpy.on.calls.argsFor(0)[1] as (canToggle: boolean) => void;
        callback(canToggle);

        expect(service['canToggleStopSubject'].getValue()).toEqual(canToggle);
    });

    it('should update canStartPanicSubject when receiving CAN_START_TIMER_PANIC event', () => {
        const canStart = true;
        service['canStartPanicSubject'] = new BehaviorSubject<boolean>(false);
        service['setUpSocket']();

        const callback = socketServiceSpy.on.calls.argsFor(1)[1] as (canStart: boolean) => void;
        callback(canStart);

        expect(service['canStartPanicSubject'].getValue()).toEqual(canStart);
    });

    it('should play panic sound', () => {
        service['panicModeStarted']();
        expect(audioServiceSpy.playSound).toHaveBeenCalledWith(PANIC_SOUND_MP3);
    });
});
