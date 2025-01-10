import { Injectable } from '@angular/core';
import { GameBaseService } from './game-base.service';
import { SocketFactoryService } from '@app/services/socket-service/socket-factory.service';

@Injectable()
export abstract class GameListenerService extends GameBaseService {
    constructor(socketFactory: SocketFactoryService) {
        super(socketFactory);
        this.initializeState();
        this.setUpSocketIntern();
    }

    protected setUpSocket() {
        // Function that derived class can override if they need to have socket event handlers
    }

    private setUpSocketIntern() {
        this.setUpSocket();

        this.socketService.on('kickedOutFromGame', () => {
            this.initializeState();
        });
    }

    // Function to initialize game state at the begining of a game
    protected abstract initializeState(): void;
}
