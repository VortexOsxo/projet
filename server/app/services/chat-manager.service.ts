import { ChatUserInfo } from '@common/interfaces/chat/chat-user-info';
import { UpdateChatUsername } from '@common/interfaces/chat/update-chat-username';
import { Socket } from 'socket.io';
import { Service } from 'typedi';

@Service()
export class ChatManager {
    private chatUsers: Map<string, Socket>;
    private bannedUsers: Set<string>;

    constructor() {
        this.chatUsers = new Map();
        this.bannedUsers = new Set();
    }

    registerChatUser(chatInfo: ChatUserInfo, userSocket: Socket) {
        this.chatUsers.set(this.getUsersKey(chatInfo), userSocket);
    }

    unregisterChatUser(chatInfo: ChatUserInfo) {
        this.chatUsers.delete(this.getUsersKey(chatInfo));
    }

    updateUserName(chatId: number, updateUsername: UpdateChatUsername) {
        const userSocket = this.findUserSocket({ chatId, username: updateUsername.oldUsername });
        this.unregisterChatUser({ chatId, username: updateUsername.oldUsername });
        this.registerChatUser({ chatId, username: updateUsername.newUsername }, userSocket);
    }

    toggleUserBan(chatInfo: ChatUserInfo) {
        const userKey = this.getUsersKey(chatInfo);
        if (this.bannedUsers.delete(userKey)) return false;

        this.bannedUsers.add(userKey);
        return true;
    }

    findUserSocket(chatInfo: ChatUserInfo) {
        return this.chatUsers.get(this.getUsersKey(chatInfo));
    }

    private getUsersKey(chatInfo: ChatUserInfo) {
        return `${chatInfo.chatId}-${chatInfo.username}`;
    }
}
