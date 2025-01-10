import { expect } from 'chai';
import { SinonStubbedInstance, createStubInstance, assert, stub, match } from 'sinon';
import { GameSessionBase } from '@app/classes/game/game-session-base';
import { Client } from '@app/classes/client';
import { Subject } from 'rxjs';
import { QuestionType } from '@common/enums/question-type';
import { QuestionWithIndex } from '@app/interfaces/question-with-index';
import { AnswerManagerQRL } from './answer-manager-qrl.service';
import { ActivePlayerService } from '@app/services/game/game-listeners/active-player.service';
import { AnswerStatsQRLService } from '@app/services/game/answer/answer-stats-qrl.service';
import { AnswerToCorrect } from '@common/interfaces/answers/answer-to-correct';
import { Question } from '@common/interfaces/question';
import { Player } from '@app/interfaces/users/player';
import { UserRemoved } from '@app/interfaces/users/user-removed';
import { GameAnswerSocketEvent } from '@common/enums/socket-event/game-answer-socket-event';

describe('AnswerManagerQRL', () => {
    let answerManager: AnswerManagerQRL;
    let gameSessionStub: SinonStubbedInstance<GameSessionBase>;

    let activePlayerServiceStub: SinonStubbedInstance<ActivePlayerService>;
    let answerStatsQRLService: SinonStubbedInstance<AnswerStatsQRLService>;

    let playerStub: SinonStubbedInstance<Client>;

    let organizerStub: SinonStubbedInstance<Client>;

    beforeEach(() => {
        playerStub = createStubInstance(Client);
        organizerStub = createStubInstance(Client);

        gameSessionStub = createStubInstance(GameSessionBase);
        gameSessionStub.quizEndedSubject = new Subject();
        gameSessionStub.questionStartedSubject = new Subject();
        gameSessionStub.questionEndedSubject = new Subject();
        gameSessionStub.removedGameSubject = new Subject();
        gameSessionStub.removedUserSubject = new Subject();
        gameSessionStub.playersModifiedSubject = new Subject();

        gameSessionStub.players = [playerStub];
        gameSessionStub.organizer = organizerStub;

        gameSessionStub.getQuestion.returns({ type: QuestionType.QRL } as QuestionWithIndex);

        activePlayerServiceStub = createStubInstance(ActivePlayerService);
        answerStatsQRLService = createStubInstance(AnswerStatsQRLService);

        answerManager = new AnswerManagerQRL(gameSessionStub, activePlayerServiceStub, answerStatsQRLService);
    });

    it('should set up player socket with correct callback', () => {
        const onUpdateAnswerResponseStub = stub(
            answerManager as unknown as { updateResponse: (player: Player, response: string) => void },
            'updateResponse',
        );

        answerManager['setUpPlayerSocket'](playerStub);

        const callback = playerStub.onUserEvent.args[0][1];
        callback('Updated response');

        assert.calledWith(onUpdateAnswerResponseStub, playerStub, 'Updated response');
    });

    it('should finalize answer submissions internally', () => {
        const getAnswersToCorrectStub = stub(
            answerManager as unknown as { getAnswersToCorrect: () => AnswerToCorrect[] },
            'getAnswersToCorrect',
        ).returns([{} as AnswerToCorrect]);

        answerManager['finalizeAnswerSubmissionsIntern']();

        assert.called(getAnswersToCorrectStub);
        assert.called(organizerStub.emitToUser);
    });

    it('should reset answer submissions', () => {
        answerManager['playerSubmissions'] = new Map([[playerStub, 'Some answer']]);
        answerManager['resetAnswer']();

        expect(answerManager['playerSubmissions'].size).to.equal(0);
    });

    it('should receive corrected answers and score them', () => {
        const onCorrectionfinishedStub = stub(answerManager as unknown as { onCorrectionfinished: () => void }, 'onCorrectionfinished');

        const correctedAnswers = [{ playerName: 'Player 1', answer: 'Answer 1', score: 1 }];
        answerManager['receiveCorrectedAnswers'](correctedAnswers);

        assert.calledOnce(answerStatsQRLService.addCorrectedAnswer);
        assert.calledOnce(onCorrectionfinishedStub);
    });

    it('should sort answers by player name', () => {
        const answers: AnswerToCorrect[] = [
            { playerName: 'Zebra', answer: 'Answer Z', score: 0 },
            { playerName: 'Lion', answer: 'Answer L', score: 0 },
            { playerName: 'Elephant', answer: 'Answer E', score: 0 },
        ];

        const sortedAnswers = answerManager['sortByPlayerName'](answers);

        expect(sortedAnswers).to.deep.equal([
            { playerName: 'Elephant', answer: 'Answer E', score: 0 },
            { playerName: 'Lion', answer: 'Answer L', score: 0 },
            { playerName: 'Zebra', answer: 'Answer Z', score: 0 },
        ]);
    });

    it('should generate and emit answers to correct to the organizer', () => {
        const organizerMock = createStubInstance(Client);
        gameSessionStub.organizer = organizerMock;

        const getAnswersToCorrectStub = stub(
            answerManager as unknown as { getAnswersToCorrect: () => AnswerToCorrect[] },
            'getAnswersToCorrect',
        ).returns([{} as AnswerToCorrect]);

        answerManager['finalizeAnswerSubmissionsIntern']();

        assert.calledOnce(getAnswersToCorrectStub);
        assert.calledOnce(organizerMock.emitToUser);
        expect(organizerMock.emitToUser.firstCall.args[0]).to.equal(GameAnswerSocketEvent.SendAnswerToCorrect);
    });

    it('should skip correction if there is no answer to correct', () => {
        const organizerMock = createStubInstance(Client);
        gameSessionStub.organizer = organizerMock;
        answerManager['correctionFinishedCallback'] = () => gameSessionStub.correctionWasFinished();

        const getAnswersToCorrectStub = stub(
            answerManager as unknown as { getAnswersToCorrect: () => AnswerToCorrect[] },
            'getAnswersToCorrect',
        ).returns([]);

        answerManager['finalizeAnswerSubmissionsIntern']();

        assert.calledOnce(getAnswersToCorrectStub);
        assert.notCalled(organizerMock.emitToUser);
        assert.calledOnce(gameSessionStub.correctionWasFinished);
    });

    it('should update player response and trigger player activity', () => {
        const player = playerStub;
        const response = 'Updated response';

        answerManager['updateResponse'](player, response);

        assert.calledWith(activePlayerServiceStub.onPlayerActivity, player);
        expect(answerManager['playerSubmissions'].get(player)).to.equal(response);
    });

    it('should create AnswerToCorrect object with correct properties', () => {
        const answer = 'Answer';

        const result = answerManager['createAnswerToCorrect'](answer, playerStub);

        expect(result.playerName).to.equal(playerStub.name);
        expect(result.answer).to.equal(answer);
        expect(result.score).to.equal(0);
    });

    it('should not update player score if player is not found', () => {
        const mockAnswer = 'Answer';
        playerStub.score = 0;
        const mockPointValue = 10;
        gameSessionStub.getQuestion.returns({ points: mockPointValue } as QuestionWithIndex);

        answerManager['playerSubmissions'].set(playerStub, mockAnswer);
        const correctedAnswer = { playerName: playerStub.name, answer: mockAnswer, score: 1 };

        answerManager['scoreAnswer'](correctedAnswer);

        expect(playerStub.score).to.equal(mockPointValue);
    });

    it('should initialize active player service when question starts', () => {
        gameSessionStub.questionStartedSubject = new Subject<Question>();
        answerManager['setUpGameObserver'](gameSessionStub);

        const question = { type: QuestionType.QRL } as QuestionWithIndex;
        gameSessionStub.questionStartedSubject.next(question);

        expect(activePlayerServiceStub.initialize.calledOnce).to.equal(true);
    });

    it('should clear active player service when question ends', () => {
        gameSessionStub.questionEndedSubject = new Subject<Question>();
        answerManager['setUpGameObserver'](gameSessionStub);

        const question = { type: QuestionType.QRL } as QuestionWithIndex;
        gameSessionStub.questionEndedSubject.next(question);

        expect(activePlayerServiceStub.clear.calledOnce).to.equal(true);
    });

    it('should not initialize active player service if question type is not QRL when question starts', () => {
        gameSessionStub.questionStartedSubject = new Subject<Question>();
        answerManager['setUpGameObserver'](gameSessionStub);

        const question = { type: QuestionType.QCM } as QuestionWithIndex;
        gameSessionStub.questionStartedSubject.next(question);

        expect(activePlayerServiceStub.initialize.called).to.equal(false);
    });

    it('should not clear active player service if question type is not QRL when question ends', () => {
        gameSessionStub.questionEndedSubject = new Subject<Question>();
        answerManager['setUpGameObserver'](gameSessionStub);

        const question = { type: QuestionType.QCM } as QuestionWithIndex;
        gameSessionStub.questionEndedSubject.next(question);

        expect(activePlayerServiceStub.clear.called).to.equal(false);
    });

    it('should set up corrector socket with correct callback', () => {
        const corrector = createStubInstance(Client);

        const receiveCorrectedAnswersStub = stub(
            answerManager as unknown as { receiveCorrectedAnswers: (correctedAnswers: AnswerToCorrect[]) => void },
            'receiveCorrectedAnswers',
        );

        answerManager['initializeCorrector'](corrector);

        const callback = corrector.onUserEvent.args[0][1];
        const correctedAnswers = [{ playerName: 'Player 1', answer: 'Answer 1', score: 1 }];
        callback(correctedAnswers);

        assert.calledWith(receiveCorrectedAnswersStub, correctedAnswers);
    });

    it('should create and sort answers to correct', () => {
        const answer1 = 'Answer 1';
        const answer2 = 'Answer 2';
        const player1 = createStubInstance(Client);
        const player2 = createStubInstance(Client);
        player1.name = 'Player 1';
        player2.name = 'Player 2';

        answerManager['playerSubmissions'].set(player1, answer1);
        answerManager['playerSubmissions'].set(player2, answer2);

        const sortFunctionStub = stub().returnsArg(0);

        const result = answerManager['getAnswersToCorrect'](sortFunctionStub);

        assert.calledOnceWithExactly(
            sortFunctionStub,
            match.array.deepEquals([
                { playerName: 'Player 1', answer: answer1, score: 0 },
                { playerName: 'Player 2', answer: answer2, score: 0 },
            ]),
        );

        expect(result).to.deep.equal([
            { playerName: 'Player 1', answer: answer1, score: 0 },
            { playerName: 'Player 2', answer: answer2, score: 0 },
        ]);
    });

    it('should remove playerEventCallback on game ended', () => {
        gameSessionStub.removedGameSubject.next();

        expect(playerStub.removeEventListeners.calledWith(GameAnswerSocketEvent.UpdateAnswerResponse));
        expect(organizerStub.removeEventListeners.calledWith(GameAnswerSocketEvent.SendAnswersCorrected));
    });

    it('should remove playerEventCallback on userRemoved', () => {
        const mockUser = createStubInstance(Client);
        const mockUserRemoved: UserRemoved = { user: mockUser, reason: '' };
        gameSessionStub.removedUserSubject.next(mockUserRemoved);

        expect(playerStub.removeEventListeners.calledWith(GameAnswerSocketEvent.UpdateAnswerResponse));
    });

    it('clearPlayerSocket should not throw an error even if the player is undefined', () => {
        expect(() => answerManager['clearPlayerSocket'](undefined)).not.to.throw();
    });
});
