import { expect } from 'chai';
import { SinonStubbedInstance, createStubInstance, spy } from 'sinon';
import { QuestionManager } from './question-manager';
import { GameSessionBase } from '@app/classes/game/game-session-base';
import { Subject } from 'rxjs';
import { Question } from '@common/interfaces/question';
import { Client } from '@app/classes/client';
import { QuestionWithIndex } from '@app/interfaces/question-with-index';
import { GamePlaySocketEvent } from '@common/enums/socket-event/game-play-socket-event';
import { GameAnswerSocketEvent } from '@common/enums/socket-event/game-answer-socket-event';

describe('QuestionManager', () => {
    let questionManager: QuestionManager;
    let gameSessionStub: SinonStubbedInstance<GameSessionBase>;
    let organizerStub: SinonStubbedInstance<Client>;
    let player1Stub: SinonStubbedInstance<Client>;
    let player2Stub: SinonStubbedInstance<Client>;

    const sampleQuestion: Question = {
        text: 'Sample Question',
        choices: [
            { text: 'Choice1', isCorrect: false },
            { text: 'Choice2', isCorrect: true },
        ],
    } as Question;

    beforeEach(() => {
        gameSessionStub = createStubInstance(GameSessionBase);
        organizerStub = createStubInstance(Client);
        player1Stub = createStubInstance(Client);
        player2Stub = createStubInstance(Client);

        gameSessionStub.quizStartedSubject = new Subject<void>();
        gameSessionStub.questionStartedSubject = new Subject<Question>();
        gameSessionStub.questionEndedSubject = new Subject<Question>();

        gameSessionStub['organizer'] = organizerStub;
        gameSessionStub['players'] = [player1Stub, player2Stub];

        gameSessionStub.getQuestion.returns({ text: 'Sample Question' } as QuestionWithIndex);
        gameSessionStub.players = [player1Stub, player2Stub];
        gameSessionStub.organizer = organizerStub;

        questionManager = new QuestionManager(gameSessionStub);
    });

    describe('sendQuestionData', () => {
        it('should emit SEND_QUESTION_DATA event to all users with current question', () => {
            questionManager['sendQuestionData']();
            expect(organizerStub.emitToUser.calledWith(GamePlaySocketEvent.SendQuestionData, { text: 'Sample Question' })).to.equal(true);
            expect(player1Stub.emitToUser.calledWith(GamePlaySocketEvent.SendQuestionData, { text: 'Sample Question' })).to.equal(true);
            expect(player2Stub.emitToUser.calledWith(GamePlaySocketEvent.SendQuestionData, { text: 'Sample Question' })).to.equal(true);
        });
    });

    describe('sendAnswers', () => {
        it('should emit SEND_CORRECT_ANSWERS event to each player with valid answers for the question', () => {
            questionManager['sendAnswers'](sampleQuestion);
            const validAnswers = [1];
            expect(player1Stub.emitToUser.calledWith(GameAnswerSocketEvent.SendCorrectAnswer, validAnswers)).to.equal(true);
            expect(player2Stub.emitToUser.calledWith(GameAnswerSocketEvent.SendCorrectAnswer, validAnswers)).to.equal(true);
        });
    });

    describe('setUpGameObserver', () => {
        describe('quizStartedSubject subscription', () => {
            it('should call sendQuestionData when quiz starts', () => {
                const sendQuestionDataSpy = spy(questionManager as unknown as { sendQuestionData: () => void }, 'sendQuestionData');
                gameSessionStub.quizStartedSubject.next();
                expect(sendQuestionDataSpy.calledOnce).to.equal(true);
            });
        });

        describe('questionStartedSubject subscription', () => {
            it('should call sendQuestionData when question starts', () => {
                const sendQuestionDataSpy = spy(questionManager as unknown as { sendQuestionData: () => void }, 'sendQuestionData');
                gameSessionStub.questionStartedSubject.next(sampleQuestion);
                expect(sendQuestionDataSpy.calledOnce).to.equal(true);
            });
        });

        describe('questionEndedSubject subscription', () => {
            it('should call sendAnswers and updatePlayersScore when question ends', () => {
                const sendAnswersSpy = spy(questionManager as unknown as { sendAnswers: () => void }, 'sendAnswers');

                gameSessionStub.questionEndedSubject.next(sampleQuestion);
                expect(sendAnswersSpy.calledOnce).to.equal(true);
            });
        });
    });
});
