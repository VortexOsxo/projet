import { TestBed } from '@angular/core/testing';

import { GameCreationService } from './game-creation.service';
import { SocketFactoryService } from '@app/services/socket-service/socket-factory.service';
import { SocketService } from '@app/services/socket-service/socket.service';
import { GameType } from '@common/enums/game-type';
import { GameInfoService } from './game-info.service';
import { GameStateService } from './game-state.service';
import { UserGameState } from '@common/enums/user-game-state';
import { ORGANIZER_USERNAME } from '@common/config/game-config';

describe('GameCreationService', () => {
    let service: GameCreationService;
    let socketFactoryServiceSpy: jasmine.SpyObj<SocketFactoryService>;
    let socketServiceSpy: jasmine.SpyObj<SocketService>;

    let gameInfoServiceMock: jasmine.SpyObj<GameInfoService>;
    let gameStateServiceMock: jasmine.SpyObj<GameStateService>;

    const quizId = 'quiz123';

    beforeEach(() => {
        socketServiceSpy = jasmine.createSpyObj('SocketService', ['on', 'emit']);

        socketFactoryServiceSpy = jasmine.createSpyObj('SocketFactoryService', ['getSocket']);
        socketFactoryServiceSpy.getSocket.and.returnValue(socketServiceSpy);

        gameInfoServiceMock = jasmine.createSpyObj('GameInfoServiceMock', ['setUsername']);
        gameStateServiceMock = jasmine.createSpyObj('GameStateService', ['setState']);

        TestBed.configureTestingModule({
            providers: [
                GameCreationService,
                { provide: SocketFactoryService, useValue: socketFactoryServiceSpy },
                { provide: GameInfoService, useValue: gameInfoServiceMock },
                { provide: GameStateService, useValue: gameStateServiceMock },
            ],
        });
        service = TestBed.inject(GameCreationService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should call createGameIntern with correct parameters for NormalGame', () => {
        const gameType = GameType.NormalGame;

        service.createGame(quizId, gameType);

        expect(socketServiceSpy.emit).toHaveBeenCalledWith('createGameLobby', quizId, jasmine.any(Function));
    });

    it('should update state to  AttemptingToJoin', () => {
        const gameType = GameType.NormalGame;

        service.createGame(quizId, gameType);

        expect(gameStateServiceMock.setState).toHaveBeenCalledWith(UserGameState.AttemptingToJoin);
    });

    it('should call createGameIntern with correct parameters for TestGame', () => {
        const gameType = GameType.TestGame;

        service.createGame(quizId, gameType);

        expect(socketServiceSpy.emit).toHaveBeenCalledWith('createGameTest', quizId, jasmine.any(Function));
    });

    it('should update username to organizer name if game successfuly created', () => {
        service.createGame(quizId, GameType.NormalGame);

        const callback = socketServiceSpy.emit.calls.argsFor(0)[2] as (success: boolean) => void;
        callback(true);

        expect(gameInfoServiceMock.setUsername).toHaveBeenCalledWith(ORGANIZER_USERNAME);
    });

    it('should not update username if game was not successfuly created', () => {
        service.createGame(quizId, GameType.NormalGame);

        const callback = socketServiceSpy.emit.calls.argsFor(0)[2] as (success: boolean) => void;
        callback(false);

        expect(gameInfoServiceMock.setUsername).not.toHaveBeenCalled();
    });
});
