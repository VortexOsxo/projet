import { ChatMessage } from '@common/interfaces/chat/chat-message';
import { ChatUserInfo } from '@common/interfaces/chat/chat-user-info';
import { UpdateChatUsername } from '@common/interfaces/chat/update-chat-username';
import { Socket } from 'socket.io';
import { Service } from 'typedi';
import { BaseSocketHandler } from './base-socket-handler';
import { CHAT_SOCKET_NAME } from '@common/config/socket-config';
import { ChatSocketEvent } from '@common/enums/socket-event/chat-socket-event';
import { ChatManager } from '@app/services/chat-manager.service';
import { SocketManager } from './socket-manager.service';
import { EMPTY_CHAT_INFO } from '@app/consts/chat.consts';

@Service()
export class ChatSocket extends BaseSocketHandler {
    socketName: string = CHAT_SOCKET_NAME;

    constructor(
        socketManager: SocketManager,
        private chatManager: ChatManager,
    ) {
        super(socketManager);
    }

    onConnection(socket: Socket) {
        let chatInfo: ChatUserInfo = EMPTY_CHAT_INFO;

        socket.on(ChatSocketEvent.JoinChat, (chatUserInfo: ChatUserInfo) => {
            chatInfo = chatUserInfo;
            this.onJoinChat(socket, chatUserInfo);
        });

        socket.on(ChatSocketEvent.PostMessage, (message: ChatMessage) => this.emitToRoom(ChatSocketEvent.GetMessage, message, chatInfo.chatId));

        socket.on(ChatSocketEvent.BanUser, (username: string) => this.onBanUser({ chatId: chatInfo.chatId, username }));
        socket.on(ChatSocketEvent.UpdateUsername, (updateUsername: UpdateChatUsername) => this.updateUserName(chatInfo, updateUsername));

        socket.on(ChatSocketEvent.LeaveChat, () => this.onLeaveChat(socket, chatInfo));
        socket.on('disconnect', () => this.onLeaveChat(socket, chatInfo));
    }

    private onJoinChat(socket: Socket, chatUserInfo: ChatUserInfo) {
        if (!chatUserInfo.chatId) return;
        socket.join(this.getRoomName(chatUserInfo.chatId));
        this.chatManager.registerChatUser(chatUserInfo, socket);
    }

    private onLeaveChat(socket: Socket, chatInfo: ChatUserInfo) {
        socket.leave(this.getRoomName(chatInfo.chatId));
        this.emitToRoom(ChatSocketEvent.UserLeft, chatInfo.username, chatInfo.chatId);
        this.chatManager.unregisterChatUser(chatInfo);
    }

    private onBanUser(chatInfo: ChatUserInfo) {
        const banUserSocket = this.chatManager.findUserSocket(chatInfo);
        banUserSocket?.emit(ChatSocketEvent.OnUserBanned, this.chatManager.toggleUserBan(chatInfo));
    }

    private updateUserName(chatInfo: ChatUserInfo, updateUsername: UpdateChatUsername) {
        if (!chatInfo.chatId) return;
        chatInfo.username = updateUsername.newUsername;
        this.chatManager.updateUserName(chatInfo.chatId, updateUsername);
    }

    private emitToRoom<ValueType>(eventName: string, value: ValueType, chatId: number) {
        this.socketManager.emitToRoom(this.getRoomName(chatId), eventName, value);
    }

    private getRoomName(chatId: number) {
        return `chat-${chatId}`;
    }
}
