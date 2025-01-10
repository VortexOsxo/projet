import { expect } from 'chai';
import { SinonStubbedInstance, createStubInstance, spy } from 'sinon';
import { ActivePlayerService } from './active-player.service';
import { TimerService } from '@app/services/timer.service';
import { GameSessionBase } from '@app/classes/game/game-session-base';
import { INFINITE_TIME } from '@app/consts/timer.consts';
import { Subject } from 'rxjs';
import { Client } from '@app/classes/client';
import { QuestionWithIndex } from '@app/interfaces/question-with-index';
import { TIME_ACTIVE } from '@app/consts/game.const';
import { UserRemoved } from '@app/interfaces/users/user-removed';
import { GameChartSocketEvent } from '@common/enums/socket-event/game-charts-socket-event';
import { GameAnswerSocketEvent } from '@common/enums/socket-event/game-answer-socket-event';

describe('ActivePlayerService', () => {
    let activePlayerService: ActivePlayerService;
    let timerServiceStub: SinonStubbedInstance<TimerService>;
    let gameSessionStub: SinonStubbedInstance<GameSessionBase>;
    let organizerMock: SinonStubbedInstance<Client>;
    let playerMock1: SinonStubbedInstance<Client>;
    let playerMock2: SinonStubbedInstance<Client>;

    beforeEach(() => {
        organizerMock = createStubInstance(Client);
        playerMock1 = createStubInstance(Client);
        playerMock2 = createStubInstance(Client);

        timerServiceStub = createStubInstance(TimerService);
        timerServiceStub.setOnTickCallBack.callsFake((callback) => {
            callback(0);
            return timerServiceStub;
        });

        gameSessionStub = createStubInstance(GameSessionBase);
        gameSessionStub['removedUserSubject'] = new Subject();
        gameSessionStub['removedGameSubject'] = new Subject();

        gameSessionStub['organizer'] = organizerMock;
        gameSessionStub['players'] = [playerMock1, playerMock2];
        gameSessionStub.players = [playerMock1, playerMock2];
        gameSessionStub.organizer = organizerMock;

        gameSessionStub.getQuestion.returns({ index: 0 } as QuestionWithIndex);

        activePlayerService = new ActivePlayerService(gameSessionStub, timerServiceStub);
        activePlayerService.initialize();
    });

    describe('initialize', () => {
        it('should set up timer, send data to organizer, and emit event to players', () => {
            expect(timerServiceStub.setOnTickCallBack.calledOnce).to.equal(true);
            expect(timerServiceStub.startTimer.calledOnceWithExactly(INFINITE_TIME)).to.equal(true);

            expect(organizerMock.emitToUser.calledWithExactly(GameChartSocketEvent.SetQrlChartsGame)).to.equal(true);
            expect(playerMock1.emitToUser.calledWithExactly(GameChartSocketEvent.SetQrlChartsGame)).to.equal(true);
            expect(playerMock2.emitToUser.calledWithExactly(GameChartSocketEvent.SetQrlChartsGame)).to.equal(true);
        });
    });

    describe('clear', () => {
        it('should stop the timer', () => {
            activePlayerService.clear();

            expect(timerServiceStub.stopTimer.calledOnce).to.equal(true);
        });
    });

    describe('onPlayerActivity', () => {
        it('should update player activity and send data to organizer', () => {
            activePlayerService.onPlayerActivity(playerMock1);

            expect(activePlayerService['playersLastModification'].get(playerMock1)).to.equal(TIME_ACTIVE);
            expect(activePlayerService['playersLastModification'].size).to.equal(1);

            expect(organizerMock.emitToUser.calledWith(GameAnswerSocketEvent.SendAnswerStats)).to.equal(true);
        });
    });

    describe('setUpGameObserver', () => {
        it('should call clear when game is removed', () => {
            const removedGameSubjectStub = new Subject<void>();
            gameSessionStub.removedGameSubject = removedGameSubjectStub;
            const clearSpy = spy(activePlayerService, 'clear');

            activePlayerService['setUpGameObserver'](gameSessionStub);
            removedGameSubjectStub.next(undefined);

            expect(clearSpy.calledOnce).to.equal(true);
        });

        it('should call sendDataToOrganizerIfNeeded when user is removed', () => {
            const removedUserSubjectStub = new Subject<UserRemoved>();
            gameSessionStub.removedUserSubject = removedUserSubjectStub;
            const sendDataToOrganizerIfNeededSpy = spy(
                activePlayerService as unknown as { sendDataToOrganizerIfNeeded: () => void },
                'sendDataToOrganizerIfNeeded',
            );

            activePlayerService['setUpGameObserver'](gameSessionStub);
            removedUserSubjectStub.next(undefined);

            expect(sendDataToOrganizerIfNeededSpy.calledOnce).to.equal(true);
        });
    });

    describe('onSecondPassed', () => {
        it('should decrement time, remove inactive players, and send data to organizer', () => {
            activePlayerService['playersLastModification'].set(playerMock1, TIME_ACTIVE);
            activePlayerService['playersLastModification'].set(playerMock2, 0);

            activePlayerService['onSecondPassed']();

            expect(activePlayerService['playersLastModification'].get(playerMock1)).to.equal(TIME_ACTIVE - 1);
            expect(activePlayerService['playersLastModification'].has(playerMock2)).to.equal(false);

            expect(
                organizerMock.emitToUser.calledWithExactly(GameAnswerSocketEvent.SendAnswerStats, { questionIndex: 0, barCounts: [1, 1] }),
            ).to.equal(true);
        });
    });

    describe('getActivePlayersCount', () => {
        it('should return 0 when playersLastModification is undefined', () => {
            activePlayerService['playersLastModification'] = undefined;
            const activePlayersCount = activePlayerService['getActivePlayersCount']();
            expect(activePlayersCount).to.equal(0);
        });
    });

    it('should not emit answer stats when organizer is undefined', () => {
        organizerMock.emitToUser.reset();

        gameSessionStub.organizer = undefined;

        activePlayerService.onPlayerActivity(playerMock2);
        activePlayerService['sendDataToOrganizerIfNeeded']();

        expect(organizerMock.emitToUser.called).to.equal(false);
    });
});
