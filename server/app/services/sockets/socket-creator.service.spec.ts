import { Server } from 'http';
import { Container } from 'typedi';
import { SocketManager } from './socket-manager.service';
import { SocketCreatorService } from './socket-creator.service';
import { BaseSocketHandler } from './base-socket-handler';
import * as sinon from 'sinon';

class MockSocketHandler extends BaseSocketHandler {
    socketName: string = 'mockHandler';
}

describe('SocketCreatorService', () => {
    let socketCreatorService: SocketCreatorService;
    let socketManagerStub: sinon.SinonStubbedInstance<SocketManager>;
    let mockSocketHandler: sinon.SinonStubbedInstance<MockSocketHandler>;
    let containerGetStub: sinon.SinonStub;

    beforeEach(() => {
        socketManagerStub = sinon.createStubInstance(SocketManager);
        mockSocketHandler = sinon.createStubInstance(MockSocketHandler);
        containerGetStub = sinon.stub(Container, 'get').returns(mockSocketHandler);
        Container.set(SocketManager, socketManagerStub);

        socketCreatorService = new SocketCreatorService();
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should set up sockets for all registered socket handlers', () => {
        SocketCreatorService['socketRegistry'] = [MockSocketHandler];

        const serverMock = {} as Server;

        socketCreatorService.setUpSockets(serverMock);

        sinon.assert.calledOnce(containerGetStub);
        sinon.assert.calledOnce(mockSocketHandler.setUpSocket);
    });

    it('should ignore the class if the container return undefined', () => {
        SocketCreatorService['socketRegistry'] = [MockSocketHandler];

        const serverMock = {} as Server;
        containerGetStub.returns(undefined);

        socketCreatorService.setUpSockets(serverMock);

        sinon.assert.calledOnce(containerGetStub);
    });
});
