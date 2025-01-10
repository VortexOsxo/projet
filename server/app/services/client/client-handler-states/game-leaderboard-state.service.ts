import { Service } from 'typedi';
import { GamePlayerSocketEvent } from '@common/enums/socket-event/game-player-socket-event';
import { GameBaseState } from './game-base-state.service';
import { KickedOutMessage } from '@app/enums/kicked-out-message';

@Service({ transient: true })
export class GameLeaderboardState extends GameBaseState {
    clearState(): void {
        this.client.removeEventListeners(GamePlayerSocketEvent.PlayerLeftGame);
        this.client.removeEventListeners(GamePlayerSocketEvent.Disconnect);
    }

    protected initializeState() {
        this.client.onUserEvent(GamePlayerSocketEvent.PlayerLeftGame, () => this.leaveGame());
        this.client.onUserEvent(GamePlayerSocketEvent.Disconnect, () => this.leaveGame());
    }

    private leaveGame() {
        this.emitClientKickedOut(KickedOutMessage.EmptyMessage);
        this.clientHandlerService.resetState();
    }
}
