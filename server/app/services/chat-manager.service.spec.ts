import { expect } from 'chai';
import { ChatManager } from './chat-manager.service';
import { ChatUserInfo } from '@common/interfaces/chat/chat-user-info';
import { UpdateChatUsername } from '@common/interfaces/chat/update-chat-username';
import { Socket } from 'socket.io';
import { createStubInstance } from 'sinon';

describe('ChatManager', () => {
    let chatManager: ChatManager;

    beforeEach(() => {
        chatManager = new ChatManager();
    });

    it('should register a chat user', () => {
        const chatInfo: ChatUserInfo = { chatId: 1, username: 'user1' };
        const userSocket = createStubInstance(Socket);

        chatManager.registerChatUser(chatInfo, userSocket as Socket);

        expect(chatManager.findUserSocket(chatInfo)).to.equal(userSocket);
    });

    it('should unregister a chat user', () => {
        const chatInfo: ChatUserInfo = { chatId: 1, username: 'user1' };
        const userSocket = createStubInstance(Socket);

        chatManager.registerChatUser(chatInfo, userSocket as Socket);
        chatManager.unregisterChatUser(chatInfo);

        expect(chatManager.findUserSocket(chatInfo)).to.equal(undefined);
    });

    it('should update the username of a chat user', () => {
        const chatInfo: ChatUserInfo = { chatId: 1, username: 'oldUsername' };
        const newUsername = 'newUsername';
        const updateUsername: UpdateChatUsername = { oldUsername: chatInfo.username, newUsername };
        const userSocket = createStubInstance(Socket);

        chatManager.registerChatUser(chatInfo, userSocket as Socket);
        chatManager.updateUserName(chatInfo.chatId, updateUsername);

        const updatedChatInfo: ChatUserInfo = { chatId: chatInfo.chatId, username: newUsername };
        expect(chatManager.findUserSocket(updatedChatInfo)).to.equal(userSocket);
        expect(chatManager.findUserSocket(chatInfo)).to.equal(undefined);
    });

    it('should toggle user ban status', () => {
        const chatInfo: ChatUserInfo = { chatId: 1, username: 'user1' };

        const initialBanStatus = chatManager.toggleUserBan(chatInfo);
        expect(initialBanStatus).to.equal(true);

        const secondBanStatus = chatManager.toggleUserBan(chatInfo);
        expect(secondBanStatus).to.equal(false);
    });
});
