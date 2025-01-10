import { Player } from '@app/interfaces/users/player';
import { GameSessionBase } from './game-session-base';
import { GameConfig } from '@app/interfaces/game-config';
import { GameQuizHandlerService } from '@app/services/game/game-quiz-handler.service';
import { TimerService } from '@app/services/timer.service';
import { GamePlaySocketEvent } from '@common/enums/socket-event/game-play-socket-event';

export class GameSessionTest extends GameSessionBase {
    constructor(timerService: TimerService, quizHandler: GameQuizHandlerService, gameConfig: GameConfig) {
        super(timerService, quizHandler, gameConfig);
        this.initializePlayer(this.organizer as unknown as Player);
    }

    get users() {
        return this.players;
    }

    setUp() {
        super.setUp();
        this.showNextQuestion();
    }

    removePlayer(playerToRemove: Player): boolean {
        if (!super.removePlayer(playerToRemove)) return false;
        this.clearGame();
        return true;
    }

    correctionWasFinished(): void {
        super.correctionWasFinished();
        this.continueQuiz();
    }

    protected shouldGoToCorrectionState(): boolean {
        return false;
    }

    protected onFinishedGame(): void {
        super.onFinishedGame();
        this.removeOrganizerIntern();
        this.organizer.emitToUser(GamePlaySocketEvent.FinishedTestGame);
    }

    private initializePlayer(player: Player) {
        this.players = [player];
    }
}
