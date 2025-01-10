import { SinonStubbedInstance, createStubInstance, match } from 'sinon';
import { TimerController } from './timer-controller';
import { GameSessionNormal } from '@app/classes/game/game-session-normal';
import { TimerService } from '@app/services/timer.service';
import { expect } from 'chai';
import { Subject } from 'rxjs';
import { Client } from '@app/classes/client';
import { GameTimerSocketEvent } from '@common/enums/socket-event/game-timer-socket-event';
import { Question } from '@common/interfaces/question';
import { QuestionType } from '@common/enums/question-type';
import { QuestionWithIndex } from '@app/interfaces/question-with-index';
import { TIME_LIMIT_PANIC_MODE_QRL } from '@app/consts/game.const';
import { QUARTER_SECOND } from '@app/consts/timer.consts';
import { GameQuizHandlerService } from '@app/services/game/game-quiz-handler.service';
import { Quiz } from '@common/interfaces/quiz';

describe('TimerController', () => {
    let timerController: TimerController;

    let timerServiceStub: SinonStubbedInstance<TimerService>;
    let gameStub: SinonStubbedInstance<GameSessionNormal>;

    let organiserStub: SinonStubbedInstance<Client>;

    beforeEach(() => {
        timerServiceStub = createStubInstance(TimerService);
        organiserStub = createStubInstance(Client);

        gameStub = createStubInstance(GameSessionNormal);
        gameStub.getTimer.returns(timerServiceStub);

        gameStub.organizer = organiserStub;

        gameStub.questionEndedSubject = new Subject();
        gameStub.questionStartedSubject = new Subject();
        gameStub.removedGameSubject = new Subject();

        timerController = new TimerController(gameStub);
    });

    it('timer service property should return the game timer service', () => {
        expect(timerController['timerService']).to.equal(timerServiceStub);
    });

    it('onQuestionStarted event', () => {
        const mockQuestion = { type: QuestionType.QCM } as QuestionWithIndex;
        gameStub.getQuestion.returns(mockQuestion);
        gameStub.questionStartedSubject.next(mockQuestion);

        expect(organiserStub.emitToUser.calledWith(GameTimerSocketEvent.CanTogglePause, true));
        expect(organiserStub.emitToUser.calledWith(GameTimerSocketEvent.CanStartPanic, true));
    });

    it('onQuestionEnded event', () => {
        gameStub.questionEndedSubject.next({ type: QuestionType.QCM } as Question);

        expect(organiserStub.emitToUser.calledWith(GameTimerSocketEvent.CanTogglePause, false));
        expect(organiserStub.emitToUser.calledWith(GameTimerSocketEvent.CanStartPanic, false));
    });

    it('clear controller socket', () => {
        gameStub.removedGameSubject.next();

        expect(organiserStub.removeEventListeners.calledWith(GameTimerSocketEvent.TogglePause));
        expect(organiserStub.removeEventListeners.calledWith(GameTimerSocketEvent.StartPanic));
    });

    it('toggleTimerPause should be called when the TOGGLE_TIMER_PAUSE event is triggered', () => {
        timerController['initializeController']();

        const toggleTimerPauseCallback = organiserStub.onUserEvent.args.find((args) => args[0] === GameTimerSocketEvent.TogglePause)[1] as () => void;
        toggleTimerPauseCallback();

        expect(timerServiceStub.togglePause.calledOnce).to.equal(true);
    });

    it('StartTimerPanic should be called when the START_TIMER_PANIC event is triggered', () => {
        const gameMock = new GameSessionNormal(timerServiceStub, createStubInstance(GameQuizHandlerService), {
            gameId: 1,
            organizer: organiserStub,
            quiz: {} as Quiz,
        });

        timerController['game'] = gameMock;

        gameStub.players = [];

        timerController['initializeController']();

        const startTimerPanicCallback = organiserStub.onUserEvent.args.find((args) => args[0] === GameTimerSocketEvent.StartPanic)[1] as () => void;
        startTimerPanicCallback();

        expect(timerServiceStub.updateDelay.calledWith(QUARTER_SECOND)).to.equal(true);
        expect(organiserStub.emitToUser.calledWith(GameTimerSocketEvent.CanStartPanic, false)).to.equal(true);
        expect(organiserStub.emitToUser.calledWith(GameTimerSocketEvent.OnPanicModeStarted)).to.equal(true);
    });

    it('should set correct time limit and register callback for QRL question type', () => {
        const mockQuestionQRL = { type: QuestionType.QRL } as QuestionWithIndex;
        gameStub.getQuestion.returns(mockQuestionQRL);

        timerController['setPanicModeTimeLimit']();

        expect(timerServiceStub.setSpecificCallback.calledOnceWith(TIME_LIMIT_PANIC_MODE_QRL, match.func)).to.equal(true);

        const callback = timerServiceStub.setSpecificCallback.firstCall.args[1] as () => void;

        callback();
        expect(organiserStub.emitToUser.calledOnceWithExactly(GameTimerSocketEvent.CanStartPanic, false)).to.equal(true);
    });
});
