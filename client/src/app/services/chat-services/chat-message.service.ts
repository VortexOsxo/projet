import { Injectable } from '@angular/core';
import { SocketFactoryService } from '@app/services/socket-service/socket-factory.service';
import { SocketService } from '@app/services/socket-service/socket.service';
import { CHAT_SOCKET_NAME } from '@common/config/socket-config';
import { ChatSocketEvent } from '@common/enums/socket-event/chat-socket-event';
import { ChatMessage } from '@common/interfaces/chat/chat-message';
import { BehaviorSubject } from 'rxjs';
import { ChatService } from './chat.service';

@Injectable({
    providedIn: 'root',
})
export class ChatMessageService {
    private chatMessages: ChatMessage[] = [];
    private messagesSubject: BehaviorSubject<ChatMessage[]> = new BehaviorSubject<ChatMessage[]>([]);
    private socketService: SocketService;

    constructor(
        socketFactory: SocketFactoryService,
        private chatService: ChatService,
    ) {
        this.socketService = socketFactory.getSocket(CHAT_SOCKET_NAME);
        this.setUpSocket();
        this.chatService.leftChatEvent.subscribe(() => this.leaveChat());
    }

    get username() {
        return this.chatService.username;
    }

    getMessagesObservable() {
        return this.messagesSubject.asObservable();
    }

    sendMessage(message: string) {
        if (!message.trim()) return;
        this.socketService.emit(ChatSocketEvent.PostMessage, this.createMessage(message));
    }

    private setUpSocket() {
        this.socketService.on(ChatSocketEvent.GetMessage, this.addMessage.bind(this));
        this.socketService.on(ChatSocketEvent.UserLeft, this.onUserLeft.bind(this));
    }

    private onUserLeft(username: string) {
        const userLeftMessage = { user: 'Système', content: `${username} a quitté la partie`, time: new Date() };
        this.addMessage(userLeftMessage);
    }

    private addMessage(message: ChatMessage) {
        this.chatMessages.push(message);
        this.messagesSubject.next(this.chatMessages);
    }

    private createMessage(content: string): ChatMessage {
        return { user: this.username, content, time: new Date() };
    }

    private leaveChat() {
        this.chatMessages = [];
        this.messagesSubject.next([]);
    }
}
