import { expect } from 'chai';
import { SinonStubbedInstance, createStubInstance, assert, stub } from 'sinon';
import { GameSessionBase } from '@app/classes/game/game-session-base';
import { Player } from '@app/interfaces/users/player';
import { AnswerCollector } from './answer-collector';
import { Subject } from 'rxjs';
import { AnswerManagerQRL } from './answer-managers/answer-manager-qrl.service';
import { AnswerManagerQCM } from './answer-managers/answer-manager-qcm.service';
import { QuestionType } from '@common/enums/question-type';
import { Client } from '@app/classes/client';
import { Question } from '@common/interfaces/question';
import { QuestionWithIndex } from '@app/interfaces/question-with-index';
import { UserRemoved } from '@app/interfaces/users/user-removed';
import { KickedOutMessage } from '@app/enums/kicked-out-message';
import { GameAnswerSocketEvent } from '@common/enums/socket-event/game-answer-socket-event';
import { GamePlayerSocketEvent } from '@common/enums/socket-event/game-player-socket-event';
import { GameManagementSocketEvent } from '@common/enums/socket-event/game-management-socket-event';

describe('AnswerCollector', () => {
    let answerCollector: AnswerCollector;
    let gameSessionStub: SinonStubbedInstance<GameSessionBase>;

    let answerManagerQRLStub: SinonStubbedInstance<AnswerManagerQRL>;
    let answerManagerQCMStub: SinonStubbedInstance<AnswerManagerQCM>;

    let playerStub: SinonStubbedInstance<Client>;
    let organizerStub: SinonStubbedInstance<Client>;

    beforeEach(() => {
        playerStub = createStubInstance(Client);

        organizerStub = createStubInstance(Client);

        gameSessionStub = createStubInstance(GameSessionBase);
        gameSessionStub.questionEndedSubject = new Subject();
        gameSessionStub.removedGameSubject = new Subject();
        gameSessionStub.removedUserSubject = new Subject();
        gameSessionStub.playersModifiedSubject = new Subject();

        gameSessionStub.players = [playerStub];
        gameSessionStub.organizer = organizerStub;

        answerManagerQRLStub = createStubInstance(AnswerManagerQRL);
        answerManagerQCMStub = createStubInstance(AnswerManagerQCM);

        answerCollector = new AnswerCollector(gameSessionStub, answerManagerQRLStub, answerManagerQCMStub);
    });

    it('should submit unanswered answers when question ends', () => {
        const player1 = createStubInstance(Client);

        gameSessionStub.getQuestion.returns({ type: QuestionType.QCM } as QuestionWithIndex);

        const playersWhichSubmited = new Set<Player>();
        playersWhichSubmited.add(player1 as unknown as Player);

        answerCollector['playersWhichSubmited'] = playersWhichSubmited;
        answerCollector['submitUnsubmitedAnswers']();

        assert.calledOnce(answerManagerQCMStub.finalizeAnswerSubmissions);
    });

    it('should reset answers and inform players of correction when correction finished', () => {
        const resetAnswerStub = stub(answerCollector as unknown as { resetAnswer: () => void }, 'resetAnswer');
        const informPlayerOfCorrectionStub = stub(answerCollector as unknown as { informPlayerOfCorrection: () => void }, 'informPlayerOfCorrection');

        answerCollector['onCorrectionFinished']();

        assert.calledOnce(gameSessionStub.correctionWasFinished);
        assert.calledOnce(resetAnswerStub);
        assert.calledOnce(informPlayerOfCorrectionStub);
    });

    it('should submit player answer and verify if it is the last answer', () => {
        const canPlayerSubmitStub = stub(answerCollector as unknown as { canPlayerSubmit: () => boolean }, 'canPlayerSubmit').returns(true);
        const verifyIfIsLastAnswerStub = stub(answerCollector as unknown as { verifyIfIsLastAnswer: () => void }, 'verifyIfIsLastAnswer');
        gameSessionStub.getQuestion.returns({ type: QuestionType.QCM } as QuestionWithIndex);

        answerCollector['submitPlayerAnswer'](playerStub);

        assert.calledOnce(canPlayerSubmitStub);
        assert.calledOnce(verifyIfIsLastAnswerStub);
        assert.calledOnce(answerManagerQCMStub.submitPlayerAnswer);
    });

    it('should reset answers', () => {
        answerCollector['playersWhichSubmited'] = new Set([playerStub]);
        answerCollector['resetAnswer']();

        expect(answerCollector['playersWhichSubmited'].size).to.equal(0);
    });

    it('should initialize player', () => {
        answerCollector['initializePlayer'](playerStub);

        assert.calledWith(playerStub.onUserEvent, GameAnswerSocketEvent.SubmitAnswer);
    });

    it('should set up game observer', () => {
        const questionEndedSubjectStub = new Subject<Question>();
        gameSessionStub.questionEndedSubject = questionEndedSubjectStub;

        const submitUnsubmitedAnswersStub = stub(answerCollector as unknown as { submitUnsubmitedAnswers: () => void }, 'submitUnsubmitedAnswers');

        answerCollector['setUpGameObserver'](gameSessionStub);

        questionEndedSubjectStub.next(undefined);

        assert.calledOnce(submitUnsubmitedAnswersStub);
    });

    it('should get answer manager based on question type', () => {
        gameSessionStub.getQuestion.returns({ type: QuestionType.QCM } as QuestionWithIndex);
        const answerManager = answerCollector['answerManager'];

        expect(answerManager).to.equal(answerManagerQCMStub);
    });

    it('should get answer manager based on question type', () => {
        gameSessionStub.getQuestion.returns({ type: QuestionType.QRL } as QuestionWithIndex);
        const answerManager = answerCollector['answerManager'];

        expect(answerManager).to.equal(answerManagerQRLStub);
    });

    it('should return true and emit ANSWER_COLLECTED_EVENT when player submits for the first time', () => {
        const player: Player = playerStub as unknown as Player;

        const result = answerCollector['canPlayerSubmit'](player);

        expect(result).to.equal(true);
        expect(answerCollector['playersWhichSubmited'].has(player)).to.equal(true);
        expect(playerStub.emitToUser.calledOnceWith(GameAnswerSocketEvent.AnswerCollected)).to.equal(true);
    });

    it('should return false when player has already submitted', () => {
        const player: Player = playerStub as unknown as Player;
        answerCollector['playersWhichSubmited'].add(player);

        const result = answerCollector['canPlayerSubmit'](player);

        expect(result).to.equal(false);
        expect(playerStub.emitToUser.called).to.equal(false);
    });

    it('should call allPlayerHaveSubmited when all players have submitted their answers', () => {
        const playersWhichSubmited = new Set<Player>();
        playersWhichSubmited.add(playerStub as unknown as Player);
        answerCollector['playersWhichSubmited'] = playersWhichSubmited;

        answerCollector['verifyIfIsLastAnswer']();

        assert.calledOnce(gameSessionStub.allPlayerHaveSubmited);
    });

    it('should not call allPlayerHaveSubmited when not all players have submitted their answers', () => {
        answerCollector['verifyIfIsLastAnswer']();

        assert.notCalled(gameSessionStub.allPlayerHaveSubmited);
    });

    it('should emit events to players and organizer', () => {
        answerCollector['informPlayerOfCorrection']();

        assert.calledWith(playerStub.emitToUser, GamePlayerSocketEvent.SendPlayerScore, playerStub.score);
        assert.calledWith(organizerStub.emitToUser, GamePlayerSocketEvent.SendPlayerStats);
        assert.calledWith(organizerStub.emitToUser, GameManagementSocketEvent.CanGoToNextQuestion);
    });

    it('should not submit answer twice for the same player', () => {
        gameSessionStub.getQuestion.returns({ type: QuestionType.QCM } as QuestionWithIndex);

        answerCollector['submitPlayerAnswer'](playerStub);
        answerCollector['submitPlayerAnswer'](playerStub);

        assert.calledOnce(answerManagerQCMStub.submitPlayerAnswer);
    });

    it('should call submitPlayerAnswer when SUBMIT_ANSWERS event is emitted', () => {
        const submitPlayerAnswerStub = stub(answerCollector as unknown as { submitPlayerAnswer: (player: Player) => void }, 'submitPlayerAnswer');
        answerCollector['initializePlayer'](playerStub);

        const [, callback] = playerStub.onUserEvent.args[0];
        (callback as (player: Player) => void)(playerStub);

        assert.calledOnce(submitPlayerAnswerStub);
        assert.calledWith(submitPlayerAnswerStub, playerStub);
    });

    it('should not call answerManagerQCM.submitAnswers if the answer is of type QRL', () => {
        gameSessionStub.getQuestion.returns({ type: QuestionType.QRL } as QuestionWithIndex);
        answerCollector['initializePlayer'](playerStub);

        const [, callback] = playerStub.onUserEvent.args[0];
        (callback as (player: Player) => void)(playerStub);

        assert.notCalled(answerManagerQCMStub.submitPlayerAnswer);
    });

    it('should remove playerEventCallback on game ended', () => {
        gameSessionStub.removedGameSubject.next();

        expect(playerStub.removeEventListeners.calledWith(GameAnswerSocketEvent.SubmitAnswer));
    });

    it('should remove playerEventCallback on userRemoved', () => {
        const mockUser = createStubInstance(Client);
        const mockUserRemoved: UserRemoved = {
            user: mockUser,
            reason: KickedOutMessage.EmptyMessage,
        };
        gameSessionStub.removedUserSubject.next(mockUserRemoved);

        expect(playerStub.removeEventListeners.calledWith(GameAnswerSocketEvent.SubmitAnswer));
    });

    it('clearPlayerSocket should not throw an error even if the player is undefined', () => {
        expect(() => answerCollector['clearPlayerSocket'](undefined)).not.to.throw();
    });
});
