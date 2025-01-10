import { Injectable } from '@angular/core';
import { GameBaseService } from './base-classes/game-base.service';
import { SocketFactoryService } from '@app/services/socket-service/socket-factory.service';
import { GameInfoService } from './game-info.service';
import { GameType } from '@common/enums/game-type';
import { GameManagementSocketEvent } from '@common/enums/socket-event/game-management-socket-event';
import { GameStateService } from './game-state.service';
import { UserGameState } from '@common/enums/user-game-state';
import { ORGANIZER_USERNAME } from '@common/config/game-config';

@Injectable({
    providedIn: 'root',
})
export class GameCreationService extends GameBaseService {
    constructor(
        socketFactory: SocketFactoryService,
        private gameInfoService: GameInfoService,
        private gameStateService: GameStateService,
    ) {
        super(socketFactory);
    }

    createGame(quizId: string, gameType: GameType): void {
        this.gameStateService.setState(UserGameState.AttemptingToJoin);
        const socketEventName = gameType === GameType.TestGame ? GameManagementSocketEvent.CreateGameTest : GameManagementSocketEvent.CreateGameLobby;
        this.createGameIntern(quizId, socketEventName);
    }

    private createGameIntern(quizId: string, socketEvent: string) {
        this.socketService.emit(socketEvent, quizId, (success: boolean) => {
            if (!success) return;
            this.gameInfoService.setUsername(ORGANIZER_USERNAME);
        });
    }
}
