import { expect } from 'chai';
import { GameSessionTest } from './game-session-test';
import { stub, spy, restore, createStubInstance, SinonStubbedInstance } from 'sinon';
import { TimerService } from '@app/services/timer.service';
import { GameQuizHandlerService } from '@app/services/game/game-quiz-handler.service';
import { GameConfig } from '@app/interfaces/game-config';
import { Quiz } from '@common/interfaces/quiz';
import { Client } from '@app/classes/client';
import { GameSessionBase } from './game-session-base';
import { QuestionType } from '@common/enums/question-type';
import { QuestionWithIndex } from '@app/interfaces/question-with-index';
import { GamePlaySocketEvent } from '@common/enums/socket-event/game-play-socket-event';

describe('GameSessionTest', () => {
    let gameSessionTest: GameSessionTest;

    let organizer: SinonStubbedInstance<Client>;

    let timerServiceStub: SinonStubbedInstance<TimerService>;
    let gameQuizHandlerServiceStub: SinonStubbedInstance<GameQuizHandlerService>;

    let gameConfigMock: GameConfig;

    beforeEach(() => {
        organizer = createStubInstance(Client);

        gameConfigMock = { gameId: 123, organizer, quiz: {} as Quiz };
        timerServiceStub = createStubInstance(TimerService);
        timerServiceStub.setStopCondition.returns(timerServiceStub);
        timerServiceStub.setOnTickCallBack.returns(timerServiceStub);
        timerServiceStub.setOnTimerEndedCallback.returns(timerServiceStub);

        gameQuizHandlerServiceStub = createStubInstance(GameQuizHandlerService);

        gameSessionTest = new GameSessionTest(timerServiceStub, gameQuizHandlerServiceStub, gameConfigMock);
    });

    afterEach(() => {
        restore();
    });

    describe('setUp', () => {
        it('should initialize the player and call super.setUp()', () => {
            const superSetup = spy(GameSessionTest.prototype, 'setUp');
            const showNextQuestion = spy(gameSessionTest as unknown as { showNextQuestion: () => void }, 'showNextQuestion');
            gameQuizHandlerServiceStub.getQuestion.returns({ type: QuestionType.QCM } as QuestionWithIndex);

            gameSessionTest.setUp();

            expect(superSetup.called).to.equal(true);
            expect(showNextQuestion.called).to.equal(true);
        });
    });

    describe('removePlayer', () => {
        it('should remove the player and clear the game', () => {
            const playerToRemove = createStubInstance(Client);
            const superRemovePlayerStub = stub(GameSessionBase.prototype, 'removePlayer').returns(true);
            const clearGameStub = spy(gameSessionTest as unknown as { clearGame: () => void }, 'clearGame');

            const result = gameSessionTest.removePlayer(playerToRemove);

            expect(result).to.equal(true);
            expect(superRemovePlayerStub.calledOnceWithExactly(playerToRemove)).to.equal(true);
            expect(clearGameStub.called).to.equal(true);
        });

        it('should not clear the game if super.removePlayer returns false', () => {
            const playerToRemove = createStubInstance(Client);
            const superRemovePlayerStub = stub(GameSessionBase.prototype, 'removePlayer').returns(false);
            const clearGameStub = spy(gameSessionTest as unknown as { clearGame: () => void }, 'clearGame');

            const result = gameSessionTest.removePlayer(playerToRemove);

            expect(result).to.equal(false);
            expect(superRemovePlayerStub.calledOnceWithExactly(playerToRemove)).to.equal(true);
            expect(clearGameStub.called).to.equal(false);
        });
    });

    describe('onFinishedGame', () => {
        it('should call onFinishedTestGame method of organizer playingComponent', () => {
            gameSessionTest['organizer'] = organizer;
            gameSessionTest['onFinishedGame']();

            expect(organizer.emitToUser.calledWith(GamePlaySocketEvent.FinishedTestGame)).to.equal(true);
        });
    });

    it('correction was finished', () => {
        const onCorrectionFinishedSuper = spy(gameSessionTest as unknown as { correctionWasFinished: () => void }, 'correctionWasFinished');
        const continueQuizSpy = stub(gameSessionTest, 'continueQuiz');

        gameSessionTest['correctionWasFinished']();

        expect(onCorrectionFinishedSuper.called).to.equal(true);
        expect(continueQuizSpy.called).to.equal(true);
    });

    it('shouldGoToCorrection', () => {
        expect(gameSessionTest['shouldGoToCorrectionState']()).to.equal(false);
    });
});
