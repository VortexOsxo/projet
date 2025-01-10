import { Injectable } from '@angular/core';
import { SocketFactoryService } from '@app/services/socket-service/socket-factory.service';
import { GameInfoService } from './game-info.service';
import { GameBaseService } from './base-classes/game-base.service';
import { Response } from '@common/interfaces/response';
import { GameManagementSocketEvent } from '@common/enums/socket-event/game-management-socket-event';
import { GameStateService } from './game-state.service';
import { UserGameState } from '@common/enums/user-game-state';

@Injectable({
    providedIn: 'root',
})
export class GameJoiningService extends GameBaseService {
    constructor(
        socketFactory: SocketFactoryService,
        private gameInfoService: GameInfoService,
        private gameStateService: GameStateService,
    ) {
        super(socketFactory);
    }

    async joinGame(gameId: number): Promise<Response> {
        this.gameStateService.setState(UserGameState.AttemptingToJoin);
        return this.emitToSocketAsPromise(GameManagementSocketEvent.JoinGameLobby, gameId);
    }

    async setUsername(username: string): Promise<Response> {
        const success: Response = await this.emitToSocketAsPromise(GameManagementSocketEvent.SetUsername, username);
        if (success) this.gameInfoService.setUsername(username);
        return success;
    }

    private async emitToSocketAsPromise<AckReturnType>(event: string, data: unknown): Promise<AckReturnType> {
        return new Promise<AckReturnType>((resolve) => {
            this.socketService.emit(event, data, (success: AckReturnType) => resolve(success));
        });
    }
}
