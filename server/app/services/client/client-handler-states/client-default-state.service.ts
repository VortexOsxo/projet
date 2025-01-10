import { Service } from 'typedi';
import { GameManagerService } from '@app/services/game/game-manager.service';
import { Response } from '@common/interfaces/response';
import { GameBase } from '@app/classes/game/game-base';
import { BaseHandlerState } from './base-handler-state.service';
import { ClientHandlerService } from '@app/services/client/client-handler.service';
import { ClientState } from '@app/enums/client-state';
import { createUnsuccessfulResponse } from '@app/utils/responses.utils';
import { GameLobby } from '@app/classes/game/game-lobby';
import { GameManagementSocketEvent } from '@common/enums/socket-event/game-management-socket-event';
import { GameResponse } from '@app/enums/game-response';

@Service({ transient: true })
export class DefaultState extends BaseHandlerState {
    constructor(
        private gameManagerService: GameManagerService,
        clientHandlerService: ClientHandlerService,
    ) {
        super(clientHandlerService);
    }

    clearState(): void {
        this.client.removeEventListeners(GameManagementSocketEvent.JoinGameLobby);
        this.client.removeEventListeners(GameManagementSocketEvent.CreateGameLobby);
        this.client.removeEventListeners(GameManagementSocketEvent.CreateGameTest);
    }

    protected initializeState() {
        this.client.onUserEvent(GameManagementSocketEvent.JoinGameLobby, (gameId: number, callback) => {
            callback(this.joinGame(gameId));
        });

        this.client.onUserEvent(GameManagementSocketEvent.CreateGameLobby, async (quizId: string, callback) => {
            callback(await this.createGameLobby(quizId));
        });

        this.client.onUserEvent(GameManagementSocketEvent.CreateGameTest, async (quizId: string, callback) => {
            callback(await this.createGameTest(quizId));
        });
    }

    private joinGame(gameId: number): Response {
        const game: GameLobby = this.gameManagerService.getGameById(gameId) as GameLobby;
        if (!(game instanceof GameLobby)) return createUnsuccessfulResponse(GameResponse.NoGameFound);

        const response = game.addPlayer(this.client);
        if (!response.success) return response;

        this.clientHandlerService.game = game;
        this.clientHandlerService.updateState(ClientState.GamePlayer);

        return response;
    }

    private async createGameLobby(quizId: string): Promise<boolean> {
        const createdGame: GameBase = await this.gameManagerService.createGameLobby(this.client, quizId);
        if (!createdGame) return false;

        this.clientHandlerService.game = createdGame;
        this.clientHandlerService.updateState(ClientState.GameOrganizer);
        return true;
    }

    private async createGameTest(quizId: string) {
        const createdGame: GameBase = await this.gameManagerService.createTestGame(this.client, quizId);
        if (!createdGame) return false;

        this.clientHandlerService.game = createdGame;
        this.clientHandlerService.updateState(ClientState.GamePlayer);
        return true;
    }
}
