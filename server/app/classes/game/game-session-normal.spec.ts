import { expect } from 'chai';
import { GameSessionNormal } from './game-session-normal';
import { Player } from '@app/interfaces/users/player';
import { restore, stub, spy, createStubInstance, SinonStubbedInstance } from 'sinon';
import { TimerService } from '@app/services/timer.service';
import { GameQuizHandlerService } from '@app/services/game/game-quiz-handler.service';
import { GameConfig } from '@app/interfaces/game-config';
import { Quiz } from '@common/interfaces/quiz';
import { Client } from '@app/classes/client';
import { GameSessionBase } from './game-session-base';
import { QuestionType } from '@common/enums/question-type';
import { QuestionWithIndex } from '@app/interfaces/question-with-index';
import { KickedOutMessage } from '@app/enums/kicked-out-message';
import { GamePlayerSocketEvent } from '@common/enums/socket-event/game-player-socket-event';

describe('GameSessionNormal', () => {
    let gameSessionNormal: GameSessionNormal;

    let timerServiceStub: SinonStubbedInstance<TimerService>;
    let gameQuizHandlerServiceStub: SinonStubbedInstance<GameQuizHandlerService>;

    let gameConfigMock: GameConfig;

    let organizer: SinonStubbedInstance<Client>;
    let player1: SinonStubbedInstance<Client>;
    let player2: SinonStubbedInstance<Client>;

    let players: Player[];

    beforeEach(() => {
        organizer = createStubInstance(Client);
        player1 = createStubInstance(Client);
        player2 = createStubInstance(Client);
        players = [player1, player2];

        gameConfigMock = { gameId: 123, organizer, quiz: {} as Quiz };
        timerServiceStub = createStubInstance(TimerService);
        timerServiceStub.setStopCondition.returns(timerServiceStub);
        timerServiceStub.setOnTickCallBack.returns(timerServiceStub);
        timerServiceStub.setOnTimerEndedCallback.returns(timerServiceStub);

        gameQuizHandlerServiceStub = createStubInstance(GameQuizHandlerService);
        gameSessionNormal = new GameSessionNormal(timerServiceStub, gameQuizHandlerServiceStub, gameConfigMock);
    });

    afterEach(() => {
        restore();
    });

    describe('setUp', () => {
        it('should call super.setUp() and showIntermission', () => {
            const showLoadingStub = stub(gameSessionNormal as unknown as { showLoading: () => void }, 'showLoading');

            gameSessionNormal.setUp();
            expect(showLoadingStub.called).to.equal(true);
        });
    });

    it('should set players and remove players without names', () => {
        player2.name = 'mockName';
        player1.name = '';
        gameSessionNormal.setPlayers(players);

        expect(gameSessionNormal['players']).to.deep.equal([player2]);
    });

    describe('continueQuiz', () => {
        it('should call super.continueQuiz if canGoToNextQuestion is true', () => {
            gameSessionNormal['canGoToNextQuestion'] = true;
            gameSessionNormal.continueQuiz();

            expect(gameQuizHandlerServiceStub.goToNextQuestion.called).to.equal(true);
        });

        it('should not call super.continueQuiz if canGoToNextQuestion is false', () => {
            gameSessionNormal['canGoToNextQuestion'] = false;
            gameSessionNormal.continueQuiz();

            expect(gameQuizHandlerServiceStub.goToNextQuestion.called).to.equal(false);
        });
    });

    describe('removePlayer', () => {
        it('should return false if super.removePlayer returns false', () => {
            const playerToRemove: Player = {} as Player;
            const superRemovePlayerStub = stub(GameSessionBase.prototype, 'removePlayer').returns(false);

            const result = gameSessionNormal.removePlayer(playerToRemove);

            expect(result).to.equal(false);

            superRemovePlayerStub.restore();
        });

        it('should return true if super.removePlayer returns true and players are still left', () => {
            const playerToRemove: Player = {} as Player;
            stub(GameSessionNormal.prototype, 'removePlayer').returns(true);
            stub(gameSessionNormal as unknown as { areTherePlayerLeft: () => boolean }, 'areTherePlayerLeft').returns(true);

            const result = gameSessionNormal.removePlayer(playerToRemove);

            expect(result).to.equal(true);
        });

        it('should remove all players and notify the organizer if no players are left after removal', () => {
            stub(GameSessionBase.prototype, 'removePlayer').returns(true);

            stub(gameSessionNormal as unknown as { areTherePlayerLeft: () => boolean }, 'areTherePlayerLeft').returns(false);

            gameSessionNormal['organizer'] = organizer;

            const result = gameSessionNormal.removePlayer({} as Player);

            expect(result).to.equal(true);
            expect(organizer.emitToUser.calledWith(GamePlayerSocketEvent.PlayerRemovedFromGame, KickedOutMessage.NoPlayerLeft));
        });

        it('should not update organizer if it is not defined', () => {
            const playerToRemove: Player = {} as Player;

            stub(GameSessionBase.prototype, 'removePlayer').returns(true);
            stub(gameSessionNormal as unknown as { areTherePlayerLeft: () => boolean }, 'areTherePlayerLeft').returns(false);

            gameSessionNormal['organizer'] = undefined;
            const result = gameSessionNormal.removePlayer(playerToRemove);

            expect(result).to.equal(true);
            expect(organizer.emitToUser.calledWith(GamePlayerSocketEvent.PlayerRemovedFromGame)).to.equal(false);
        });
    });

    describe('showNextQuestion()', () => {
        it('should set canGoToNextQuestion to false and call sendCorrectAnswers()', () => {
            const superShowNestQuestionSpy = spy(GameSessionNormal.prototype as unknown as { showNextQuestion: () => void }, 'showNextQuestion');
            gameQuizHandlerServiceStub.getQuestion.returns({ type: QuestionType.QCM } as QuestionWithIndex);

            gameSessionNormal['showNextQuestion']();

            expect(gameSessionNormal['canGoToNextQuestion']).to.equal(false);
            expect(superShowNestQuestionSpy.called).to.equal(true);
        });
    });

    describe('onFinishedAllQuestions', () => {
        it('should call super.onFinishedGame()', () => {
            const onFinishedGameStub = spy(gameSessionNormal as unknown as { onFinishedAllQuestions: () => void }, 'onFinishedAllQuestions');

            gameSessionNormal['onFinishedAllQuestions']();

            expect(onFinishedGameStub.calledOnce).to.equal(true);
        });
    });

    it('correction was finished', () => {
        const onCorrectionFinishedSuper = spy(gameSessionNormal as unknown as { correctionWasFinished: () => void }, 'correctionWasFinished');

        gameSessionNormal['correctionWasFinished']();

        expect(onCorrectionFinishedSuper.called).to.equal(true);
        expect(gameSessionNormal['canGoToNextQuestion']).to.equal(true);
    });
});
