import { expect } from 'chai';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { ClientHandlerService } from '@app/services/client/client-handler.service';
import { GamePlayerState } from './game-player-state.service';
import { Client } from '@app/classes/client';
import { GameLobby } from '@app/classes/game/game-lobby';
import { createUnsuccessfulResponse } from '@app/utils/responses.utils';
import { Subject } from 'rxjs';
import { Player } from '@app/interfaces/users/player';
import { UserRemoved } from '@app/interfaces/users/user-removed';
import { GameSessionBase } from '@app/classes/game/game-session-base';
import { Response } from '@common/interfaces/response';
import { GameResponse } from '@app/enums/game-response';
import { GameManagementSocketEvent } from '@common/enums/socket-event/game-management-socket-event';
import { GamePlayerSocketEvent } from '@common/enums/socket-event/game-player-socket-event';

describe('GamePlayerState', () => {
    let mockClientHandlerService: SinonStubbedInstance<ClientHandlerService>;

    let mockClient: SinonStubbedInstance<Client>;
    let mockGameLobby: SinonStubbedInstance<GameLobby>;

    let userRemovedSubjectMock: Subject<UserRemoved>;
    let addedPlayerSubjetMock: Subject<Player>;
    let gameStartedSubjectMock: Subject<GameSessionBase>;

    let gamePlayerState: GamePlayerState;

    beforeEach(() => {
        mockClientHandlerService = createStubInstance(ClientHandlerService);
        mockClient = createStubInstance(Client);

        mockGameLobby = createStubInstance(GameLobby);

        userRemovedSubjectMock = new Subject<UserRemoved>();
        addedPlayerSubjetMock = new Subject<Player>();
        gameStartedSubjectMock = new Subject<GameSessionBase>();

        mockGameLobby.removedUserSubject = userRemovedSubjectMock;
        mockGameLobby.addedPlayerSubject = addedPlayerSubjetMock;
        mockGameLobby.gameStartedSubject = gameStartedSubjectMock;

        mockClientHandlerService.game = mockGameLobby;
        mockClientHandlerService.client = mockClient;

        gamePlayerState = new GamePlayerState(mockClientHandlerService);
    });

    describe('clearState', () => {
        it('should remove all listeners and clear the game base state', () => {
            gamePlayerState.clearState();

            expect(mockClient.removeEventListeners.calledWith(GameManagementSocketEvent.SetUsername)).to.equal(true);
            expect(mockClient.removeEventListeners.calledWith(GamePlayerSocketEvent.PlayerLeftGame)).to.equal(true);
            expect(mockClient.removeEventListeners.calledWith(GamePlayerSocketEvent.Disconnect)).to.equal(true);
        });
    });

    describe('initializeState', () => {
        it('should register event listeners and initialize the game base state', () => {
            gamePlayerState['initializeState']();

            expect(mockClient.onUserEvent.calledWith(GameManagementSocketEvent.SetUsername)).to.equal(true);
            expect(mockClient.onUserEvent.calledWith(GamePlayerSocketEvent.PlayerLeftGame)).to.equal(true);
            expect(mockClient.onUserEvent.calledWith(GamePlayerSocketEvent.Disconnect)).to.equal(true);
        });
    });

    describe('leaveGame', () => {
        it('should remove the player from the game and reset client state', () => {
            const playerLeftGameCallback = mockClient.onUserEvent.args.find((args) => args[0] === GamePlayerSocketEvent.PlayerLeftGame)[1];

            playerLeftGameCallback();

            expect(mockGameLobby.removePlayer.calledWith(mockClient)).to.equal(true);
            expect(mockClientHandlerService.resetState.calledOnce).to.equal(true);
        });

        it('should remove the player from the game and reset client state on desiconnect', () => {
            const playerLeftGameCallback = mockClient.onUserEvent.args.find((args) => args[0] === GamePlayerSocketEvent.Disconnect)[1];

            playerLeftGameCallback();

            expect(mockGameLobby.removePlayer.calledWith(mockClient)).to.equal(true);
            expect(mockClientHandlerService.resetState.calledOnce).to.equal(true);
        });

        it('should reset client state when game is undefined and not throw an error', () => {
            const playerLeftGameCallback = mockClient.onUserEvent.args.find((args) => args[0] === GamePlayerSocketEvent.PlayerLeftGame)[1];
            mockClientHandlerService.game = undefined;

            playerLeftGameCallback();

            expect(mockClientHandlerService.resetState.calledOnce).to.equal(true);
        });
    });

    describe('setUsername', () => {
        it('should return an unsuccessful response if the player is not in a game', () => {
            mockGameLobby = undefined;
            mockClientHandlerService.game = mockGameLobby;

            const setUsernameCallback = mockClient.onUserEvent.args.find((args) => args[0] === GameManagementSocketEvent.SetUsername)[1];
            const username = 'testUsername';
            let response: Response | undefined;

            setUsernameCallback(username, (res: Response) => {
                response = res;
            });

            expect(response).to.deep.equal(createUnsuccessfulResponse(GameResponse.NotInGame));
        });

        it('should call setUsername on the game lobby if the player is in a game', () => {
            const mockResponse: Response = { success: true, message: 'Username set successfully' };
            const username = 'testUsername';
            mockGameLobby.setUsername.returns(mockResponse);

            const setUsernameCallback = mockClient.onUserEvent.args.find((args) => args[0] === GameManagementSocketEvent.SetUsername)[1];
            let response: Response | undefined;

            setUsernameCallback(username, (res: Response) => {
                response = res;
            });

            expect(mockGameLobby.setUsername.calledWith(mockClient, username)).to.equal(true);
            expect(response).to.deep.equal(mockResponse);
        });
    });
});
