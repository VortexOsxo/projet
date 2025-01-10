import { TestBed } from '@angular/core/testing';
import { GameLobbyService } from './game-lobby.service';
import { SocketService } from '@app/services/socket-service/socket.service';
import { SocketFactoryService } from '@app/services/socket-service/socket-factory.service';
import { GameInfoService } from './game-info.service';
import { GamePlayersStatService } from './game-players-stat.service';
import { of } from 'rxjs';
import { Player } from '@common/interfaces/player';
import { PlayerState } from '@common/enums/user-answer-state';
import { GameType } from '@common/enums/game-type';

describe('GameLobbyService', () => {
    let service: GameLobbyService;
    let socketFactoryServiceSpy: jasmine.SpyObj<SocketFactoryService>;
    let socketServiceSpy: jasmine.SpyObj<SocketService>;
    let gameInfoServiceSpy: jasmine.SpyObj<GameInfoService>;
    let playerStatsServiceSpy: jasmine.SpyObj<GamePlayersStatService>;

    let mockPlayers: Player[];

    beforeEach(() => {
        socketServiceSpy = jasmine.createSpyObj('SocketService', ['emit', 'on']);

        socketFactoryServiceSpy = jasmine.createSpyObj('SocketFactoryService', ['getSocket']);
        socketFactoryServiceSpy.getSocket.and.returnValue(socketServiceSpy);

        gameInfoServiceSpy = jasmine.createSpyObj(GameInfoService, ['getGameId', 'getGameType']);
        playerStatsServiceSpy = jasmine.createSpyObj(GamePlayersStatService, ['filterByPlayerInGame', 'getPlayersObservable', 'getPlayers']);

        mockPlayers = [
            { name: 'Player 1', score: 0, bonusCount: 0, answerState: PlayerState.ANSWERING },
            { name: 'Player 2', score: 0, bonusCount: 0, answerState: PlayerState.NO_ANSWER },
        ];

        playerStatsServiceSpy.getPlayersObservable.and.returnValue(of(mockPlayers));
        TestBed.configureTestingModule({
            providers: [
                GameLobbyService,
                { provide: SocketFactoryService, useValue: socketFactoryServiceSpy },
                { provide: GameInfoService, useValue: gameInfoServiceSpy },
                { provide: GamePlayersStatService, useValue: playerStatsServiceSpy },
            ],
        });
        service = TestBed.inject(GameLobbyService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should be able to get the gameId', () => {
        const mockGameId = 123;
        gameInfoServiceSpy.getGameId.and.returnValue(mockGameId);

        expect(service.gameId).toEqual(mockGameId);
        expect(gameInfoServiceSpy.getGameId).toHaveBeenCalled();
    });

    it('should return an observable that emits correct value when toggleLobbyLock() is called', () => {
        const expectedValue = true;

        service.toggleLobbyLock();

        const callback = socketServiceSpy.emit.calls.argsFor(0)[2] as (isLocked: boolean) => void;
        callback(expectedValue);

        expect(service.isLobbyLocked).toEqual(expectedValue);
    });

    it('should call startGame()', () => {
        service.startGame();
        expect(socketServiceSpy.emit).toHaveBeenCalledWith('startGame');
    });

    it('should call banPlayer()', () => {
        const playerName = 'TestPlayer';
        service.banPlayer(playerName);
        expect(socketServiceSpy.emit).toHaveBeenCalledWith('banPlayer', playerName);
    });

    describe('canStartGame', () => {
        it('should return true if lobby is locked and enough players are present', () => {
            service.isLobbyLocked = true;
            gameInfoServiceSpy.getGameType = jasmine.createSpy().and.returnValue(GameType.RandomGame);

            service.players = [];

            const result = service.canStartGame();
            expect(result).toBe(true);
        });

        it('should return false if lobby is not locked', () => {
            service.isLobbyLocked = false;
            const result = service.canStartGame();
            expect(result).toBe(false);
        });

        it('should return false if lobby is locked but not enough players are present', () => {
            service.isLobbyLocked = true;
            gameInfoServiceSpy.getGameType = jasmine.createSpy().and.returnValue(GameType.NormalGame);
            service.players = [];

            const result = service.canStartGame();
            expect(result).toBe(false);
        });

        it('should return true if lobby is locked and enough players are present for non-random game', () => {
            service.isLobbyLocked = true;
            gameInfoServiceSpy.getGameType = jasmine.createSpy().and.returnValue(GameType.NormalGame);
            service.players = [{ name: 'Player 1', score: 0, bonusCount: 0, answerState: PlayerState.ANSWERING }];

            const result = service.canStartGame();
            expect(result).toBe(true);
        });

        it('should be able to reset locked state', () => {
            service.isLobbyLocked = true;
            const mockPlayer = { name: 'hello' } as Player;
            playerStatsServiceSpy.getPlayers.and.returnValue([mockPlayer]);

            service.resetState();
            expect(service.isLobbyLocked).toEqual(false);
            expect(service.players).toEqual([mockPlayer]);
        });
    });
});
