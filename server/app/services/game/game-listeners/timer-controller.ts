import { Service } from 'typedi';
import { BaseGameObserver } from './base-observer';
import { GameSessionBase } from '@app/classes/game/game-session-base';
import { GameTimerSocketEvent } from '@common/enums/socket-event/game-timer-socket-event';
import { QUARTER_SECOND } from '@app/consts/timer.consts';
import { QuestionType } from '@common/enums/question-type';
import { TIME_LIMIT_PANIC_MODE_QCM, TIME_LIMIT_PANIC_MODE_QRL } from '@app/consts/game.const';

@Service({ transient: true })
export class TimerController extends BaseGameObserver {
    constructor(game: GameSessionBase) {
        super(game);
        this.initializeController();
    }

    private get timerService() {
        return this.game.getTimer();
    }

    protected setUpGameObserver(game: GameSessionBase): void {
        game.removedGameSubject.subscribe(() => this.clearControllerSocket());
        game.questionStartedSubject.subscribe(() => this.onQuestionStarted());
        game.questionEndedSubject.subscribe(() => this.onQuestionEnded());
    }

    private onQuestionStarted() {
        this.organizer.emitToUser(GameTimerSocketEvent.CanTogglePause, true);
        this.organizer.emitToUser(GameTimerSocketEvent.CanStartPanic, true);
        this.setPanicModeTimeLimit();
    }

    private onQuestionEnded() {
        this.timerService.clearSpecificCallback();
        this.organizer.emitToUser(GameTimerSocketEvent.CanTogglePause, false);
        this.organizer.emitToUser(GameTimerSocketEvent.CanStartPanic, false);
    }

    private initializeController() {
        this.organizer.onUserEvent(GameTimerSocketEvent.TogglePause, () => this.toggleTimerPause());
        this.organizer.onUserEvent(GameTimerSocketEvent.StartPanic, () => this.startTimerPanic());
    }

    private clearControllerSocket() {
        this.organizer.removeEventListeners(GameTimerSocketEvent.TogglePause);
        this.organizer.removeEventListeners(GameTimerSocketEvent.StartPanic);
    }

    private toggleTimerPause() {
        this.timerService.togglePause();
    }

    private startTimerPanic() {
        this.timerService.updateDelay(QUARTER_SECOND);
        this.organizer.emitToUser(GameTimerSocketEvent.CanStartPanic, false);
        this.users.forEach((user) => user.emitToUser(GameTimerSocketEvent.OnPanicModeStarted));
    }

    private setPanicModeTimeLimit() {
        const timeLimit = this.question.type === QuestionType.QCM ? TIME_LIMIT_PANIC_MODE_QCM : TIME_LIMIT_PANIC_MODE_QRL;
        this.timerService.setSpecificCallback(timeLimit, () => this.organizer.emitToUser(GameTimerSocketEvent.CanStartPanic, false));
    }
}
