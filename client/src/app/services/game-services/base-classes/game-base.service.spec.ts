import { TestBed } from '@angular/core/testing';

import { GameBaseService } from './game-base.service';
import { SocketFactoryService } from '@app/services/socket-service/socket-factory.service';
import { GAME_SOCKET_NAME } from '@common/config/socket-config';

describe('GameBaseService', () => {
    let service: GameBaseService;
    let socketFactoryServiceMock: jasmine.SpyObj<SocketFactoryService>;

    beforeEach(() => {
        socketFactoryServiceMock = jasmine.createSpyObj('SocketFactoryService', ['getSocket']);
        TestBed.configureTestingModule({
            providers: [GameBaseService, { provide: SocketFactoryService, useValue: socketFactoryServiceMock }],
        });
        service = TestBed.inject(GameBaseService);
    });

    it('should be created with the proper socket', () => {
        expect(service).toBeTruthy();
        expect(socketFactoryServiceMock.getSocket).toHaveBeenCalledWith(GAME_SOCKET_NAME);
    });
});
