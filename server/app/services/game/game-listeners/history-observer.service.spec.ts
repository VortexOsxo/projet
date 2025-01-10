import { expect } from 'chai';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { HistoryObserver } from './history-observer.service';
import { GameSessionBase } from '@app/classes/game/game-session-base';
import { Subject } from 'rxjs';
import { GameHistoryService } from '@app/services/game/game-history.service';

describe('HistoryObserver', () => {
    let gameSessionStub: SinonStubbedInstance<GameSessionBase>;
    let gameHistoryServiceStub: SinonStubbedInstance<GameHistoryService>;

    beforeEach(() => {
        gameSessionStub = createStubInstance(GameSessionBase);
        gameSessionStub.quizStartedSubject = new Subject();
        gameSessionStub.quizEndedSubject = new Subject();
        gameSessionStub.removedGameSubject = new Subject();

        gameHistoryServiceStub = createStubInstance(GameHistoryService);

        new HistoryObserver(gameSessionStub, gameHistoryServiceStub);
    });

    it('should subscribe to quizStartedSubject and call registerToGameHistory', () => {
        gameSessionStub.quizStartedSubject.next();
        expect(gameHistoryServiceStub.registerToHistory.calledWith(gameSessionStub)).to.equal(true);
    });

    it('should subscribe to quizEndedSubject and call saveToGameHistory', () => {
        gameSessionStub.quizEndedSubject.next();
        expect(gameHistoryServiceStub.saveGameToHistory.calledWith(gameSessionStub)).to.equal(true);
    });

    it('should subscribe to removedGameSubject and call clearFromGameHistory', () => {
        gameSessionStub.removedGameSubject.next();
        expect(gameHistoryServiceStub.unregisterFromHistory.calledWith(gameSessionStub)).to.equal(true);
    });
});
