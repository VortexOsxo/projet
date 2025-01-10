import { GameConfig } from '@app/interfaces/game-config';
import { Service, Container } from 'typedi';
import { GameQuizHandlerService } from '@app/services/game/game-quiz-handler.service';
import { GameSessionTest } from '@app/classes/game/game-session-test';
import { TimerService } from '@app/services/timer.service';
import { AnswerCollector } from '@app/services/game/game-listeners/answer-collector';
import { GameSessionBase } from '@app/classes/game/game-session-base';
import { QuestionManager } from '@app/services/game/game-listeners/question-manager';
import { AnswerManagerQRLTest } from '@app/services/game/game-listeners/answer-managers/answer-manager-qrl-test';
import { AnswerManagerQRL } from '@app/services/game/game-listeners/answer-managers/answer-manager-qrl.service';
import { AnswerManagerQCM } from '@app/services/game/game-listeners/answer-managers/answer-manager-qcm.service';

@Service()
export class GameTestBuilderService {
    buildGame(gameConfig: GameConfig) {
        const gameQuizHandler = new GameQuizHandlerService(gameConfig.quiz);
        const gameTest = new GameSessionTest(new TimerService(), gameQuizHandler, gameConfig);

        this.setUpGameObservers(gameTest);

        gameTest.setUp();
        return gameTest;
    }

    private setUpGameObservers(gameTest: GameSessionTest) {
        Container.set(GameSessionBase, gameTest);
        new AnswerCollector(gameTest, this.getAnswerManager(), Container.get(AnswerManagerQCM));
        Container.get(QuestionManager);
    }

    private getAnswerManager(): AnswerManagerQRL {
        return Container.get(AnswerManagerQRLTest) as unknown as AnswerManagerQRL;
    }
}
