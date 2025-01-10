import { Service } from 'typedi';
import { GAME_ID_MINIMUM, GAME_ID_RANGE } from '@app/consts/game.const';
import { GameBase } from '@app/classes/game/game-base';
import { Quiz } from '@common/interfaces/quiz';
import { DataManagerService } from '@app/services/data/data-manager.service';
import { GameFactoryService } from './game-factory/game-factory.service';
import { GameConfig } from '@app/interfaces/game-config';
import { GameType } from '@common/enums/game-type';
import { User } from '@app/interfaces/users/user';
import { QUIZ_COLLECTION } from '@app/consts/database.consts';
import { GameLobby } from '@app/classes/game/game-lobby';
import { GameRandomManagerService } from './game-random-manager.service';
import { RANDOM_QUIZ_ID } from '@common/config/game-config';

@Service()
export class GameManagerService {
    private games: Map<number, GameBase> = new Map();

    constructor(
        private dataManagerService: DataManagerService<Quiz>,
        private gameBuilderService: GameFactoryService,
        private gameRandomManagerService: GameRandomManagerService,
    ) {
        this.dataManagerService.setCollection(QUIZ_COLLECTION);
    }

    async createGameLobby(organiser: User, quizId: string): Promise<GameBase> {
        const futureGameType = quizId === RANDOM_QUIZ_ID ? GameType.RandomGame : GameType.NormalGame;
        const config = await this.generateGameConfig(organiser, quizId, futureGameType);
        return this.createGameIntern(GameType.LobbyGame, config);
    }

    async createTestGame(organiser: User, quizId: string): Promise<GameBase> {
        const config = await this.generateGameConfig(organiser, quizId);
        return this.createGameIntern(GameType.TestGame, config);
    }

    async createNormalGame(gameLobby: GameLobby): Promise<GameBase> {
        this.removeGame(gameLobby.gameId);
        const gameSession = this.gameBuilderService.buildGame(gameLobby.getGameConfig(), gameLobby.futureGameType, gameLobby.players);
        return this.addGame(gameSession);
    }

    getGameById(gameId: number): GameBase {
        return this.games.get(gameId);
    }

    removeGame(gameId: number) {
        this.games.delete(gameId);
    }

    private async getQuizById(quizId: string) {
        return await this.dataManagerService.getElementById(quizId);
    }

    private addGame(game: GameBase): GameBase {
        this.games.set(game.gameId, game);
        game.removedGameSubject.subscribe(() => this.removeGame(game.gameId));
        return game;
    }

    private async createGameIntern(gameType: GameType, gameconfig: GameConfig) {
        if (!gameconfig) return undefined;
        const newLobby = this.gameBuilderService.buildGame(gameconfig, gameType);
        return this.addGame(newLobby);
    }

    private async generateGameConfig(organiser: User, quizId: string, futureGameType?: GameType): Promise<GameConfig> {
        const quiz = quizId === RANDOM_QUIZ_ID ? await this.gameRandomManagerService.createRandomQuiz() : await this.getQuizById(quizId);
        return quiz ? { organizer: organiser, gameId: this.generateGameId(), quiz, futureGameType } : undefined;
    }

    private generateGameId(): number {
        const newId = Math.floor(Math.random() * GAME_ID_RANGE) + GAME_ID_MINIMUM;
        return this.games.has(newId) ? this.generateGameId() : newId;
    }
}
