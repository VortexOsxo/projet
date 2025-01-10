import { expect } from 'chai';
import { stub, SinonStubbedInstance, createStubInstance } from 'sinon';
import { GameHistoryService } from './game-history.service';
import { DataManagerService } from '@app/services/data/data-manager.service';
import { GameBase } from '@app/classes/game/game-base';
import { GameHistory } from '@common/interfaces/game-history';
import { Player } from '@app/interfaces/users/player';
import { Quiz } from '@common/interfaces/quiz';
import { GameHistorySocket } from '@app/services/sockets/game-history-socket.service';

describe('GameHistoryService', () => {
    let dataManagerServiceStub: SinonStubbedInstance<DataManagerService<GameHistory>>;
    let gameHistorySocektStub: SinonStubbedInstance<GameHistorySocket>;

    let gameHistoryService: GameHistoryService;

    let gameStub: SinonStubbedInstance<GameBase>;

    const mockId = 32;
    const mockQuiz: Quiz = { title: 'mockTitle1' } as Quiz;

    const mockPlayers = [
        { name: 'player1', score: 50 },
        { name: 'player2', score: 30 },
    ] as Player[];

    beforeEach(() => {
        dataManagerServiceStub = createStubInstance(DataManagerService);
        gameHistorySocektStub = createStubInstance(GameHistorySocket);

        gameStub = createStubInstance(GameBase);
        gameStub.players = mockPlayers;
        gameStub.gameId = mockId;
        gameStub.quiz = mockQuiz;

        gameHistoryService = new GameHistoryService(dataManagerServiceStub, gameHistorySocektStub);
    });

    describe('registerToHistory', () => {
        it('should register a game to history', () => {
            gameHistoryService.registerToHistory(gameStub);

            expect(gameHistoryService['registeredGames'].size).to.equal(1);
        });
    });

    describe('uneregisterFromHistory', () => {
        it('should unregister a game from history', () => {
            gameHistoryService.registerToHistory(gameStub);

            gameHistoryService.unregisterFromHistory(gameStub);

            expect(gameHistoryService['registeredGames'].has(mockId)).to.equal(false);
        });
    });

    describe('saveGameToHistory', () => {
        it('should save a game to history', async () => {
            const gameHistoryMock: GameHistory = {} as GameHistory;
            const unregisterSpy = stub(gameHistoryService as unknown as { unregisterFromHistory: (game: GameBase) => void }, 'unregisterFromHistory');

            gameHistoryService['getGameHistory'] = stub().returns(gameHistoryMock);
            await gameHistoryService.saveGameToHistory(gameStub);

            expect(dataManagerServiceStub.addElement.calledOnceWithExactly(gameHistoryMock)).to.equal(true);
            expect(unregisterSpy.calledOnceWithExactly(gameStub)).to.equal(true);
        });

        it('should not save a game to history if game history not found', async () => {
            gameHistoryService['getGameHistory'] = stub().returns(undefined);

            const unregisterSpy = stub(gameHistoryService as unknown as { unregisterFromHistory: (game: GameBase) => void }, 'unregisterFromHistory');
            await gameHistoryService.saveGameToHistory(gameStub);

            expect(dataManagerServiceStub.addElement.called).to.equal(false);
            expect(unregisterSpy.called).to.equal(false);
        });
    });

    describe('getGameHistory', () => {
        it('should return game history if game exists in registeredGames', () => {
            const gameId = 123;
            gameStub.gameId = gameId;

            const mockGameHistory: GameHistory = { id: '1', startDate: new Date(), playersNb: 2, gameName: 'Example Game', bestScore: 100 };

            gameHistoryService['registeredGames'].set(gameId, mockGameHistory);

            const result = gameHistoryService['getGameHistory'](gameStub);

            expect(result).to.deep.equal(mockGameHistory);
        });

        it('should return undefined if game does not exist in registeredGames', () => {
            const gameId = 123;
            gameStub.gameId = gameId;

            const result = gameHistoryService['getGameHistory'](gameStub);
            expect(result).to.equal(undefined);
        });
    });

    describe('findBestScore', () => {
        it('should return the highest score among players', () => {
            const players = [
                { name: 'player1', score: 50 },
                { name: 'player2', score: 30 },
                { name: 'player3', score: 70 },
            ] as Player[];

            gameStub.players = players;

            const result = gameHistoryService['findBestScore'](gameStub);

            expect(result).to.equal(players[2].score);
        });

        it('should return 0 if no players exist', () => {
            gameStub.players = [];

            const result = gameHistoryService['findBestScore'](gameStub);

            expect(result).to.equal(0);
        });

        it('should return 0 if all player scores are 0', () => {
            const players = [
                { name: 'player1', score: 0 },
                { name: 'player2', score: 0 },
            ];

            gameStub.players = players as Player[];

            const result = gameHistoryService['findBestScore'](gameStub);
            expect(result).to.equal(0);
        });
    });

    it('getHistory', async () => {
        const history: GameHistory[] = [
            { id: '1', bestScore: 100 },
            { id: '2', bestScore: 200 },
        ] as GameHistory[];
        dataManagerServiceStub.getElements.resolves(history);

        const result = await gameHistoryService.getHistory();

        expect(result).to.equal(history);
        expect(dataManagerServiceStub.getElements.called).to.equal(true);
    });

    it('deleteHistory', async () => {
        await gameHistoryService.deleteHistory();

        expect(dataManagerServiceStub.deleteAllElements.called);
        expect(gameHistorySocektStub.emitGameHistoryChangedNotification.called);
    });
});
