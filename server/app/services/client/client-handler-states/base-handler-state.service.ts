import { GameSessionBase } from '@app/classes/game/game-session-base';
import { ClientHandlerService } from '@app/services/client/client-handler.service';
import { GameLobby } from '@app/classes/game/game-lobby';

export abstract class BaseHandlerState {
    constructor(protected clientHandlerService: ClientHandlerService) {
        this.initializeState();
    }

    protected get game() {
        return this.clientHandlerService.game;
    }

    protected get gameSession(): GameSessionBase | undefined {
        return this.game instanceof GameSessionBase ? this.game : undefined;
    }

    protected get gameLobby(): GameLobby | undefined {
        return this.game instanceof GameLobby ? this.game : undefined;
    }

    protected get client() {
        return this.clientHandlerService.client;
    }

    protected emitToClient<ValuType>(eventName: string, eventValue?: ValuType) {
        this.client.emitToUser(eventName, eventValue);
    }

    abstract clearState(): void;

    protected abstract initializeState(): void;
}
