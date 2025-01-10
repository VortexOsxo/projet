import { TestBed } from '@angular/core/testing';
import { GameJoiningService } from './game-joining.service';
import { SocketFactoryService } from '@app/services/socket-service/socket-factory.service';
import { GameInfoService } from './game-info.service';
import { SocketService } from '@app/services/socket-service/socket.service';
import { GameStateService } from './game-state.service';
import { UserGameState } from '@common/enums/user-game-state';

describe('GameJoiningService', () => {
    let service: GameJoiningService;
    let socketFactoryServiceSpy: jasmine.SpyObj<SocketFactoryService>;
    let socketServiceSpy: jasmine.SpyObj<SocketService>;
    let gameInfoServiceSpy: jasmine.SpyObj<GameInfoService>;
    let gameStateServiceSpy: jasmine.SpyObj<GameStateService>;

    beforeEach(() => {
        socketServiceSpy = jasmine.createSpyObj('SocketService', ['emit', 'on']);

        gameInfoServiceSpy = jasmine.createSpyObj('GameInfoService', ['setUsername']);
        gameStateServiceSpy = jasmine.createSpyObj('GameStateService', ['setState']);

        socketFactoryServiceSpy = jasmine.createSpyObj('SocketFactoryService', ['getSocket']);
        socketFactoryServiceSpy.getSocket.and.returnValue(socketServiceSpy);

        TestBed.configureTestingModule({
            providers: [
                GameJoiningService,
                { provide: SocketFactoryService, useValue: socketFactoryServiceSpy },
                { provide: GameInfoService, useValue: gameInfoServiceSpy },
                { provide: GameStateService, useValue: gameStateServiceSpy },
            ],
        });
        service = TestBed.inject(GameJoiningService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should emit to socket when joining game and change user state', async () => {
        const gameId = 123;
        socketServiceSpy.emit.and.callFake((event, data, callback) => {
            (callback as (success: boolean) => void)(false);
        });
        await service.joinGame(gameId);
        expect(gameStateServiceSpy.setState).toHaveBeenCalledWith(UserGameState.AttemptingToJoin);
        expect(socketServiceSpy.emit).toHaveBeenCalledWith('joinGameLobby', gameId, jasmine.any(Function));
    });

    it('should set username and return true when setting username successfully', async () => {
        const username = 'testUser';
        socketServiceSpy.emit.and.callFake((event, data, callback) => {
            (callback as (success: boolean) => void)(true);
        });

        const success = await service.setUsername(username);
        expect(success).toBeTrue();
        expect(gameInfoServiceSpy.setUsername).toHaveBeenCalledWith(username);
    });

    it('should return false when setting username fails', async () => {
        const username = 'testUser';
        socketServiceSpy.emit.and.callFake((event, data, callback) => {
            (callback as (success: boolean) => void)(false);
        });

        const success = await service.setUsername(username);
        expect(success).toBeFalse();
        expect(gameInfoServiceSpy.setUsername).not.toHaveBeenCalled();
    });
});
