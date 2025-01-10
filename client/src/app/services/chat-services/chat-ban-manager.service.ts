import { Injectable } from '@angular/core';
import { SocketService } from '@app/services/socket-service/socket.service';
import { SocketFactoryService } from '@app/services/socket-service/socket-factory.service';
import { CHAT_SOCKET_NAME } from '@common/config/socket-config';
import { ChatSocketEvent } from '@common/enums/socket-event/chat-socket-event';
import { ChatService } from './chat.service';

@Injectable({
    providedIn: 'root',
})
export class ChatBanManagerService {
    private socketService: SocketService;
    private banUserNames: Set<string>;

    constructor(
        socketFactory: SocketFactoryService,
        private chatService: ChatService,
    ) {
        this.socketService = socketFactory.getSocket(CHAT_SOCKET_NAME);
        this.resetState();
        this.chatService.leftChatEvent.subscribe(() => this.resetState());
    }

    isUserBanned(username: string) {
        return this.banUserNames.has(username);
    }

    banUser(username: string) {
        this.socketService.emit(ChatSocketEvent.BanUser, username);
        this.updateBanUserNames(username);
    }

    private updateBanUserNames(username: string) {
        if (this.banUserNames.has(username)) this.banUserNames.delete(username);
        else this.banUserNames.add(username);
    }

    private resetState() {
        this.banUserNames = new Set();
    }
}
