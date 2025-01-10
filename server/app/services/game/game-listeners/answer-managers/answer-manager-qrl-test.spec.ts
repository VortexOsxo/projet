import { expect } from 'chai';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { AnswerManagerQRLTest } from './answer-manager-qrl-test';
import { GameSessionBase } from '@app/classes/game/game-session-base';
import { Player } from '@app/interfaces/users/player';
import { Client } from '@app/classes/client';
import { QuestionWithIndex } from '@app/interfaces/question-with-index';
import { GameAnswerSocketEvent } from '@common/enums/socket-event/game-answer-socket-event';

describe('AnswerManagerQRLTest', () => {
    let answerManager: AnswerManagerQRLTest;
    let gameSessionStub: SinonStubbedInstance<GameSessionBase>;
    let playerStub: SinonStubbedInstance<Player>;

    const questionPoints = 10;

    beforeEach(() => {
        gameSessionStub = createStubInstance(GameSessionBase);
        playerStub = createStubInstance(Client);
        playerStub.score = 0;

        gameSessionStub.players = [playerStub];
        gameSessionStub.getQuestion.returns({ points: questionPoints } as QuestionWithIndex);

        answerManager = new AnswerManagerQRLTest(gameSessionStub);
    });

    describe('finalizeAnswerSubmissionsIntern', () => {
        it('should increase player score by question points and call onCorrectionfinished', () => {
            const initialScore = playerStub.score;

            answerManager['finalizeAnswerSubmissionsIntern']();

            expect(playerStub.score).to.equal(initialScore + questionPoints);
            expect(playerStub.emitToUser.calledWith(GameAnswerSocketEvent.SendCorrectionMessage)).to.equal(true);
        });
    });

    it('clearPlayerSocket should not throw any error', () => {
        expect(() => answerManager['clearPlayerSocket']()).not.to.throw();
    });
});
