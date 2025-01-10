import { expect } from 'chai';
import { SinonStubbedInstance, createStubInstance, spy, stub } from 'sinon';
import { AnswerManagerBase } from './answer-manager-base.service';
import { GameSessionBase } from '@app/classes/game/game-session-base';
import { Client } from '@app/classes/client';

class AnswerManagerBaseTest extends AnswerManagerBase {
    protected setUpPlayerSocket(): void {
        // No need for a real implementation
    }

    protected setUpGameObserver(): void {
        // No need for a real implementation
    }

    protected finalizeAnswerSubmissionsIntern(): void {
        // No need for a real implementation
    }

    protected clearPlayerSocket(): void {
        // No need for a real implementation
    }

    protected resetAnswer(): void {
        // No need for a real implementation
    }
}

describe('AnswerManagerBase', () => {
    let answerManager: AnswerManagerBase;
    let gameSessionStub: SinonStubbedInstance<GameSessionBase>;
    let player1: SinonStubbedInstance<Client>;
    let player2: SinonStubbedInstance<Client>;

    beforeEach(() => {
        gameSessionStub = createStubInstance(GameSessionBase);

        player1 = createStubInstance(Client);
        player2 = createStubInstance(Client);

        gameSessionStub.players = [player1, player2];

        answerManager = new AnswerManagerBaseTest(gameSessionStub);
    });

    describe('setCorrectionFinishedCallback', () => {
        it('should set correction finished callback', () => {
            const callback = stub();
            answerManager.setCorrectionFinishedCallback(callback);
            expect(answerManager['correctionFinishedCallback']).to.equal(callback);
        });
    });

    describe('finalizeAnswerSubmissions', () => {
        it('should call finalize answer submissions intern', () => {
            const finalizeAnswerSubmissionsInternSpy = spy(
                answerManager as unknown as { finalizeAnswerSubmissionsIntern: () => void },
                'finalizeAnswerSubmissionsIntern',
            );
            answerManager.finalizeAnswerSubmissions();
            expect(finalizeAnswerSubmissionsInternSpy.calledOnce).to.equal(true);
        });
    });

    describe('onCorrectionfinished', () => {
        it('should reset answer and call correction finished callback', () => {
            const resetAnswerSpy = spy(answerManager as unknown as { resetAnswer: () => void }, 'resetAnswer');
            const callback = spy();
            answerManager.setCorrectionFinishedCallback(callback);
            answerManager['onCorrectionfinished']();
            expect(resetAnswerSpy.calledOnce).to.equal(true);
            expect(callback.calledOnce).to.equal(true);
        });
    });

    it('should reset answer without crashing if correctionFinishedCallback is not defined', () => {
        answerManager['correctionFinishedCallback'] = undefined;

        expect(() => answerManager['onCorrectionfinished']()).not.to.throw();
    });
});
