import { Injectable } from '@angular/core';
import { SocketFactoryService } from '@app/services/socket-service/socket-factory.service';
import { MatDialog } from '@angular/material/dialog';
import { InformationModalComponent } from '@app/components/modal/information-modal/information-modal.component';
import { Router } from '@angular/router';
import { GameBaseService } from './base-classes/game-base.service';
import { ChatService } from '@app/services/chat-services/chat.service';
import { GamePlayerSocketEvent } from '@common/enums/socket-event/game-player-socket-event';
import { DialogModalService } from '@app/services/dialog-modal.service';

@Injectable({
    providedIn: 'root',
})
export class GameLeavingService extends GameBaseService {
    // This service needs all of these dependency, the router and the dialog
    // to reroute out of the game page when we leave the game and the modal to show the reason
    // plus we need to update the ChatService since it does not have acces to the game socket.
    // eslint-disable-next-line max-params
    constructor(
        socketFactory: SocketFactoryService,
        private dialog: MatDialog,
        private router: Router,
        private chatService: ChatService,
        private dialogModal: DialogModalService,
    ) {
        super(socketFactory);
        this.setUpSocket();
    }

    leaveGame() {
        this.socketService.emit(GamePlayerSocketEvent.PlayerLeftGame);
    }

    private setUpSocket() {
        this.socketService.on(GamePlayerSocketEvent.PlayerRemovedFromGame, this.playerRemoved.bind(this));
    }

    private playerRemoved(reason: string) {
        if (reason) this.dialog.open(InformationModalComponent, { data: reason });
        this.router.navigate(['/home']);
        this.updateService();
    }

    private updateService() {
        this.chatService.leaveChat();
        this.dialogModal.closeModals();
    }
}
