import { PlayerStateManager } from './player-state-manager.service';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { GameSessionBase } from '@app/classes/game/game-session-base';
import { expect } from 'chai';
import { PlayerState } from '@common/enums/user-answer-state';
import { Client } from '@app/classes/client';
import { Question } from '@common/interfaces/question';
import { Subject } from 'rxjs';
import { GamePlayerSocketEvent } from '@common/enums/socket-event/game-player-socket-event';

describe('PlayerStateManager', () => {
    let gameSessionStub: SinonStubbedInstance<GameSessionBase>;

    beforeEach(() => {
        gameSessionStub = createStubInstance(GameSessionBase);
        gameSessionStub.questionStartedSubject = new Subject();
        gameSessionStub.playersModifiedSubject = new Subject();

        new PlayerStateManager(gameSessionStub);
    });

    it('should reset answer states when question starts', () => {
        const player1 = createStubInstance(Client);
        const player2 = createStubInstance(Client);
        const player3 = createStubInstance(Client);
        const organizer = createStubInstance(Client);

        gameSessionStub.players = [player1, player2, player3];
        gameSessionStub.organizer = organizer;

        gameSessionStub.questionStartedSubject.next({} as Question);

        expect(player1.answerState).to.equal(PlayerState.NO_ANSWER);
        expect(player2.answerState).to.equal(PlayerState.NO_ANSWER);
        expect(player3.answerState).to.equal(PlayerState.NO_ANSWER);

        expect(organizer.emitToUser.calledWith(GamePlayerSocketEvent.SendPlayerStats)).to.equal(true);
    });

    it('should send player stats when players are modified', () => {
        const mockOrganizer = createStubInstance(Client);
        const mockPlayers = [createStubInstance(Client), createStubInstance(Client)];

        gameSessionStub.organizer = mockOrganizer;
        gameSessionStub.players = mockPlayers;

        gameSessionStub.playersModifiedSubject.next();

        expect(mockOrganizer.emitToUser.calledWith(GamePlayerSocketEvent.SendPlayerStats)).to.equal(true);
    });
});
