import { SinonStubbedInstance, createStubInstance, stub } from 'sinon';
import { Socket } from 'socket.io';
import { Client } from './client';
import { expect } from 'chai';
import { ORGANIZER_USERNAME } from '@common/config/game-config';

describe('Client', () => {
    // We do not need to specify the inner type of the socket as it is a mock
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let socketStub: SinonStubbedInstance<Socket<any, any, any, any>>;
    let client: Client;

    beforeEach(() => {
        socketStub = createStubInstance(Socket);

        client = new Client(socketStub);
    });

    it('should reset state correctly', () => {
        client.name = 'John';
        client.score = 100;
        client.bonusCount = 5;

        client.resetState();

        expect(client.name).to.equal('');
        expect(client.score).to.equal(0);
        expect(client.bonusCount).to.equal(0);
    });

    it('should be able to pass a username when reseting', () => {
        client.name = 'John';
        client.score = 100;
        client.bonusCount = 5;

        client.resetState(ORGANIZER_USERNAME);

        expect(client.name).to.equal(ORGANIZER_USERNAME);
        expect(client.score).to.equal(0);
        expect(client.bonusCount).to.equal(0);
    });

    it('should properly emit to socket', () => {
        const mockEventName = 'mockEvent';
        const mockValue = 123;

        client.emitToUser(mockEventName, mockValue);

        expect(socketStub.emit.calledWith(mockEventName, mockValue));
    });

    it('should properly removeListener', () => {
        const mockEventName = 'mockEvent';

        client.removeEventListeners(mockEventName);

        expect(socketStub.removeAllListeners.calledWith(mockEventName));
    });

    it('should properly add event listener to socket', () => {
        const mockEventName = 'mockEvent';
        const mockCallback = stub();

        client.onUserEvent(mockEventName, mockCallback);

        expect(socketStub.on.calledWith(mockEventName, mockCallback)).to.equal(true);
    });
});
