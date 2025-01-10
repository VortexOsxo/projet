import { assert } from 'chai';
import { SocketManager } from './socket-manager.service';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { GameHistorySocket } from './game-history-socket.service';

describe('GameHistorySocket', () => {
    let socketManagerStub: SinonStubbedInstance<SocketManager>;
    let gameHistorySocket: GameHistorySocket;

    beforeEach(() => {
        socketManagerStub = createStubInstance(SocketManager);

        gameHistorySocket = new GameHistorySocket(socketManagerStub);
    });

    it('emitGameHistoryChangedNotification should call emit method on SocketManager', () => {
        gameHistorySocket.emitGameHistoryChangedNotification();

        assert(socketManagerStub.emit.calledOnceWithExactly('gameHistoryChangedNotification'));
    });
});
