import { expect } from 'chai';
import { SinonStubbedInstance, createStubInstance, spy } from 'sinon';
import { DefaultState } from './client-default-state.service';
import { GameManagerService } from '@app/services/game/game-manager.service';
import { ClientHandlerService } from '@app/services/client/client-handler.service';
import { ClientState } from '@app/enums/client-state';
import { Response } from '@common/interfaces/response';
import { GameLobby } from '@app/classes/game/game-lobby';
import { GameBase } from '@app/classes/game/game-base';
import { Client } from '@app/classes/client';
import { GameResponse } from '@app/enums/game-response';
import { GameManagementSocketEvent } from '@common/enums/socket-event/game-management-socket-event';

describe('DefaultStateService', () => {
    let mockGameManagerService: SinonStubbedInstance<GameManagerService>;
    let mockClientHandlerService: SinonStubbedInstance<ClientHandlerService>;
    let mockClient: SinonStubbedInstance<Client>;
    let defaultStateService: DefaultState;

    const mockGameId = 213;

    beforeEach(() => {
        mockGameManagerService = createStubInstance(GameManagerService);
        mockClientHandlerService = createStubInstance(ClientHandlerService);
        mockClient = createStubInstance(Client);

        mockClientHandlerService.client = mockClient;

        defaultStateService = new DefaultState(mockGameManagerService, mockClientHandlerService);
    });

    describe('clearState', () => {
        it('should remove all listeners from socket', () => {
            defaultStateService.clearState();

            expect(mockClient.removeEventListeners.calledWith(GameManagementSocketEvent.JoinGameLobby)).to.equal(true);
            expect(mockClient.removeEventListeners.calledWith(GameManagementSocketEvent.CreateGameLobby)).to.equal(true);
            expect(mockClient.removeEventListeners.calledWith(GameManagementSocketEvent.CreateGameTest)).to.equal(true);
        });
    });

    describe('initializeState', () => {
        it('should add listeners to socket for join game lobby, create game lobby, and create game test events', () => {
            expect(mockClient.onUserEvent.calledWith(GameManagementSocketEvent.JoinGameLobby)).to.equal(true);
            expect(mockClient.onUserEvent.calledWith(GameManagementSocketEvent.CreateGameLobby)).to.equal(true);
            expect(mockClient.onUserEvent.calledWith(GameManagementSocketEvent.CreateGameTest)).to.equal(true);
        });

        it('should register JOIN_GAME_LOBBY_EVENT with the correct callback', () => {
            expect(mockClient.onUserEvent.args[0][0]).to.equal(GameManagementSocketEvent.JoinGameLobby);

            const callback = mockClient.onUserEvent.args[0][1];

            const joinGameSpy = spy(defaultStateService as unknown as { joinGame: (gameId: number) => void }, 'joinGame');
            callback(mockGameId, () => {
                // No need to pass an implemented function for the test
            });
            expect(joinGameSpy.calledOnce).to.equal(true);
            expect(joinGameSpy.calledWith(mockGameId)).to.equal(true);
        });

        it('should register CREATE_GAME_LOBBY_EVENT with the correct callback', () => {
            expect(mockClient.onUserEvent.args[1][0]).to.equal(GameManagementSocketEvent.CreateGameLobby);

            const callback = mockClient.onUserEvent.args[1][1];

            const createGameLobbySpy = spy(defaultStateService as unknown as { createGameLobby: (quizId: string) => void }, 'createGameLobby');
            callback('quizId', () => {
                // No need to pass an implemented function for the test
            });
            expect(createGameLobbySpy.calledOnce).to.equal(true);
            expect(createGameLobbySpy.calledWith('quizId')).to.equal(true);
        });

        it('should register CREATE_GAME_TEST_EVENT with the correct callback', () => {
            expect(mockClient.onUserEvent.args[2][0]).to.equal(GameManagementSocketEvent.CreateGameTest);

            const callback = mockClient.onUserEvent.args[2][1];

            const createGameTestSpy = spy(defaultStateService as unknown as { createGameTest: (quizId: string) => void }, 'createGameTest');
            callback('quizId', () => {
                // No need to pass an implemented function for the test
            });
            expect(createGameTestSpy.calledOnce).to.equal(true);
            expect(createGameTestSpy.calledWith('quizId')).to.equal(true);
        });
    });

    describe('joinGame', () => {
        it('should return unsuccessful response if game is not found', () => {
            mockGameManagerService.getGameById.returns(undefined);

            const response: Response = defaultStateService['joinGame'](mockGameId);

            expect(response.success).to.equal(false);
            expect(response.message).to.equal(GameResponse.NoGameFound);
        });

        it('should return unsuccessful response if game is not an instance of GameLobby', () => {
            const mockGame: GameBase = createStubInstance(GameBase);
            mockGameManagerService.getGameById.returns(mockGame);

            const response: Response = defaultStateService['joinGame'](mockGameId);

            expect(response.success).to.equal(false);
            expect(response.message).to.equal(GameResponse.NoGameFound);
        });

        it('should return successful response and set client state to GamePlayer if player is added successfully', () => {
            const mockGame: SinonStubbedInstance<GameLobby> = createStubInstance(GameLobby);
            const response: Response = { success: true };

            mockGameManagerService.getGameById.returns(mockGame);
            mockGame.addPlayer.returns(response);

            const updateStateSpy = mockClientHandlerService.updateState;

            defaultStateService['joinGame'](mockGameId);

            expect(mockClientHandlerService.game).to.equal(mockGame);
            expect(updateStateSpy.calledOnceWith(ClientState.GamePlayer)).to.equal(true);
        });

        it('should not update state if the response is unsuccesfull', () => {
            const mockGame: SinonStubbedInstance<GameLobby> = createStubInstance(GameLobby);
            const response: Response = { success: false };

            mockGameManagerService.getGameById.returns(mockGame);
            mockGame.addPlayer.returns(response);

            const updateStateSpy = mockClientHandlerService.updateState;

            defaultStateService['joinGame'](mockGameId);

            expect(mockClientHandlerService.game).to.equal(undefined);
            expect(updateStateSpy.calledOnce).to.equal(false);
        });
    });

    describe('createGameLobby', () => {
        it('should return false if createdGame is falsy', async () => {
            const quizId = 'mockGameId';
            const createdGame: GameBase | undefined = undefined;

            mockGameManagerService.createGameLobby.resolves(createdGame);

            const result: boolean = await defaultStateService['createGameLobby'](quizId);

            expect(result).to.equal(false);
            expect(mockClientHandlerService.updateState.called).to.equal(false);
        });

        it('should return true if createdGame is truthy', async () => {
            const quizId = 'mockGameId';
            const createdGame: SinonStubbedInstance<GameBase> = createStubInstance(GameBase);

            mockGameManagerService.createGameLobby.resolves(createdGame);

            const updateStateSpy = mockClientHandlerService.updateState;

            const result: boolean = await defaultStateService['createGameLobby'](quizId);

            expect(result).to.equal(true);
            expect(updateStateSpy.calledOnceWith(ClientState.GameOrganizer)).to.equal(true);
        });
    });

    describe('createGameTest', () => {
        it('should return false if createdGame is falsy', async () => {
            const quizId = 'mockGameId';
            const createdGame: GameBase | undefined = undefined;

            mockGameManagerService.createTestGame.resolves(createdGame);

            const result: boolean = await defaultStateService['createGameTest'](quizId);

            expect(result).to.equal(false);
            expect(mockClientHandlerService.updateState.called).to.equal(false);
        });

        it('should return true if createdGame is truthy', async () => {
            const quizId = 'mockGameId';
            const createdGame: SinonStubbedInstance<GameBase> = createStubInstance(GameBase);

            mockGameManagerService.createTestGame.resolves(createdGame);

            const updateStateSpy = mockClientHandlerService.updateState;

            const result: boolean = await defaultStateService['createGameTest'](quizId);

            expect(result).to.equal(true);

            expect(mockClientHandlerService.game).to.equal(createdGame);
            expect(updateStateSpy.calledOnceWith(ClientState.GamePlayer)).to.equal(true);
        });
    });
});
