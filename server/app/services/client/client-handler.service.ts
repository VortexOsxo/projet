import { Service } from 'typedi';
import { GameManagerService } from '@app/services/game/game-manager.service';
import { GameBase } from '@app/classes/game/game-base';
import { Client } from '@app/classes/client';
import { DefaultState } from '@app/services/client/client-handler-states/client-default-state.service';
import { ClientState } from '@app/enums/client-state';
import { BaseHandlerState } from '@app/services/client/client-handler-states/base-handler-state.service';
import { GameOrganizerState } from '@app/services/client/client-handler-states/game-organizer-state.service';
import { GamePlayerState } from '@app/services/client/client-handler-states/game-player-state.service';
import { GameLeaderboardState } from '@app/services/client/client-handler-states/game-leaderboard-state.service';
import { ORGANIZER_USERNAME } from '@common/config/game-config';

@Service({ transient: true })
export class ClientHandlerService {
    game: GameBase;
    private clientHandlerState: BaseHandlerState;

    constructor(
        public client: Client,
        private gameManagerService: GameManagerService,
    ) {
        this.updateState(ClientState.Default);
    }

    updateState(clientState: ClientState) {
        this.clientHandlerState?.clearState();

        switch (clientState) {
            case ClientState.Default:
                this.clientHandlerState = new DefaultState(this.gameManagerService, this);
                break;
            case ClientState.GameOrganizer:
                this.clientHandlerState = new GameOrganizerState(this.gameManagerService, this);
                this.client.resetState();
                break;
            case ClientState.GamePlayer:
                this.clientHandlerState = new GamePlayerState(this);
                this.client.resetState(ORGANIZER_USERNAME);
                break;
            case ClientState.GameLeaderboard:
                this.clientHandlerState = new GameLeaderboardState(this);
                break;
        }
    }

    resetState() {
        this.game = undefined;
        this.updateState(ClientState.Default);
    }
}
