import { expect } from 'chai';
import { Socket } from 'socket.io';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { GameSocket } from './game-socket.service';
import { SocketManager } from './socket-manager.service';
import { ClientHandlerBuilder } from '@app/services/client/client-handler-builder.service';
import { GAME_SOCKET_NAME } from '@common/config/socket-config';

describe('GameSocket', () => {
    let gameSocket: GameSocket;
    let mockSocketManager: SinonStubbedInstance<SocketManager>;
    let mockGameUserHandlerBuilder: SinonStubbedInstance<ClientHandlerBuilder>;

    beforeEach(() => {
        mockSocketManager = createStubInstance(SocketManager);
        mockGameUserHandlerBuilder = createStubInstance(ClientHandlerBuilder);

        gameSocket = new GameSocket(mockGameUserHandlerBuilder, mockSocketManager);
    });

    it('should set socketName property to GAME_SOCKET_NAME', () => {
        expect(gameSocket.socketName).to.equal(GAME_SOCKET_NAME);
    });

    describe('onConnection', () => {
        it('should call build method of GameUserHandlerBuilder with the socket', () => {
            const mockSocket = createStubInstance(Socket);

            gameSocket.onConnection(mockSocket);

            expect(mockGameUserHandlerBuilder.build.calledOnceWithExactly(mockSocket)).to.equal(true);
        });
    });
});
