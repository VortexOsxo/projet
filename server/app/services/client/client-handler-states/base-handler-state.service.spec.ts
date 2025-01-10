import { expect } from 'chai';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { BaseHandlerState } from './base-handler-state.service';
import { ClientHandlerService } from '@app/services/client/client-handler.service';
import { GameLobby } from '@app/classes/game/game-lobby';
import { GameSessionBase } from '@app/classes/game/game-session-base';
import { Client } from '@app/classes/client';

class TestHandlerState extends BaseHandlerState {
    clearState(): void {
        // no need for implementation in the testing
    }

    protected initializeState(): void {
        // no need for implementation in the testing
    }
}

describe('BaseHandlerState', () => {
    let mockClientHandlerService: SinonStubbedInstance<ClientHandlerService>;
    let mockClient: SinonStubbedInstance<Client>;
    let testHandlerState: TestHandlerState;

    beforeEach(() => {
        mockClientHandlerService = createStubInstance(ClientHandlerService);
        mockClient = createStubInstance(Client);
        mockClientHandlerService.client = mockClient;
        testHandlerState = new TestHandlerState(mockClientHandlerService);
    });

    describe('game', () => {
        it('should return the game from ClientHandlerService', () => {
            const mockGame = createStubInstance(GameLobby);
            mockClientHandlerService.game = mockGame;

            expect(testHandlerState['game']).to.equal(mockGame);
        });
    });

    describe('gameSession', () => {
        it('should return undefined if game is not an instance of GameSessionBase', () => {
            const mockGame = createStubInstance(GameLobby);
            mockClientHandlerService.game = mockGame;

            expect(testHandlerState['gameSession']).to.equal(undefined);
        });

        it('should return the game if it is an instance of GameSessionBase', () => {
            const mockGame = createStubInstance(GameSessionBase);
            mockClientHandlerService.game = mockGame;

            expect(testHandlerState['gameSession']).to.equal(mockGame);
        });
    });

    describe('gameLobby', () => {
        it('should return undefined if game is not an instance of GameLobby', () => {
            const mockGame = createStubInstance(GameSessionBase);
            mockClientHandlerService.game = mockGame;

            expect(testHandlerState['gameLobby']).to.equal(undefined);
        });

        it('should return the game if it is an instance of GameLobby', () => {
            const mockGame = createStubInstance(GameLobby);
            mockClientHandlerService.game = mockGame;

            expect(testHandlerState['gameLobby']).to.equal(mockGame);
        });
    });

    describe('client', () => {
        it('should return the client from ClientHandlerService', () => {
            mockClientHandlerService.client = mockClient;

            expect(testHandlerState['client']).to.equal(mockClient);
        });
    });

    describe('emitToClient', () => {
        it('should call client.emitToUser with the provided eventName and eventValue', () => {
            const eventName = 'testEvent';
            const eventValue = { data: 'testData' };

            testHandlerState['emitToClient'](eventName, eventValue);

            expect(mockClient.emitToUser.calledOnce).to.equal(true);
            expect(mockClient.emitToUser.calledWithExactly(eventName, eventValue)).to.equal(true);
        });

        it('should call client.emitToUser with only the provided eventName if no eventValue is provided', () => {
            const eventName = 'testEvent';

            testHandlerState['emitToClient'](eventName);

            expect(mockClient.emitToUser.calledOnce).to.equal(true);
            expect(mockClient.emitToUser.calledWith(eventName)).to.equal(true);
        });
    });
});
