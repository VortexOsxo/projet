import { Injectable } from '@angular/core';
import { SocketFactoryService } from '@app/services/socket-service/socket-factory.service';
import { SocketService } from '@app/services/socket-service/socket.service';
import { CHAT_SOCKET_NAME } from '@common/config/socket-config';
import { ChatSocketEvent } from '@common/enums/socket-event/chat-socket-event';
import { BehaviorSubject } from 'rxjs';
import { ChatService } from './chat.service';
import { DialogModalService } from '@app/services/dialog-modal.service';

@Injectable({
    providedIn: 'root',
})
export class ChatBannedStateService {
    private isUserBanned: BehaviorSubject<boolean>;
    private socketService: SocketService;

    constructor(
        socketFactory: SocketFactoryService,
        private chatService: ChatService,
        private modalService: DialogModalService,
    ) {
        this.socketService = socketFactory.getSocket(CHAT_SOCKET_NAME);
        this.setUpSocket();

        this.chatService.leftChatEvent.subscribe(() => this.resetState());
        this.isUserBanned = new BehaviorSubject(false);
    }

    getIsUserBannedObservable() {
        return this.isUserBanned.asObservable();
    }

    private resetState() {
        this.isUserBanned.next(false);
    }

    private setUpSocket() {
        this.socketService.on(ChatSocketEvent.OnUserBanned, (isUserBanned: boolean) => {
            this.sendBannedStateMessage(isUserBanned);
            this.isUserBanned.next(isUserBanned);
        });
    }

    private sendBannedStateMessage(isUserBanned: boolean) {
        this.modalService.openSnackBar(`L'organisateur a ${isUserBanned ? 'retiré' : 'alloué'} votre droit d'utiliser le chat.`);
    }
}
