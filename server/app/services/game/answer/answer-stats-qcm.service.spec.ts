import { GameSessionBase } from '@app/classes/game/game-session-base';
import { Player } from '@app/interfaces/users/player';
import { User } from '@app/interfaces/users/user';
import { expect } from 'chai';
import { SinonStub, SinonStubbedInstance, createStubInstance, spy } from 'sinon';
import { AnswerStatsQCMService } from './answer-stats-qcm.service';
import { AnswerStats } from '@common/interfaces/answers/answer-stats';
import { Client } from '@app/classes/client';
import { GameAnswerSocketEvent } from '@common/enums/socket-event/game-answer-socket-event';
import { GamePlayerSocketEvent } from '@common/enums/socket-event/game-player-socket-event';

describe('AnswerStatsServiceQCM', () => {
    let answerStatsService: AnswerStatsQCMService;
    let gameSessionMock: SinonStubbedInstance<GameSessionBase>;
    let organizerMock: User;
    let playerMock1: Player;
    let playerMock2: Player;

    beforeEach(() => {
        gameSessionMock = createStubInstance(GameSessionBase);

        organizerMock = createStubInstance(Client);
        playerMock1 = createStubInstance(Client);
        playerMock2 = createStubInstance(Client);

        gameSessionMock.players = [playerMock1, playerMock2];
        gameSessionMock.organizer = organizerMock;

        answerStatsService = new AnswerStatsQCMService(gameSessionMock);
    });

    describe('updateChoiceStats', () => {
        it('should update choice statistics and send updated stats to organizer', () => {
            const playersSelection = new Map();
            playersSelection.set(playerMock1, [0, 1, 2]);
            playersSelection.set(playerMock2, [1, 2, 3]);
            const questionIndex = 0;

            const sendAnswerStatsSpy = spy(
                answerStatsService as unknown as { sendAnswerStats: (user: User, answerStats: AnswerStats) => void },
                'sendAnswerStats',
            );

            answerStatsService.updateChoiceStats(playersSelection, questionIndex);

            expect(answerStatsService['choicesStats'].get(questionIndex)).to.deep.equal([1, 2, 2, 1]);
            expect(sendAnswerStatsSpy.calledOnce).to.equal(true);
            expect(
                sendAnswerStatsSpy.calledWithExactly(organizerMock, {
                    questionIndex,
                    barCounts: [1, 2, 2, 1],
                }),
            ).to.equal(true);
        });
    });

    describe('sendStatsToPlayers', () => {
        it('should send answer stats to players and player stats to each player', () => {
            const sendAnswerStatsSpy = spy(answerStatsService as unknown as { sendAnswerStats: () => void }, 'sendAnswerStats');

            answerStatsService['choicesStats'].set(0, [0, 0, 0, 0]);

            answerStatsService.sendStatsToPlayers();

            expect(sendAnswerStatsSpy.callCount).to.equal(2);

            expect((playerMock1.emitToUser as SinonStub).getCall(0).args[0]).to.equal(GameAnswerSocketEvent.SendAnswerStats);
            expect((playerMock1.emitToUser as SinonStub).getCall(1).args[0]).to.equal(GamePlayerSocketEvent.SendPlayerStats);

            expect((playerMock2.emitToUser as SinonStub).getCall(0).args[0]).to.equal(GameAnswerSocketEvent.SendAnswerStats);
            expect((playerMock2.emitToUser as SinonStub).getCall(1).args[0]).to.equal(GamePlayerSocketEvent.SendPlayerStats);
        });
    });

    it('should not emit when user is undefined', () => {
        const answerStats: AnswerStats = {
            questionIndex: 0,
            barCounts: [0, 0, 0, 0],
        };

        answerStatsService['sendAnswerStats'](undefined, answerStats);

        expect((organizerMock.emitToUser as SinonStub).called).to.equal(false);
    });
});
