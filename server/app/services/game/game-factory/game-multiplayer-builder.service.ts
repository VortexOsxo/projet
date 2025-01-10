import { GameConfig } from '@app/interfaces/game-config';
import { Container, Service } from 'typedi';
import { GameQuizHandlerService } from '@app/services/game/game-quiz-handler.service';
import { TimerService } from '@app/services/timer.service';
import { AnswerCollector } from '@app/services/game/game-listeners/answer-collector';
import { GameSessionBase } from '@app/classes/game/game-session-base';
import { QuestionManager } from '@app/services/game/game-listeners/question-manager';
import { Player } from '@app/interfaces/users/player';
import { GameSessionMultiplayer } from '@app/classes/game/game-session-multiplayer';
import { TimerController } from '@app/services/game/game-listeners/timer-controller';
import { HistoryObserver } from '@app/services/game/game-listeners/history-observer.service';
import { PlayerStateManager } from '@app/services/game/game-listeners/player-state-manager.service';

type ConstructorType = new (timerService: TimerService, quizHandler: GameQuizHandlerService, gameConfig: GameConfig) => GameSessionMultiplayer;

@Service()
export class GameMultiplayerBuilderService {
    buildGame(gameConstructor: ConstructorType, gameConfig: GameConfig, players: Player[]) {
        const gameQuizHandler = new GameQuizHandlerService(gameConfig.quiz);
        const gameNormal = new gameConstructor(new TimerService(), gameQuizHandler, gameConfig);
        gameNormal.setPlayers(players);

        this.setUpGameObservers(gameNormal);

        gameNormal.setUp();
        return gameNormal;
    }

    private setUpGameObservers(gameNormal: GameSessionMultiplayer) {
        Container.set(GameSessionBase, gameNormal);
        Container.get(AnswerCollector);
        Container.get(QuestionManager);
        Container.get(TimerController);
        Container.get(HistoryObserver);
        Container.get(PlayerStateManager);
    }
}
