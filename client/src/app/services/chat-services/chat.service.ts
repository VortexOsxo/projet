import { EventEmitter, Injectable } from '@angular/core';
import { GameInfoService } from '@app/services/game-services/game-info.service';
import { SocketFactoryService } from '@app/services/socket-service/socket-factory.service';
import { SocketService } from '@app/services/socket-service/socket.service';
import { CHAT_SOCKET_NAME } from '@common/config/socket-config';
import { ChatSocketEvent } from '@common/enums/socket-event/chat-socket-event';

@Injectable({
    providedIn: 'root',
})
export class ChatService {
    username: string;
    leftChatEvent: EventEmitter<void>;

    private socketService: SocketService;

    constructor(
        socketFactory: SocketFactoryService,
        private gameInfoService: GameInfoService,
    ) {
        this.leftChatEvent = new EventEmitter();
        this.socketService = socketFactory.getSocket(CHAT_SOCKET_NAME);
        this.setUpObservable();
    }

    banUser(username: string) {
        this.socketService.emit(ChatSocketEvent.BanUser, username);
    }

    leaveChat() {
        this.socketService.emit(ChatSocketEvent.LeaveChat);
        this.leftChatEvent.emit();
    }

    private setUpObservable() {
        this.gameInfoService.getUsernameObservable().subscribe((username) => this.onUsernameUpdate(username));
        this.gameInfoService.getGameIdObservable().subscribe((gameId) => this.onGameIdUpdate(gameId));
    }

    private onGameIdUpdate(newGameId: number) {
        this.socketService.emit(ChatSocketEvent.LeaveChat, this.username);
        this.socketService.emit(ChatSocketEvent.JoinChat, { chatId: newGameId, username: this.username });
        this.leftChatEvent.emit();
    }

    private onUsernameUpdate(newUsername: string) {
        this.socketService.emit(ChatSocketEvent.UpdateUsername, { newUsername, oldUsername: this.username });
        this.username = newUsername;
    }
}
