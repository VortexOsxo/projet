import { GameFactoryService } from './game-factory.service';
import { GameConfig } from '@app/interfaces/game-config';
import { GameType } from '@common/enums/game-type';
import { GameLobby } from '@app/classes/game/game-lobby';
import { Player } from '@app/interfaces/users/player';
import { Quiz } from '@common/interfaces/quiz';
import { expect } from 'chai';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { Client } from '@app/classes/client';
import { GameMultiplayerBuilderService } from './game-multiplayer-builder.service';
import { GameTestBuilderService } from './game-test-builder.service';
import { GameSessionNormal } from '@app/classes/game/game-session-normal';
import { GameSessionTest } from '@app/classes/game/game-session-test';
import { GameSessionRandom } from '@app/classes/game/game-session-random';

describe('GameFactoryService', () => {
    let gameFactoryService: GameFactoryService;

    let gameMultiplayerbuilder: SinonStubbedInstance<GameMultiplayerBuilderService>;
    let gameTestBuilderStub: SinonStubbedInstance<GameTestBuilderService>;

    const mockQuiz: Quiz = {
        id: '1',
        questions: [],
    } as Quiz;

    let mockOrganiser: SinonStubbedInstance<Client>;

    let mockConfig: GameConfig;

    beforeEach(() => {
        mockOrganiser = createStubInstance(Client);

        gameMultiplayerbuilder = createStubInstance(GameMultiplayerBuilderService);
        gameTestBuilderStub = createStubInstance(GameTestBuilderService);

        mockConfig = { gameId: 123, organizer: mockOrganiser, quiz: mockQuiz };

        gameFactoryService = new GameFactoryService(gameTestBuilderStub, gameMultiplayerbuilder);
    });

    it('should build a GameLobby instance for LobbyGame', () => {
        const gameType: GameType = GameType.LobbyGame;
        const game = gameFactoryService.buildGame(mockConfig, gameType);

        expect(game instanceof GameLobby).to.equal(true);
    });

    it('should build a GameSessionTest instance for TestGame', () => {
        const mockGame = createStubInstance(GameSessionTest);
        gameTestBuilderStub.buildGame.returns(mockGame);

        const builtGame = gameFactoryService.buildGame(mockConfig, GameType.TestGame);

        expect(builtGame).to.equal(mockGame);
        expect(gameTestBuilderStub.buildGame.called).to.equal(true);
    });

    it('should build a GameSessionNormal instance for NormalGame', () => {
        const mockGame = createStubInstance(GameSessionNormal);
        gameMultiplayerbuilder.buildGame.returns(mockGame);

        const players: Player[] = [];

        const builtGame = gameFactoryService.buildGame(mockConfig, GameType.NormalGame, players);

        expect(builtGame).to.equal(mockGame);
        expect(gameMultiplayerbuilder.buildGame.called).to.equal(true);
    });

    it('should build a GameSessionRandom instance for RandomGame', () => {
        const mockGame = createStubInstance(GameSessionRandom);
        gameMultiplayerbuilder.buildGame.returns(mockGame);

        const players: Player[] = [];

        const builtGame = gameFactoryService.buildGame(mockConfig, GameType.RandomGame, players);

        expect(builtGame).to.equal(mockGame);
        expect(gameMultiplayerbuilder.buildGame.called).to.equal(true);
    });
});
