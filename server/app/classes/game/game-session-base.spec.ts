import { expect } from 'chai';
import { SinonStubbedInstance, stub, createStubInstance, restore, SinonSpy, spy } from 'sinon';
import { TimerService } from '@app/services/timer.service';
import { GameQuizHandlerService } from '@app/services/game/game-quiz-handler.service';
import { GameConfig } from '@app/interfaces/game-config';
import { Quiz } from '@common/interfaces/quiz';
import { GameSessionBase } from './game-session-base';
import { Client } from '@app/classes/client';
import { Subject } from 'rxjs';
import { ClientState } from '@app/enums/client-state';
import { UserGameState } from '@common/enums/user-game-state';
import { ANSWER_TIME_QRL, GAME_INTERMISSION_TIME, GAME_LOADING_SCREEN_TIME } from '@app/consts/game.const';
import { QuestionWithIndex } from '@app/interfaces/question-with-index';
import { QuestionType } from '@common/enums/question-type';
import { GamePlaySocketEvent } from '@common/enums/socket-event/game-play-socket-event';

describe('GameSessionBase', () => {
    let gameSession: GameSessionBase;
    let timerServiceStub: SinonStubbedInstance<TimerService>;
    let gameQuizHandlerServiceStub: SinonStubbedInstance<GameQuizHandlerService>;
    let gameConfigMock: GameConfig;

    let organizer: SinonStubbedInstance<Client>;
    let player1: SinonStubbedInstance<Client>;
    let player2: SinonStubbedInstance<Client>;

    let updateStateSpy: SinonSpy;

    beforeEach(() => {
        organizer = createStubInstance(Client);
        player1 = createStubInstance(Client);
        player2 = createStubInstance(Client);

        timerServiceStub = createStubInstance(TimerService);

        timerServiceStub.setOnTimerEndedCallback.callsFake((callback) => {
            callback();
            return timerServiceStub;
        });

        timerServiceStub.setStopCondition.callsFake((callback) => {
            callback();
            return timerServiceStub;
        });

        timerServiceStub.resetStopCondition.callsFake(() => {
            return timerServiceStub;
        });

        gameConfigMock = { gameId: 123, organizer, quiz: {} as Quiz };

        gameQuizHandlerServiceStub = createStubInstance(GameQuizHandlerService);
        gameQuizHandlerServiceStub.getQuestion.returns({ type: QuestionType.QCM } as QuestionWithIndex);

        gameSession = new GameSessionBase(timerServiceStub, gameQuizHandlerServiceStub, gameConfigMock);
        gameSession['players'] = [player1, player2];

        updateStateSpy = spy(gameSession as unknown as { updateUsersState: (state: ClientState) => void }, 'updateUsersState');
    });

    afterEach(() => {
        restore();
    });

    it('get question should return the quiz handler question', () => {
        const mockQuestion = {} as QuestionWithIndex;
        gameQuizHandlerServiceStub.getQuestion.returns(mockQuestion);

        expect(gameSession.getQuestion()).to.equal(mockQuestion);
    });

    it('should setup the game class properly on setup', () => {
        const tickValueMock = 13;

        gameSession.setUp();

        expect(timerServiceStub.setOnTickCallBack.called).to.equal(true);

        const args = timerServiceStub.setOnTickCallBack.firstCall.args;
        const callback = args[0];
        callback(tickValueMock);

        expect(organizer.emitToUser.calledWith(GamePlaySocketEvent.TimerTicked, tickValueMock));
    });

    it('should emit quizStartedSubject when setUp is called', (done) => {
        gameSession.quizStartedSubject.subscribe(() => {
            done();
        });
        gameSession.setUp();
    });

    it('should update user states to InGame when correction is finished', () => {
        gameSession.correctionWasFinished();

        expect(updateStateSpy.calledWith(UserGameState.InGame)).to.equal(true);
    });

    describe('continueQuiz', () => {
        it('should go to the next question if the quiz is not finished', () => {
            const nextQuestionTransitionStub = stub(gameSession as unknown as { nextQuestionTransition: () => void }, 'nextQuestionTransition');

            gameQuizHandlerServiceStub.goToNextQuestion.returns(undefined);

            gameSession.continueQuiz();

            expect(gameQuizHandlerServiceStub.goToNextQuestion.called).to.equal(true);
            expect(nextQuestionTransitionStub.calledOnce).to.equal(true);
        });

        it('should finish the quiz if it is finished', () => {
            const onFinishedAllQuestionsStub = stub(gameSession as unknown as { onFinishedAllQuestions: () => void }, 'onFinishedAllQuestions');

            gameQuizHandlerServiceStub.isQuizFinished.returns(true);

            gameSession.continueQuiz();

            expect(gameQuizHandlerServiceStub.goToNextQuestion.called).to.equal(true);
            expect(onFinishedAllQuestionsStub.calledOnce).to.equal(true);
        });
    });

    it('should be able to indicate that all players have answered', () => {
        gameSession.allPlayerHaveSubmited();

        expect(gameSession['hasAllPlayersSubmited']).to.equal(true);
    });

    it('should stop timer service', () => {
        gameSession['clearGame']();
        expect(timerServiceStub.stopTimer.calledOnce).to.equal(true);
    });

    it('should return true when there are no players left to answer', () => {
        gameSession['hasAllPlayersSubmited'] = true;
        const result = gameSession['stopTimerCondition']();
        expect(result).to.equal(true);
    });

    it('should return false when there are players left to answer', () => {
        gameSession['hasAllPlayersSubmited'] = false;
        const result = gameSession['stopTimerCondition']();
        expect(result).to.equal(false);
    });

    it('should set hasAllPlayersSubmited to false', () => {
        gameSession['hasAllPlayersSubmited'] = true;

        gameSession['showNextQuestion']();

        expect(gameSession['hasAllPlayersSubmited']).to.equal(false);
    });

    it('should emit questionStartedSubject with the current question', () => {
        const questionStartedSubjectStub = createStubInstance(Subject);
        gameSession['questionStartedSubject'] = questionStartedSubjectStub;

        gameSession['showNextQuestion']();

        expect(questionStartedSubjectStub.next.called).to.equal(true);
    });

    it('should update users state to InGame', () => {
        gameSession['showNextQuestion']();

        expect(updateStateSpy.calledOnceWith(UserGameState.InGame)).to.equal(true);
    });

    it('should set timer for next question transition', () => {
        const onShowNextQuestionStub = spy(gameSession as unknown as { showNextQuestion: () => void }, 'showNextQuestion');

        gameSession['nextQuestionTransition']();

        expect(timerServiceStub.setOnTimerEndedCallback.called).to.equal(true);
        const callback = timerServiceStub.setOnTimerEndedCallback.firstCall.args[0];
        callback();

        expect(onShowNextQuestionStub.called).to.equal(true);

        expect(timerServiceStub.startTimer.calledWith(GAME_INTERMISSION_TIME)).to.equal(true);
    });

    it('should set timer for finishing all questions', () => {
        const onFinishedGameStub = spy(gameSession as unknown as { onFinishedGame: () => void }, 'onFinishedGame');

        gameSession['onFinishedAllQuestions']();

        expect(timerServiceStub.setOnTimerEndedCallback.calledOnce).to.equal(true);
        const callback = timerServiceStub.setOnTimerEndedCallback.firstCall.args[0];
        callback();

        expect(onFinishedGameStub.called).to.equal(true);
        expect(timerServiceStub.startTimer.calledOnceWithExactly(GAME_INTERMISSION_TIME)).to.equal(true);
    });

    it('should set intermission', () => {
        gameSession['showIntermission']();

        expect(updateStateSpy.calledWith(UserGameState.Intermission)).to.equal(true);
        expect(timerServiceStub.startTimer.calledWith(GAME_INTERMISSION_TIME));
    });

    it('should set loading', () => {
        gameSession['showLoading']();

        expect(updateStateSpy.calledWith(UserGameState.Loading)).to.equal(true);
        expect(timerServiceStub.startTimer.calledWith(GAME_LOADING_SCREEN_TIME));
    });

    it('should return correct timer duration for QCM questions', () => {
        const quizDuration = 30;
        const question: QuestionWithIndex = { type: QuestionType.QCM } as QuestionWithIndex;
        gameQuizHandlerServiceStub.getQuestion.returns(question);
        gameSession['quiz'] = { duration: quizDuration } as Quiz;

        const timerDuration = gameSession['getTimerDuration']();

        expect(timerDuration).to.equal(quizDuration);
    });

    it('should return ANSWER_TIME_QRL for non-QCM questions', () => {
        const question: QuestionWithIndex = { type: QuestionType.QRL } as QuestionWithIndex;
        gameQuizHandlerServiceStub.getQuestion.returns(question);

        const timerDuration = gameSession['getTimerDuration']();

        expect(timerDuration).to.equal(ANSWER_TIME_QRL);
    });

    it('should update users state to Correction if shouldGoToCorrectionState returns true', () => {
        gameQuizHandlerServiceStub.getQuestion.returns({ type: QuestionType.QRL } as QuestionWithIndex);

        gameSession['questionTimerExpired']();

        expect(updateStateSpy.calledWith(UserGameState.Correction)).to.equal(true);
    });
});
