import { TestBed } from '@angular/core/testing';
import { Player } from '@common/interfaces/player';
import { SocketFactoryService } from '@app/services/socket-service/socket-factory.service';
import { SocketService } from '@app/services/socket-service/socket.service';
import { GamePlayersStatService } from './game-players-stat.service';
import { PlayerState } from '@common/enums/user-answer-state';

describe('GamePlayersStatService', () => {
    let service: GamePlayersStatService;

    let socketFactoryServiceSpy: jasmine.SpyObj<SocketFactoryService>;
    let socketServiceSpy: jasmine.SpyObj<SocketService>;

    beforeEach(() => {
        socketServiceSpy = jasmine.createSpyObj('SocketService', ['on']);

        socketFactoryServiceSpy = jasmine.createSpyObj('SocketFactoryService', ['getSocket']);
        socketFactoryServiceSpy.getSocket.and.returnValue(socketServiceSpy);

        TestBed.configureTestingModule({
            providers: [GamePlayersStatService, { provide: SocketFactoryService, useValue: socketFactoryServiceSpy }],
        });
        service = TestBed.inject(GamePlayersStatService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should initialize players and players left subjects as empty arrays', () => {
        expect(service['playersBehaviorSubject']).toBeDefined();
        expect(service['playersBehaviorSubject'].value).toEqual([]);
    });

    it('should sort players by score and name', () => {
        const players: Player[] = [
            { name: 'Player1', score: 100 },
            { name: 'Player3', score: 50 },
            { name: 'Player2', score: 100 },
        ] as Player[];

        service.setSortPlayersByScore();
        service['playersBehaviorSubject'].next(players);
        const sortedPlayers: Player[] = service.getPlayers();

        expect(sortedPlayers).toEqual([
            { name: 'Player1', score: 100 },
            { name: 'Player2', score: 100 },
            { name: 'Player3', score: 50 },
        ] as Player[]);
    });

    it('should set sort players by state', () => {
        const players: Player[] = [
            { name: 'Player1', answerState: 1 },
            { name: 'Player2', answerState: 2 },
            { name: 'Player3', answerState: 0 },
        ] as Player[];

        service.setSortPlayersByState();
        service['playersBehaviorSubject'].next(players);

        const sortedPlayers = service.getPlayers();

        expect(sortedPlayers).toEqual([
            { name: 'Player2', answerState: 2 },
            { name: 'Player1', answerState: 1 },
            { name: 'Player3', answerState: 0 },
        ] as Player[]);
    });

    it('should set sort players by name', () => {
        const players: Player[] = [
            { name: 'Player3', answerState: 1 },
            { name: 'Player1', answerState: 2 },
            { name: 'Player2', answerState: 0 },
        ] as Player[];

        service.setSortPlayersByName();
        service['playersBehaviorSubject'].next(players);

        const sortedPlayers = service.getPlayers();

        expect(sortedPlayers).toEqual([
            { name: 'Player1', answerState: 2 },
            { name: 'Player2', answerState: 0 },
            { name: 'Player3', answerState: 1 },
        ] as Player[]);
    });

    it('should filter players by state', () => {
        const players: Player[] = [
            { name: 'Player1', answerState: PlayerState.NO_ANSWER },
            { name: 'Player2', answerState: PlayerState.LEFT_GAME },
            { name: 'Player3', answerState: PlayerState.ANSWERED },
        ] as Player[];

        const filteredPlayers = service.filterByPlayerInGame(players);

        expect(filteredPlayers.length).toBe(2);
        expect(filteredPlayers.every((player) => player.answerState !== PlayerState.LEFT_GAME)).toBeTruthy();
    });

    it('should sort players in reverse order when specified', () => {
        const players: Player[] = [
            { name: 'Player1', score: 100 },
            { name: 'Player3', score: 50 },
            { name: 'Player2', score: 100 },
        ] as Player[];

        service.setReversedState(true);
        service.setSortPlayersByName();
        service['updatePlayersBehaviorSubject'](players);
        const sortedPlayers: Player[] = service.getPlayers();

        expect(sortedPlayers).toEqual([
            { name: 'Player3', score: 50 },
            { name: 'Player2', score: 100 },
            { name: 'Player1', score: 100 },
        ] as Player[]);
    });

    it('should update players subject when receiving sendPlayersStat event', () => {
        const mockPlayerWhoLeft: Player = { name: 'Player0', score: 0, answerState: PlayerState.LEFT_GAME } as Player;
        const mockOldPlayer = { name: 'Playera', score: 0, answerState: PlayerState.ANSWERED } as Player;

        service['playersBehaviorSubject'].next([mockPlayerWhoLeft, mockOldPlayer]);

        const mockPlayers: Player[] = [{ name: 'Player1' } as Player, { name: 'Player2' } as Player];
        service['setUpSocket']();
        const callback = socketServiceSpy.on.calls.argsFor(2)[1] as (players: Player[]) => void;
        callback(mockPlayers);
        expect(service['playersBehaviorSubject'].getValue()).toEqual([{ name: 'Player1' }, { name: 'Player2' }, mockPlayerWhoLeft] as Player[]);
    });

    it('should set the reversed state', () => {
        service.setReversedState(true);
        expect(service['isSortReversed']).toBeTrue();

        service.setReversedState(false);
        expect(service['isSortReversed']).toBeFalse();
    });

    it('should add a player when receiving SEND_PLAYER_JOINED event', () => {
        const mockPlayer: Player = { name: 'Player1', score: 0 } as Player;
        service['setUpSocket']();
        const addPlayerCallback = socketServiceSpy.on.calls.argsFor(0)[1] as (player: Player) => void;
        addPlayerCallback(mockPlayer);

        const updatedPlayers = service['playersBehaviorSubject'].getValue();
        expect(updatedPlayers).toContain(mockPlayer);
    });

    it('should remove a player when receiving SEND_PLAYER_LEFT event', () => {
        const mockPlayer: Player = { name: 'Player1', score: 0 } as Player;
        const mockCurrentPlayers: Player[] = [mockPlayer];
        service['playersBehaviorSubject'].next(mockCurrentPlayers);
        service['setUpSocket']();

        const removePlayerCallback = socketServiceSpy.on.calls.argsFor(1)[1] as (player: Player) => void;
        removePlayerCallback(mockPlayer);

        const updatedPlayers = service['playersBehaviorSubject'].getValue();
        const removedPlayer = updatedPlayers.find((player) => player.name === mockPlayer.name);
        expect(removedPlayer?.answerState).toBe(PlayerState.LEFT_GAME);
    });

    it('should reset players when receiving GAME_STARTED_EVENT', () => {
        const mockPlayer1: Player = { name: 'Player1', score: 0, answerState: PlayerState.ANSWERED } as Player;
        const mockPlayer2: Player = { name: 'Player2', score: 0, answerState: PlayerState.LEFT_GAME } as Player;
        const mockPlayer3: Player = { name: 'Player3', score: 0, answerState: PlayerState.ANSWERING } as Player;

        const mockCurrentPlayers: Player[] = [mockPlayer1, mockPlayer2, mockPlayer3];
        service['playersBehaviorSubject'].next(mockCurrentPlayers);

        service['setUpSocket']();
        const resetPlayerCallback = socketServiceSpy.on.calls.argsFor(3)[1] as () => void;
        resetPlayerCallback();

        const updatedPlayers = service['playersBehaviorSubject'].getValue();
        expect(updatedPlayers.length).toBe(2);
        expect(updatedPlayers).toContain(mockPlayer1);
        expect(updatedPlayers).toContain(mockPlayer3);
        expect(updatedPlayers).not.toContain(mockPlayer2);
    });
});
