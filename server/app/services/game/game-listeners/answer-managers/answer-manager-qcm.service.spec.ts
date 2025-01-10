import { expect } from 'chai';
import { SinonStubbedInstance, createStubInstance, assert, stub } from 'sinon';
import { AnswerManagerQCM } from './answer-manager-qcm.service';
import { AnswerQCMCorrectorService } from '@app/services/game/answer/answer-qcm-corrector.service';
import { AnswerStatsQCMService } from '@app/services/game/answer/answer-stats-qcm.service';
import { GameSessionBase } from '@app/classes/game/game-session-base';
import { Client } from '@app/classes/client';
import { Subject } from 'rxjs';
import { QuestionType } from '@common/enums/question-type';
import { QuestionWithIndex } from '@app/interfaces/question-with-index';
import { UserRemoved } from '@app/interfaces/users/user-removed';
import { GameAnswerSocketEvent } from '@common/enums/socket-event/game-answer-socket-event';

describe('AnswerManagerQCM', () => {
    let answerManager: AnswerManagerQCM;
    let gameSessionStub: SinonStubbedInstance<GameSessionBase>;
    let answerCorrectorStub: SinonStubbedInstance<AnswerQCMCorrectorService>;
    let answerStatsStub: SinonStubbedInstance<AnswerStatsQCMService>;

    let playerStub: SinonStubbedInstance<Client>;

    beforeEach(() => {
        playerStub = createStubInstance(Client);

        gameSessionStub = createStubInstance(GameSessionBase);
        gameSessionStub.quizEndedSubject = new Subject();
        gameSessionStub.questionStartedSubject = new Subject();
        gameSessionStub.removedGameSubject = new Subject();
        gameSessionStub.removedUserSubject = new Subject();
        gameSessionStub.playersModifiedSubject = new Subject();

        gameSessionStub.players = [playerStub];

        gameSessionStub.getQuestion.returns({ type: QuestionType.QCM } as QuestionWithIndex);

        answerCorrectorStub = createStubInstance(AnswerQCMCorrectorService);
        answerStatsStub = createStubInstance(AnswerStatsQCMService);

        answerManager = new AnswerManagerQCM(gameSessionStub, answerCorrectorStub, answerStatsStub);
    });

    describe('toggleAnswerChoice', () => {
        it('should toggle answer choice and update choice stats', () => {
            answerManager.toggleAnswerChoice(playerStub, 2);

            const updatedSubmission = answerManager['playerSubmissions'].get(playerStub);
            expect(updatedSubmission).to.deep.equal([2]);

            assert.calledOnce(answerStatsStub.updateChoiceStats);
            assert.calledWithExactly(answerStatsStub.updateChoiceStats, answerManager['playerSubmissions'], answerManager['question'].index);
        });

        it('should not toggle answer choice when choice index is invalid', () => {
            answerManager.toggleAnswerChoice(playerStub, undefined);

            const updatedSubmission = answerManager['playerSubmissions'].get(playerStub);
            expect(updatedSubmission).to.equal(undefined);

            assert.notCalled(answerStatsStub.updateChoiceStats);
        });
    });

    it('should call sendStatsToPlayers', () => {
        answerManager['onQuizEnded']();
        assert.calledOnce(answerStatsStub.sendStatsToPlayers);
    });

    it('should return true if player claimed bonus or is only player', () => {
        answerManager['playerWhoClaimedBonus'] = playerStub;
        expect(answerManager['doesPlayerGetbonus'](playerStub)).to.equal(true);

        answerManager['playerWhoClaimedBonus'] = undefined;
        expect(answerManager['doesPlayerGetbonus'](playerStub)).to.equal(true);

        answerManager['playerWhoClaimedBonus'] = undefined;
        gameSessionStub.players = [playerStub, createStubInstance(Client)];
        expect(answerManager['doesPlayerGetbonus'](playerStub)).to.equal(false);
    });

    it('should call scorePlayerAnswers with correct arguments', () => {
        answerManager['scorePlayerAnswer'](playerStub);

        assert.calledOnce(answerCorrectorStub.scorePlayerAnswers);
    });

    it('should add choiceIndex to currentSelection if not found in array', () => {
        const currentSelection = [1, 2];

        answerManager['playerSubmissions'].set(playerStub, currentSelection);
        answerManager['updatePlayerSelection'](playerStub, 0);

        const updatedSelection = answerManager['playerSubmissions'].get(playerStub);
        expect(updatedSelection).to.deep.equal([1, 2, 0]);
    });

    it('should remove choiceIndex from currentSelection if found in array', () => {
        const player = playerStub;
        const choiceIndex = 1;
        const currentSelection = [1, 2, 3];

        answerManager['playerSubmissions'].set(player, currentSelection);

        answerManager['updatePlayerSelection'](player, choiceIndex);

        const updatedSelection = answerManager['playerSubmissions'].get(player);
        expect(updatedSelection).to.deep.equal([2, 3]);
    });

    it('should call scorePlayerAnswers with an empty array if playerSubmissions is undefined', () => {
        answerManager['playerSubmissions'].set(playerStub, undefined);
        answerManager['scorePlayerAnswer'](playerStub);

        assert.calledWith(answerCorrectorStub.scorePlayerAnswers, playerStub, []);
    });

    it('should call scorePlayerAnswers with an the player submission if playerSubmissions is defined', () => {
        const playerSubmission = [0, 2];
        answerManager['playerSubmissions'].set(playerStub, playerSubmission);
        answerManager['scorePlayerAnswer'](playerStub);

        assert.calledWith(answerCorrectorStub.scorePlayerAnswers, playerStub, playerSubmission);
    });

    describe('submitPlayerAnswer', () => {
        it('should update playerWhoClaimedBonus if it is undefined', () => {
            answerManager['playerWhoClaimedBonus'] = undefined;
            answerManager.submitPlayerAnswer(playerStub);

            expect(answerManager['playerWhoClaimedBonus']).to.equal(playerStub);
        });

        it('should not update playerWhoClaimedBonus if it is already defined', () => {
            const player1 = playerStub;
            const player2 = createStubInstance(Client);

            answerManager['playerWhoClaimedBonus'] = player1;
            answerManager.submitPlayerAnswer(player2);

            expect(answerManager['playerWhoClaimedBonus']).to.equal(player1);
        });
    });

    it('should call scorePlayerAnswer for each player and then call onCorrectionfinished', () => {
        const scorePlayerAnswerStub = stub(answerManager as unknown as { scorePlayerAnswer: () => void }, 'scorePlayerAnswer');
        const onCorrectionfinishedStub = stub(answerManager as unknown as { onCorrectionfinished: () => void }, 'onCorrectionfinished');

        answerManager['finalizeAnswerSubmissionsIntern']();

        expect(scorePlayerAnswerStub.called).to.equal(true);

        expect(onCorrectionfinishedStub.called).to.be.equal(true);
    });

    it('should set up game observer with correct callbacks', () => {
        const quizEndedSubjectStub = new Subject<void>();
        const questionStartedSubjectStub = new Subject<QuestionWithIndex>();
        gameSessionStub.quizEndedSubject = quizEndedSubjectStub;
        gameSessionStub.questionStartedSubject = questionStartedSubjectStub;

        const onQuizEndedStub = stub(answerManager as unknown as { onQuizEnded: () => void }, 'onQuizEnded');

        answerManager['setUpGameObserver'](gameSessionStub);

        quizEndedSubjectStub.next();
        expect(onQuizEndedStub.calledOnce).to.equal(true);

        questionStartedSubjectStub.next(undefined);
        expect(answerCorrectorStub.setQuestion.calledOnce).to.equal(true);
    });

    it('should set up player socket with correct callback', () => {
        answerManager['setUpPlayerSocket'](playerStub);

        const toggleAnswerChoiceSpy = stub(answerManager, 'toggleAnswerChoice');
        expect(playerStub.onUserEvent.calledWith(GameAnswerSocketEvent.ToggleAnswerChoices)).to.equal(true);

        const callback = playerStub.onUserEvent.args[0][1] as (questionIndex: number) => void;
        callback(0);

        assert.calledWith(toggleAnswerChoiceSpy, playerStub);
    });

    it('should remove playerEventCallback on game ended', () => {
        gameSessionStub.removedGameSubject.next();

        expect(playerStub.removeEventListeners.calledWith(GameAnswerSocketEvent.ToggleAnswerChoices));
    });

    it('should remove playerEventCallback on userRemoved', () => {
        const mockUser = createStubInstance(Client);
        const mockUserRemoved: UserRemoved = {
            user: mockUser,
            reason: '',
        };
        gameSessionStub.removedUserSubject.next(mockUserRemoved);

        expect(playerStub.removeEventListeners.calledWith(GameAnswerSocketEvent.ToggleAnswerChoices));
    });

    it('clearPlayerSocket should not throw an error even if the player is undefined', () => {
        expect(() => answerManager['clearPlayerSocket'](undefined)).not.to.throw();
    });
});
