import { Service } from 'typedi';
import { createUnsuccessfulResponse } from '@app/utils/responses.utils';
import { Response } from '@common/interfaces/response';
import { GameBaseState } from './game-base-state.service';
import { GameResponse } from '@app/enums/game-response';
import { GameManagementSocketEvent } from '@common/enums/socket-event/game-management-socket-event';
import { GamePlayerSocketEvent } from '@common/enums/socket-event/game-player-socket-event';

@Service({ transient: true })
export class GamePlayerState extends GameBaseState {
    clearState(): void {
        this.clearGameBaseState();

        this.client.removeEventListeners(GameManagementSocketEvent.SetUsername);
        this.client.removeEventListeners(GamePlayerSocketEvent.PlayerLeftGame);
        this.client.removeEventListeners(GamePlayerSocketEvent.Disconnect);
    }

    protected initializeState() {
        this.initializeGameBaseState();

        this.client.onUserEvent(GameManagementSocketEvent.SetUsername, (username: string, callback: (response: Response) => void) =>
            callback(this.setUsername(username)),
        );
        this.client.onUserEvent(GamePlayerSocketEvent.PlayerLeftGame, () => this.leaveGame());
        this.client.onUserEvent(GamePlayerSocketEvent.Disconnect, () => this.leaveGame());
    }

    private setUsername(username: string) {
        if (!this.gameLobby) return createUnsuccessfulResponse(GameResponse.NotInGame);
        return this.gameLobby.setUsername(this.client, username);
    }

    private leaveGame() {
        this.game?.removePlayer(this.client);
        this.clientHandlerService.resetState();
    }
}
