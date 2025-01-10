import { expect } from 'chai';
import { GameManagerService } from '@app/services/game/game-manager.service';
import { ClientHandlerService } from './client-handler.service';
import { Socket } from 'socket.io';
import { Client } from '@app/classes/client';
import { ClientHandlerBuilder } from './client-handler-builder.service';
import { SinonStubbedInstance, createStubInstance } from 'sinon';

describe('ClientHandlerBuilder', () => {
    let clientHandlerBuilder: ClientHandlerBuilder;
    // We do not need to specify the inter type of the socket as it is a mock
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let socketMock: SinonStubbedInstance<Socket<any, any, any, any>>;

    beforeEach(() => {
        clientHandlerBuilder = new ClientHandlerBuilder();
        socketMock = createStubInstance(Socket);
    });

    it('build method should return an instance of ClientHandlerService', () => {
        const result = clientHandlerBuilder.build(socketMock);
        expect(result).to.be.an.instanceOf(ClientHandlerService);
    });

    it('build method should construct a Client object with the provided socket', () => {
        const result = clientHandlerBuilder.build(socketMock);
        expect(result['client']).to.be.an.instanceOf(Client);
        expect(result['client']['socket']).to.equal(socketMock);
    });

    it('build method should construct a ClientHandlerService object with a GameManagerService instance', () => {
        const result = clientHandlerBuilder.build(socketMock);
        expect(result['gameManagerService']).to.be.an.instanceOf(GameManagerService);
    });
});
