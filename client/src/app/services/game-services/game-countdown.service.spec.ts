import { TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';

import { GameCountdownService } from './game-countdown.service';
import { SocketFactoryService } from '@app/services/socket-service/socket-factory.service';
import { SocketService } from '@app/services/socket-service/socket.service';

describe('GameCountdownService', () => {
    let service: GameCountdownService;
    let socketFactoryServiceMock: jasmine.SpyObj<SocketFactoryService>;
    let socketServiceSpy: jasmine.SpyObj<SocketService>;

    beforeEach(() => {
        socketServiceSpy = jasmine.createSpyObj('SocketService', ['on']);
        socketFactoryServiceMock = jasmine.createSpyObj('SocketFactoryService', ['getSocket']);
        socketFactoryServiceMock.getSocket.and.returnValue(socketServiceSpy);

        TestBed.configureTestingModule({
            providers: [GameCountdownService, { provide: SocketFactoryService, useValue: socketFactoryServiceMock }],
        });
        service = TestBed.inject(GameCountdownService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should initialize state correctly', () => {
        expect(service['timerValueSubject']).toBeInstanceOf(BehaviorSubject);
        expect(service['timerValueSubject'].getValue()).toBe(0);
    });

    it('should properly set up socket for timer', () => {
        service['setUpSocket']();
        expect(socketServiceSpy.on).toHaveBeenCalledWith('timerTicked', jasmine.any(Function));

        const tickValue = 10;
        const callback = socketServiceSpy.on.calls.argsFor(0)[1] as (tickValue: number) => void;
        callback(tickValue);

        expect(service['timerValueSubject'].getValue()).toBe(tickValue);
    });

    it('should provide observable for timer updates', () => {
        const timerObservable = service.getTimerObservable();
        expect(timerObservable).toEqual(service['timerValueSubject'].asObservable());
    });
});
