import { expect } from 'chai';
import { SinonStubbedInstance, createStubInstance, spy } from 'sinon';
import { GameLeaderboardState } from './game-leaderboard-state.service';
import { ClientHandlerService } from '@app/services/client/client-handler.service';
import { Client } from '@app/classes/client';
import { KickedOutMessage } from '@app/enums/kicked-out-message';
import { GamePlayerSocketEvent } from '@common/enums/socket-event/game-player-socket-event';

describe('GameLeaderboardState', () => {
    let gameLeaderboardState: GameLeaderboardState;
    let mockClientHandlerService: SinonStubbedInstance<ClientHandlerService>;

    let mockClient: SinonStubbedInstance<Client>;

    beforeEach(() => {
        mockClientHandlerService = createStubInstance(ClientHandlerService);
        mockClient = createStubInstance(Client);

        mockClientHandlerService.client = mockClient;

        gameLeaderboardState = new GameLeaderboardState(mockClientHandlerService);
    });

    describe('clearState', () => {
        it('should remove all listeners for PLAYER_LEFT_GAME_EVENT and DISCONNECT_EVENT', () => {
            gameLeaderboardState.clearState();

            expect(mockClient.removeEventListeners.calledWith(GamePlayerSocketEvent.PlayerLeftGame)).to.equal(true);
            expect(mockClient.removeEventListeners.calledWith(GamePlayerSocketEvent.Disconnect)).to.equal(true);
        });
    });

    describe('initializeState', () => {
        it('should add listeners for PLAYER_LEFT_GAME_EVENT and DISCONNECT_EVENT', () => {
            gameLeaderboardState['initializeState']();

            expect(mockClient.onUserEvent.calledWith(GamePlayerSocketEvent.PlayerLeftGame)).to.equal(true);
            expect(mockClient.onUserEvent.calledWith(GamePlayerSocketEvent.Disconnect)).to.equal(true);
        });

        it('should register correct callbacks for PLAYER_LEFT_GAME_EVENT and DISCONNECT_EVENT', () => {
            const leaveGameSpy = spy(gameLeaderboardState as unknown as { leaveGame: () => void }, 'leaveGame');
            gameLeaderboardState['initializeState']();

            expect(mockClient.onUserEvent.calledWith(GamePlayerSocketEvent.PlayerLeftGame)).to.equal(true);
            expect(mockClient.onUserEvent.calledWith(GamePlayerSocketEvent.Disconnect)).to.equal(true);

            const playerLeftGameCallback = mockClient.onUserEvent.args.find((args) => args[0] === GamePlayerSocketEvent.PlayerLeftGame)[1];
            playerLeftGameCallback();
            expect(leaveGameSpy.calledOnce).to.equal(true);

            const disconnectCallback = mockClient.onUserEvent.args.find((args) => args[0] === GamePlayerSocketEvent.Disconnect)[1];
            disconnectCallback();
            expect(leaveGameSpy.calledTwice).to.equal(true);
        });
    });

    describe('leaveGame', () => {
        it('should emit kicked out message and reset state', () => {
            const emitClientKickedOutSpy = spy(
                gameLeaderboardState as unknown as { emitClientKickedOut: (reason: string) => void },
                'emitClientKickedOut',
            );

            gameLeaderboardState['leaveGame']();

            expect(emitClientKickedOutSpy.calledOnceWithExactly(KickedOutMessage.EmptyMessage)).to.equal(true);
            expect(mockClientHandlerService.resetState.calledOnce).to.equal(true);
        });
    });
});
