import { GameLobby } from '@app/classes/game/game-lobby';
import { Service } from 'typedi';
import { GameUsernameManager } from '@app/services/game/game-username-manager.service';
import { GameConfig } from '@app/interfaces/game-config';
import { Player } from '@app/interfaces/users/player';
import { GameType } from '@common/enums/game-type';
import { GameTestBuilderService } from './game-test-builder.service';
import { GameMultiplayerBuilderService } from './game-multiplayer-builder.service';
import { GameSessionNormal } from '@app/classes/game/game-session-normal';
import { GameSessionRandom } from '@app/classes/game/game-session-random';

@Service()
export class GameFactoryService {
    constructor(
        private gameTestBuilder: GameTestBuilderService,
        private gameMultiplayerBuilder: GameMultiplayerBuilderService,
    ) {}

    buildGame(gameConfig: GameConfig, gameType: GameType, players?: Player[]) {
        switch (gameType) {
            case GameType.LobbyGame:
                return this.buildGameLobby(gameConfig);
            case GameType.TestGame:
                return this.buildGameSessionTest(gameConfig);
            case GameType.NormalGame:
                return this.buildGameSessionNormal(gameConfig, players);
            case GameType.RandomGame:
                return this.buildGameSessionRandom(gameConfig, players);
        }
    }

    private buildGameLobby(gameConfig: GameConfig) {
        return new GameLobby(new GameUsernameManager(), gameConfig);
    }

    private buildGameSessionTest(gameConfig: GameConfig) {
        return this.gameTestBuilder.buildGame(gameConfig);
    }

    private buildGameSessionNormal(gameConfig: GameConfig, players: Player[]) {
        return this.gameMultiplayerBuilder.buildGame(GameSessionNormal, gameConfig, players);
    }

    private buildGameSessionRandom(gameConfig: GameConfig, players: Player[]) {
        return this.gameMultiplayerBuilder.buildGame(GameSessionRandom, gameConfig, players);
    }
}
