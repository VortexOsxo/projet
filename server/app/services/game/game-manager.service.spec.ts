import { Container } from 'typedi';
import { GameManagerService } from './game-manager.service';
import { GameBase } from '@app/classes/game/game-base';
import { SinonStubbedInstance, createStubInstance, stub, match } from 'sinon';
import { expect } from 'chai';
import { GameLobby } from '@app/classes/game/game-lobby';
import { Quiz } from '@common/interfaces/quiz';
import { DataManagerService } from '@app/services/data/data-manager.service';
import { User } from '@app/interfaces/users/user';
import { GameFactoryService } from './game-factory/game-factory.service';
import { GameType } from '@common/enums/game-type';
import { GameSessionTest } from '@app/classes/game/game-session-test';
import { GameSessionNormal } from '@app/classes/game/game-session-normal';
import { GameConfig } from '@app/interfaces/game-config';
import { GAME_ID_MINIMUM, GAME_ID_RANGE } from '@app/consts/game.const';
import { Subject } from 'rxjs';
import { GameSessionRandom } from '@app/classes/game/game-session-random';
import { GameRandomManagerService } from './game-random-manager.service';
import { RANDOM_QUIZ_ID } from '@common/config/game-config';

describe('GameManagerService', () => {
    let gameManagerService: GameManagerService;
    let dataManagerServiceStub: SinonStubbedInstance<DataManagerService<Quiz>>;
    let gameBuilderServiceStub: SinonStubbedInstance<GameFactoryService>;
    let randomQuizManager: SinonStubbedInstance<GameRandomManagerService>;

    let mockGame1: SinonStubbedInstance<GameLobby>;
    let mockGame2: SinonStubbedInstance<GameBase>;

    const quizMock = {
        id: 'quiz46',
    } as Quiz;

    const gameId1 = 1;
    const gameId2 = 2;

    beforeEach(() => {
        dataManagerServiceStub = createStubInstance(DataManagerService<Quiz>);
        dataManagerServiceStub.getElementById.resolves(quizMock);

        gameBuilderServiceStub = createStubInstance(GameFactoryService);
        randomQuizManager = createStubInstance(GameRandomManagerService);

        gameManagerService = Container.get(GameManagerService);
        gameManagerService['dataManagerService'] = dataManagerServiceStub;
        gameManagerService['gameBuilderService'] = gameBuilderServiceStub;
        gameManagerService['gameRandomManagerService'] = randomQuizManager;

        mockGame1 = createStubInstance(GameLobby);
        mockGame1['quiz'] = quizMock;
        mockGame1['gameId'] = gameId1;

        mockGame2 = createStubInstance(GameBase);
        mockGame2['quiz'] = quizMock;
        mockGame2['gameId'] = gameId2;

        gameManagerService['games'].set(gameId1, mockGame1);
        gameManagerService['games'].set(gameId2, mockGame2);
    });

    describe('createGameLobby', () => {
        const mockOrganiser: User = { onJoinGame: stub() } as unknown as User;

        const newQuizId = quizMock.id;

        it('should not create game with the same gameId', async () => {
            const mockRandomReturn1 = 0.5;
            const mockRandomReturn2 = 0.3;
            const gameId3 = mockRandomReturn1 * GAME_ID_RANGE + GAME_ID_MINIMUM;

            const randomStub = stub(Math, 'random');
            randomStub.onCall(0).returns(mockRandomReturn1);
            randomStub.onCall(1).returns(mockRandomReturn2);

            gameManagerService['games'].set(gameId3, undefined);
            const gameId4 = gameManagerService['generateGameId']();

            expect(gameId3).not.to.equal(gameId4);
            randomStub.restore();
        });

        it('should return undefined if the quiz is not found', async () => {
            dataManagerServiceStub.getElementById.resolves(undefined);

            const game1 = await gameManagerService.createGameLobby(mockOrganiser, newQuizId);

            expect(game1).to.equal(undefined);
        });

        it('should create a game lobby with the provided organizer and quiz ID', async () => {
            const expectedGameType = GameType.LobbyGame;

            const mockGameLobby: GameLobby = createStubInstance(GameLobby);
            mockGameLobby.removedGameSubject = createStubInstance(Subject);
            gameBuilderServiceStub.buildGame.returns(mockGameLobby);

            const result = await gameManagerService.createGameLobby(mockOrganiser, newQuizId);

            expect(result).to.equal(mockGameLobby);
            expect(gameBuilderServiceStub.buildGame.calledOnce).to.equal(true);
            expect(
                gameBuilderServiceStub.buildGame.calledWithExactly(
                    match({ organizer: mockOrganiser, gameId: match.number, quiz: match.object }),
                    expectedGameType,
                ),
            ).to.equal(true);
        });

        it('should create agame lobby with future type as random game when the id is the one of the random games', async () => {
            randomQuizManager.createRandomQuiz.resolves({} as Quiz);

            const mockGameLobby: GameLobby = createStubInstance(GameLobby);
            mockGameLobby.removedGameSubject = createStubInstance(Subject);
            gameBuilderServiceStub.buildGame.returns(mockGameLobby);

            const result = await gameManagerService.createGameLobby(mockOrganiser, RANDOM_QUIZ_ID);

            expect(result).to.equal(mockGameLobby);
            expect(randomQuizManager.createRandomQuiz.calledOnce).to.equal(true);
        });

        it('should create a test game with the provided organizer and quiz ID', async () => {
            const expectedGameType = GameType.TestGame;
            const quizId = '123';

            const mockTestGame: GameSessionTest = createStubInstance(GameSessionTest);
            mockTestGame.removedGameSubject = createStubInstance(Subject);
            gameBuilderServiceStub.buildGame.returns(mockTestGame);

            const result = await gameManagerService.createTestGame(mockOrganiser, quizId);

            expect(result).to.equal(mockTestGame);
            expect(gameBuilderServiceStub.buildGame.calledOnce).to.equal(true);
            expect(
                gameBuilderServiceStub.buildGame.calledWithExactly(
                    match({ organizer: mockOrganiser, gameId: match.number, quiz: match.object }),
                    expectedGameType,
                ),
            ).to.equal(true);
        });

        it('should create a normal game based on the provided game lobby', async () => {
            const mockGameLobby = createStubInstance(GameLobby);
            mockGameLobby.futureGameType = GameType.NormalGame;

            const gameConfigMock: GameConfig = { gameId: 12, organizer: mockOrganiser, quiz: {} as Quiz };
            mockGameLobby.getGameConfig.returns(gameConfigMock);

            const mockNormalGame: GameSessionNormal = createStubInstance(GameSessionNormal);
            mockNormalGame.removedGameSubject = createStubInstance(Subject);
            gameBuilderServiceStub.buildGame.returns(mockNormalGame);

            const result = await gameManagerService.createNormalGame(mockGameLobby);

            expect(result).to.equal(mockNormalGame);
            expect(
                gameBuilderServiceStub.buildGame.calledOnceWithExactly(mockGameLobby.getGameConfig(), GameType.NormalGame, mockGameLobby.players),
            ).to.equal(true);
        });

        it('should create a random game based on the provided game lobby', async () => {
            const mockGameLobby = createStubInstance(GameLobby);
            mockGameLobby.futureGameType = GameType.RandomGame;

            const gameConfigMock: GameConfig = { gameId: 12, organizer: mockOrganiser, quiz: {} as Quiz };
            mockGameLobby.getGameConfig.returns(gameConfigMock);

            const mockRandomGame: GameSessionRandom = createStubInstance(GameSessionRandom);
            mockRandomGame.removedGameSubject = createStubInstance(Subject);
            gameBuilderServiceStub.buildGame.returns(mockRandomGame);

            const result = await gameManagerService.createNormalGame(mockGameLobby);

            expect(result).to.equal(mockRandomGame);
            expect(
                gameBuilderServiceStub.buildGame.calledOnceWithExactly(mockGameLobby.getGameConfig(), GameType.RandomGame, mockGameLobby.players),
            ).to.equal(true);
        });
    });

    describe('removeGame', () => {
        it('should remove the game from the games map', () => {
            const gameIdToRemove = 123;
            const mockGame = {} as GameBase;
            gameManagerService['games'].set(gameIdToRemove, mockGame);
            gameManagerService.removeGame(gameIdToRemove);
            expect(gameManagerService['games'].has(gameIdToRemove)).to.equal(false);
        });

        it('should not throw an error if the game does not exist', () => {
            const gameIdToRemove = 456;
            const removeGameAction = () => gameManagerService.removeGame(gameIdToRemove);
            expect(removeGameAction).not.to.throw();
        });
    });
    it('should return the correct game by ID', () => {
        const game1 = {} as GameBase;
        const game2 = {} as GameBase;

        gameManagerService['games'].set(1, game1);
        gameManagerService['games'].set(2, game2);

        expect(gameManagerService.getGameById(1)).to.equal(game1);
        expect(gameManagerService.getGameById(2)).to.equal(game2);
    });

    it('should add a game to the games map and set up removal subscription', () => {
        const gameId = 123;

        const gameMock = createStubInstance(GameBase);
        gameMock.gameId = gameId;
        const removedGameSubjectSpy = createStubInstance(Subject);
        gameMock.removedGameSubject = removedGameSubjectSpy;

        gameManagerService['addGame'](gameMock);
        expect(gameManagerService['games'].has(gameId)).to.equal(true);

        // Even though the method is deprecated,
        // we can still access the right callback and properly test the method
        const callbackFunction = removedGameSubjectSpy.subscribe.args[0][0] as () => void; // eslint-disable-line deprecation/deprecation
        callbackFunction();

        expect(gameManagerService['games'].has(gameId)).to.equal(false);
    });
});
