import { expect } from 'chai';
import { SinonStubbedInstance, createStubInstance, spy } from 'sinon';
import { ClientHandlerService } from '@app/services/client/client-handler.service';
import { GameSessionBase } from '@app/classes/game/game-session-base';
import { UserRemoved } from '@app/interfaces/users/user-removed';
import { Player } from '@app/interfaces/users/player';
import { Subscription, Subject } from 'rxjs';
import { GameBaseState } from './game-base-state.service';
import { Client } from '@app/classes/client';
import { GameLobby } from '@app/classes/game/game-lobby';
import { ClientState } from '@app/enums/client-state';
import { GameManagementSocketEvent } from '@common/enums/socket-event/game-management-socket-event';

class ConcreteGameBaseState extends GameBaseState {
    clearState(): void {
        // no need for implementation in the testing
    }

    protected initializeState(): void {
        // no need for implementation in the testing
    }
}

describe('GameBaseState', () => {
    let mockClientHandlerService: SinonStubbedInstance<ClientHandlerService>;
    let mockGameLobby: SinonStubbedInstance<GameLobby>;
    let mockGameSession: SinonStubbedInstance<GameSessionBase>;
    let mockClient: SinonStubbedInstance<Client>;
    let gameBaseState: ConcreteGameBaseState;

    let userRemovedSubjectMock: Subject<UserRemoved>;
    let addedPlayerSubjetMock: Subject<Player>;
    let gameStartedSubjectMock: Subject<GameSessionBase>;
    let mockQuizEndedSubject: SinonStubbedInstance<Subject<void>>;

    beforeEach(() => {
        mockClientHandlerService = createStubInstance(ClientHandlerService);
        mockClient = createStubInstance(Client);
        mockClientHandlerService.client = mockClient;

        mockGameLobby = createStubInstance(GameLobby);
        userRemovedSubjectMock = new Subject<UserRemoved>();
        addedPlayerSubjetMock = new Subject<Player>();
        gameStartedSubjectMock = new Subject<GameSessionBase>();

        mockGameLobby.removedUserSubject = userRemovedSubjectMock;
        mockGameLobby.addedPlayerSubject = addedPlayerSubjetMock;
        mockGameLobby.gameStartedSubject = gameStartedSubjectMock;

        mockGameSession = createStubInstance(GameSessionBase);

        mockQuizEndedSubject = createStubInstance(Subject);
        mockGameSession.quizEndedSubject = mockQuizEndedSubject;
        mockGameSession.removedUserSubject = new Subject();

        mockClientHandlerService.game = mockGameLobby;

        gameBaseState = new ConcreteGameBaseState(mockClientHandlerService);
    });

    describe('clearGameBaseState', () => {
        it('should unsubscribe from all subscriptions', () => {
            const mockSubscription1: SinonStubbedInstance<Subscription> = createStubInstance(Subscription);
            const mockSubscription2: SinonStubbedInstance<Subscription> = createStubInstance(Subscription);
            const mockSubscription3: SinonStubbedInstance<Subscription> = createStubInstance(Subscription);
            const mockSubscription4: SinonStubbedInstance<Subscription> = createStubInstance(Subscription);

            gameBaseState['userRemovedSubscription'] = mockSubscription1;
            gameBaseState['userAddedSubscription'] = mockSubscription2;
            gameBaseState['gameStartedSubscription'] = mockSubscription3;
            gameBaseState['gameEndedSubscription'] = mockSubscription4;

            gameBaseState['clearGameBaseState']();

            expect(mockSubscription1.unsubscribe.calledOnce).to.equal(true);
            expect(mockSubscription2.unsubscribe.calledOnce).to.equal(true);
            expect(mockSubscription3.unsubscribe.calledOnce).to.equal(true);
            expect(mockSubscription4.unsubscribe.calledOnce).to.equal(true);
        });
    });

    describe('initializeGameBaseState', () => {
        it('should subscribe to game events', () => {
            const onPlayerRemovedSpy = spy(gameBaseState as unknown as { onPlayerRemoved: (userRemoved: UserRemoved) => void }, 'onPlayerRemoved');
            const onPlayerAddedSpy = spy(gameBaseState as unknown as { onPlayerAdded: (player: Player) => void }, 'onPlayerAdded');
            const onGameStartedSpy = spy(gameBaseState as unknown as { onGameStarted: (game: GameSessionBase) => void }, 'onGameStarted');

            gameBaseState['initializeGameBaseState']();

            userRemovedSubjectMock.next({ user: mockClient, reason: 'reason' });
            addedPlayerSubjetMock.next(mockClient);
            gameStartedSubjectMock.next(mockGameSession);

            expect(onPlayerRemovedSpy.calledOnce).to.equal(true);
            expect(onPlayerAddedSpy.calledOnce).to.equal(true);
            expect(onGameStartedSpy.calledOnce).to.equal(true);
        });
    });

    describe('onPlayerAdded', () => {
        it('should emit player joined event if the added player is not the client', () => {
            const mockPlayer: SinonStubbedInstance<Client> = createStubInstance(Client);
            const emitPlayerJoinedSpy = spy(gameBaseState as unknown as { emitPlayerJoined: (player: Player) => void }, 'emitPlayerJoined');

            gameBaseState['onPlayerAdded'](mockPlayer);

            expect(emitPlayerJoinedSpy.calledOnceWithExactly(mockPlayer)).to.equal(true);
        });

        it('should not emit player joined event if the added player is the client', () => {
            const emitPlayerJoinedSpy = spy(gameBaseState as unknown as { emitPlayerJoined: () => void }, 'emitPlayerJoined');

            gameBaseState['onPlayerAdded'](mockClient);

            expect(emitPlayerJoinedSpy.called).to.equal(false);
        });
    });

    describe('onPlayerRemoved', () => {
        it('should emit client kicked out event and reset state if the removed user is the client', () => {
            const userRemoved: UserRemoved = { user: mockClient, reason: 'reason' };
            const emitClientKickedOutSpy = spy(gameBaseState as unknown as { emitClientKickedOut: (reason: string) => void }, 'emitClientKickedOut');

            gameBaseState['onPlayerRemoved'](userRemoved);

            expect(emitClientKickedOutSpy.calledOnceWithExactly('reason')).to.equal(true);
            expect(mockClientHandlerService.resetState.calledOnce).to.equal(true);
        });

        it('should emit player left event if the removed user is not the client', () => {
            const mockPlayerRemoved: SinonStubbedInstance<Client> = createStubInstance(Client);
            const userRemoved: UserRemoved = { user: mockPlayerRemoved, reason: 'reason' };
            const emitPlayerLeftSpy = spy(gameBaseState as unknown as { emitPlayerLeft: (player: Player) => void }, 'emitPlayerLeft');

            gameBaseState['onPlayerRemoved'](userRemoved);

            expect(emitPlayerLeftSpy.calledOnceWithExactly(mockPlayerRemoved)).to.equal(true);
        });

        it('should not emit player left event if the removed user is not a player', () => {
            const userRemoved: UserRemoved = { user: undefined, reason: 'reason' };
            const emitPlayerLeftSpy = spy(gameBaseState as unknown as { emitPlayerLeft: () => void }, 'emitPlayerLeft');

            gameBaseState['onPlayerRemoved'](userRemoved);

            expect(emitPlayerLeftSpy.called).to.equal(false);
        });
    });

    describe('onGameStarted', () => {
        it('should set the game and update state to GameLeaderboard', () => {
            const emitToClientSpy = spy(gameBaseState as unknown as { emitToClient: (eventName: string) => void }, 'emitToClient');

            gameBaseState['onGameStarted'](mockGameSession);

            expect(mockClientHandlerService.game).to.equal(mockGameSession);
            expect(emitToClientSpy.calledOnceWithExactly(GameManagementSocketEvent.OnGameStarted)).to.equal(true);
        });

        it('should unsubscribe from game started subscription', () => {
            const subscriptionStub = createStubInstance(Subscription);
            gameBaseState['gameStartedSubscription'] = subscriptionStub;

            gameBaseState['onGameStarted'](mockGameSession);

            expect(subscriptionStub.unsubscribe.calledOnce).to.equal(true);
        });

        it('should reset user event subscription', () => {
            const resetUserEventSubscriptionSpy = spy(
                gameBaseState as unknown as { resetUserEventSubscription: () => void },
                'resetUserEventSubscription',
            );

            gameBaseState['onGameStarted'](mockGameSession);

            expect(resetUserEventSubscriptionSpy.calledOnce).to.equal(true);
        });
    });

    describe('setQuizEndedCallback', () => {
        it('should subscribe to quizEndedSubject and update client state to GameLeaderboard', () => {
            mockClientHandlerService.game = mockGameSession;
            gameBaseState['setQuizEndedCallback']();

            // Even though the method is deprecated,
            // we can still access the right callback and properly test the method
            const callback = mockQuizEndedSubject.subscribe.args[0][0]; // eslint-disable-line deprecation/deprecation
            callback();

            // Even though the method is deprecated, we can still spy on it properly
            expect(mockQuizEndedSubject.subscribe.calledOnce).to.equal(true); // eslint-disable-line deprecation/deprecation
            expect(mockClientHandlerService.updateState.calledWith(ClientState.GameLeaderboard)).to.equal(true);
        });

        it('should not subscribe to quizEndedSubject if the game is undefined', () => {
            mockClientHandlerService.game = undefined;
            expect(() => gameBaseState['setQuizEndedCallback']()).not.to.throw();
        });
    });

    describe('should not throw error when variable are undefined', () => {
        it('should not throw error when game and gameLobby are undefined', () => {
            mockClientHandlerService.game = undefined;

            expect(() => gameBaseState['resetUserEventSubscription']()).not.to.throw(Error);
        });

        it('should not throw errors when subscriptions are undefined', () => {
            const newGameBaseState = new ConcreteGameBaseState(mockClientHandlerService);
            expect(() => newGameBaseState['clearGameBaseState']()).not.to.throw();
        });

        it('should not subscribe to game events when game or gameLobby is undefined', () => {
            mockClientHandlerService.game = mockGameSession;

            expect(() => gameBaseState['initializeGameBaseState']()).to.not.throw();
        });
    });

    describe('initializeGameBaseState', () => {
        it('should call onPlayerRemoved when a user is removed', () => {
            const userRemovedMock = createStubInstance(Subject);
            mockGameLobby.removedUserSubject = userRemovedMock;

            const onPlayerRemovedSpy = spy(gameBaseState as unknown as { onPlayerRemoved: () => void }, 'onPlayerRemoved');
            gameBaseState['resetUserEventSubscription']();

            // Even though the method is deprecated,
            // we can still access the right callback and properly test the method
            const [callback] = userRemovedMock.subscribe.getCall(0).args; // eslint-disable-line deprecation/deprecation

            callback({ user: {} as unknown, reason: 'Test Reason' });
            expect(onPlayerRemovedSpy.calledOnce).to.equal(true);
        });

        it('should call onPlayerAdded when a user is added', () => {
            const userAddedmock = createStubInstance(Subject);
            mockGameLobby.addedPlayerSubject = userAddedmock;

            const onPlayerAddedSpy = spy(gameBaseState as unknown as { onPlayerAdded: () => void }, 'onPlayerAdded');

            gameBaseState['resetUserEventSubscription']();

            // Even though the method is deprecated,
            // we can still access the right callback and properly test the method
            const [callback] = userAddedmock.subscribe.getCall(0).args; // eslint-disable-line deprecation/deprecation
            callback({} as unknown);
            expect(onPlayerAddedSpy.calledOnce).to.equal(true);
        });
    });
});
