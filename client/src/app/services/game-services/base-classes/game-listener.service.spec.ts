import { Injectable } from '@angular/core';
import { GameListenerService } from './game-listener.service';
import { TestBed } from '@angular/core/testing';
import { SocketFactoryService } from '@app/services/socket-service/socket-factory.service';
import { SocketService } from '@app/services/socket-service/socket.service';

@Injectable()
class ConcreteGameListenerService extends GameListenerService {
    protected initializeState(): void {
        // no implementation needed for test
    }
}

describe('GameListenerService', () => {
    let service: ConcreteGameListenerService;
    let socketFactoryServiceMock: jasmine.SpyObj<SocketFactoryService>;

    let socketServiceSpy: jasmine.SpyObj<SocketService>;

    beforeEach(() => {
        socketServiceSpy = jasmine.createSpyObj('SocketService', ['on']);
        socketFactoryServiceMock = jasmine.createSpyObj('SocketFactoryService', ['getSocket']);
        socketFactoryServiceMock.getSocket.and.returnValue(socketServiceSpy);

        TestBed.configureTestingModule({
            providers: [ConcreteGameListenerService, { provide: SocketFactoryService, useValue: socketFactoryServiceMock }],
        });
        service = TestBed.inject(ConcreteGameListenerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should properly setUpSocket during initialization', () => {
        const initializeStateSpy = spyOn(service as unknown as { initializeState: () => void }, 'initializeState').and.callThrough();
        expect(socketServiceSpy.on).toHaveBeenCalledWith('kickedOutFromGame', jasmine.any(Function));
        service['setUpSocketIntern']();

        const callback = socketServiceSpy.on.calls.argsFor(0)[1] as () => void;
        callback();

        expect(initializeStateSpy).toHaveBeenCalled();
    });
});
