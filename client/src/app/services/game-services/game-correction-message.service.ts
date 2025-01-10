import { Injectable } from '@angular/core';
import { GameBaseService } from './base-classes/game-base.service';
import { SocketFactoryService } from '@app/services/socket-service/socket-factory.service';
import { DialogModalService } from '@app/services/dialog-modal.service';
import { GameAnswerSocketEvent } from '@common/enums/socket-event/game-answer-socket-event';

@Injectable({
    providedIn: 'root',
})
export class GameCorrectionMessageService extends GameBaseService {
    constructor(
        socketFactory: SocketFactoryService,
        private dialogModalService: DialogModalService,
    ) {
        super(socketFactory);
        this.setUpSocket();
    }

    private setUpSocket() {
        this.socketService.on(GameAnswerSocketEvent.SendCorrectionMessage, this.receiveCorrectionMessage.bind(this));
    }

    private receiveCorrectionMessage(correctionMessage: string) {
        this.dialogModalService.openSnackBar(correctionMessage);
    }
}
