import { Socket } from 'socket.io';
import { BaseSocketHandler } from './base-socket-handler';
import { SocketManager } from './socket-manager.service';
import * as sinon from 'sinon';
import { expect } from 'chai';

class MockSocketHandler extends BaseSocketHandler {
    socketName: string = 'test';
}

describe('BaseSocketHandler', () => {
    let socketManagerStub: sinon.SinonStubbedInstance<SocketManager>;

    beforeEach(() => {
        socketManagerStub = sinon.createStubInstance(SocketManager);
    });

    it('should call createSocketServer method of SocketManager on setUpSocket call', () => {
        const mockSocketHandler = new MockSocketHandler(socketManagerStub);

        mockSocketHandler.setUpSocket();

        sinon.assert.calledOnceWithExactly(socketManagerStub.createSocketServer, mockSocketHandler);
    });

    it('onConnection base implementation should do and return nothing', () => {
        const mockSocketHandler = new MockSocketHandler(socketManagerStub);
        const value = mockSocketHandler.onConnection({} as Socket);
        expect(value).to.equal(undefined);
    });
});
