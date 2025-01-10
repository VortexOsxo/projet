import { SocketManager } from './socket-manager.service';
import { io as ioClient, Socket } from 'socket.io-client';
import * as io from 'socket.io';
import * as sinon from 'sinon';
import * as http from 'http';
import { expect } from 'chai';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { BaseSocketHandler } from './base-socket-handler';

class MockSocketHandler extends BaseSocketHandler {
    socketName: string = 'test';
}

const mockValue = 5;

describe('SocketManager service tests', () => {
    let service: SocketManager;
    let clientSocket: Socket;

    // We do not need to specify the intern type of the socket as it is a mock and it is not needed for the tests
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let ioServerMock: sinon.SinonStubbedInstance<io.Server<DefaultEventsMap, any, any, any>>;
    // We do not need to specify the intern type of the socket as it is a mock and it is not needed for the tests
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let socketsMock: sinon.SinonStubbedInstance<io.Socket<any, any, any, any>>;
    let mockSocketHandler: sinon.SinonStubbedInstance<MockSocketHandler>;

    const urlString = 'http://localhost:5020';
    const mockEvent = 'testEvent';

    beforeEach(async () => {
        ioServerMock = sinon.createStubInstance(io.Server);
        socketsMock = sinon.createStubInstance(io.Socket);

        // We need to inject our socket mock to be able to properly do our test, our its a read only property
        // we therefore need to cast as any to be able to modify it
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (ioServerMock as any).sockets = socketsMock;

        service = new SocketManager();

        service['sio'] = ioServerMock;
        mockSocketHandler = sinon.createStubInstance(MockSocketHandler);

        clientSocket = ioClient(urlString);
    });

    afterEach(() => {
        clientSocket.close();
        sinon.restore();
    });

    it('Should be able to properly set the server', () => {
        const mockServer = {} as http.Server;
        SocketManager.setUpHttpServer(mockServer);
        expect(SocketManager['server']).equal(mockServer);
    });

    describe('CreateSocketServer test', () => {
        let mockHttpServer: http.Server;
        let ioServerStub: sinon.SinonStub;

        beforeEach(() => {
            mockHttpServer = {} as http.Server;
            SocketManager['server'] = mockHttpServer;
            ioServerStub = sinon.stub(io, 'Server').returns(ioServerMock);
        });

        afterEach(() => {
            ioServerStub.restore();
        });

        it('Should properly create a socket server with the right path', () => {
            service.createSocketServer(mockSocketHandler);

            sinon.assert.calledOnceWithExactly(ioServerStub, mockHttpServer, {
                cors: { origin: '*', methods: ['GET', 'POST'] },
                path: `/websocket/${mockSocketHandler.socketName}/`,
            });
            expect(service['sio']).to.equal(ioServerMock);
        });

        it('should call the onConnection method from the socket handler', () => {
            // Here function properly represent the type needed for this test
            // so we prefer to use it intead of using a arrow function type
            // since it does not affect the test in any way
            // eslint-disable-next-line @typescript-eslint/ban-types
            let onConnectionCallback: Function | undefined;
            ioServerMock.on.callsFake((eventName: string, callback) => {
                if (eventName === 'connection') {
                    onConnectionCallback = callback;
                }
                return undefined;
            });

            service.createSocketServer(mockSocketHandler);
            expect(onConnectionCallback).to.be.a('function');

            onConnectionCallback(socketsMock);

            sinon.assert.calledOnceWithExactly(mockSocketHandler.onConnection, socketsMock);
        });

        it('Should throw error if HTTP server reference is not provided', () => {
            SocketManager['server'] = undefined;

            const createSocketServerWithoutServer = () => service.createSocketServer(mockSocketHandler);
            expect(createSocketServerWithoutServer).to.throw('HttpServer reference has not been given');
        });

        describe('emit to room test', () => {
            interface BroadcastOperatorStub {
                emit: sinon.SinonStub;
            }

            const mockRoom = 'room1';
            let broadcastOperatorStub: BroadcastOperatorStub;

            beforeEach(() => {
                broadcastOperatorStub = {
                    emit: sinon.stub(),
                };

                ioServerMock.to.callsFake(() => {
                    // Once again the return type is not the right one as this is a Stub,
                    // therefore we cast it as any to pass it as the right type to the compiler
                    // even thought we know its a stub
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    return broadcastOperatorStub as any;
                });
            });

            it('emit to room should emit the event to the room', () => {
                service.emitToRoom(mockRoom, mockEvent, mockValue);

                sinon.assert.calledOnceWithExactly(ioServerMock.to, mockRoom);
                sinon.assert.calledOnceWithExactly(broadcastOperatorStub.emit, mockEvent, mockValue);
            });

            it('emit to room should emit a value only if provided', () => {
                service.emitToRoom(mockRoom, mockEvent);

                sinon.assert.calledOnceWithExactly(ioServerMock.to, mockRoom);
                sinon.assert.calledOnceWithExactly(broadcastOperatorStub.emit, mockEvent);
            });
        });
    });

    it('emit should emit event to the socket.io server', () => {
        service.emit(mockEvent, mockValue);

        sinon.assert.calledOnceWithExactly(socketsMock.emit, mockEvent, mockValue);
    });

    it('emit should emit a value only if provided', () => {
        service.emit(mockEvent);

        sinon.assert.calledOnceWithExactly(socketsMock.emit, mockEvent);
    });
});
