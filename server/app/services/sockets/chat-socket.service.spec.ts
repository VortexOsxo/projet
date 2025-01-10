import { ChatSocket } from './chat-socket.service';
import { SinonStubbedInstance, createStubInstance, restore, SinonSpy, spy } from 'sinon';
import { SocketManager } from './socket-manager.service';
import { Socket } from 'socket.io';
import { expect } from 'chai';
import { ChatManager } from '@app/services/chat-manager.service';
import { ChatSocketEvent } from '@common/enums/socket-event/chat-socket-event';
import { UpdateChatUsername } from '@common/interfaces/chat/update-chat-username';

describe('ChatSocket', () => {
    let socketManagerStub: SinonStubbedInstance<SocketManager>;
    let chatManagerStub: SinonStubbedInstance<ChatManager>;
    let chatSocket: ChatSocket;

    // We do not need to specify the inter type of the socket as it is a mock
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let socketMock: SinonStubbedInstance<Socket<any, any, any, any>>;

    let emitToRoomSpy: SinonSpy;

    beforeEach(() => {
        chatManagerStub = createStubInstance(ChatManager);
        socketManagerStub = createStubInstance(SocketManager);
        chatSocket = new ChatSocket(socketManagerStub, chatManagerStub);

        socketMock = createStubInstance(Socket);
        emitToRoomSpy = spy(chatSocket as unknown as { emitToRoom: (eventName: string, value: unknown) => void }, 'emitToRoom');

        chatSocket.onConnection(socketMock);
    });

    afterEach(() => {
        restore();
    });

    it('should join chat and emit userJoined event', () => {
        const chatId = 123;
        const username = 'testUser';

        const argsUsed = socketMock.on.getCall(0).args;

        expect(argsUsed[0]).to.equal(ChatSocketEvent.JoinChat);
        argsUsed[1]({ chatId, username });

        expect(socketMock.join.calledWith(`chat-${chatId}`)).to.equal(true);
    });

    it('should emit getMessage event when postMessage event is received', () => {
        const message = { id: 1, text: 'Test message' };

        const argsUsed = socketMock.on.getCall(1).args;

        expect(argsUsed[0]).to.equal(ChatSocketEvent.PostMessage);
        argsUsed[1](message);

        expect(emitToRoomSpy.calledWith(ChatSocketEvent.GetMessage, message)).to.equal(true);
    });

    it('should ban user when requested', () => {
        const username = 'mockUsername';

        chatManagerStub.findUserSocket.returns(createStubInstance(Socket));

        const argsUsed = socketMock.on.getCall(2).args;

        expect(argsUsed[0]).to.equal(ChatSocketEvent.BanUser);
        argsUsed[1](username);

        expect(chatManagerStub.toggleUserBan.calledWith({ chatId: 0, username })).to.equal(true);
    });

    it('should not ban user if it cant find the socket', () => {
        const username = 'mockUsername';

        const argsUsed = socketMock.on.getCall(2).args;

        expect(argsUsed[0]).to.equal(ChatSocketEvent.BanUser);
        argsUsed[1](username);

        expect(chatManagerStub.toggleUserBan.called).to.equal(false);
    });

    it('should update user username', () => {
        const updateUserName: UpdateChatUsername = { newUsername: 'new', oldUsername: 'old' };
        const chatId = 123;
        const username = 'testUser';

        const joinArgUsed = socketMock.on.getCall(0).args;
        joinArgUsed[1]({ chatId, username });

        const updateArgUsed = socketMock.on.getCall(3).args;

        expect(updateArgUsed[0]).to.equal(ChatSocketEvent.UpdateUsername);
        updateArgUsed[1](updateUserName);

        expect(chatManagerStub.updateUserName.calledWith(chatId, updateUserName)).to.equal(true);
    });

    it('should not update user username ifchat id is not defined', () => {
        const updateUserName: UpdateChatUsername = { newUsername: 'new', oldUsername: 'old' };

        const argsUsed = socketMock.on.getCall(3).args;

        expect(argsUsed[0]).to.equal(ChatSocketEvent.UpdateUsername);
        argsUsed[1](updateUserName);

        expect(chatManagerStub.updateUserName.called).to.equal(false);
    });

    it('should emit userLeft event and leave chat room', () => {
        const foruthSocketCall = 4;
        const argsUsed = socketMock.on.getCall(foruthSocketCall).args;

        expect(argsUsed[0]).to.equal(ChatSocketEvent.LeaveChat);
        argsUsed[1]();

        expect(socketMock.leave.calledWith('chat-0')).to.equal(true);
        expect(socketManagerStub.emitToRoom.calledWith(ChatSocketEvent.UserLeft));
    });

    it('should emit userLeft event and leave chat room when users disconnect', () => {
        const fifthSocketCall = 5;
        const argsUsed = socketMock.on.getCall(fifthSocketCall).args;

        expect(argsUsed[0]).to.equal('disconnect');
        argsUsed[1]();

        expect(socketMock.leave.calledWith('chat-0')).to.equal(true);
        expect(socketManagerStub.emitToRoom.calledWith(ChatSocketEvent.UserLeft));
    });

    it('should not join chat if chat id is undefined', () => {
        const chatId = 0;
        const username = 'testUser';

        const argsUsed = socketMock.on.getCall(0).args;

        expect(argsUsed[0]).to.equal(ChatSocketEvent.JoinChat);
        argsUsed[1]({ chatId, username });

        expect(socketMock.join.called).to.equal(false);
    });
});
