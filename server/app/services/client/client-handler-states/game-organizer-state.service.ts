import { Service } from 'typedi';
import { GameManagerService } from '@app/services/game/game-manager.service';
import { ClientHandlerService } from '@app/services/client/client-handler.service';
import { GameSessionBase } from '@app/classes/game/game-session-base';
import { GameLobby } from '@app/classes/game/game-lobby';
import { GamePlaySocketEvent } from '@common/enums/socket-event/game-play-socket-event';
import { GameManagementSocketEvent } from '@common/enums/socket-event/game-management-socket-event';
import { GamePlayerSocketEvent } from '@common/enums/socket-event/game-player-socket-event';
import { GameBaseState } from './game-base-state.service';
import { GameType } from '@common/enums/game-type';
import { ClientState } from '@app/enums/client-state';

@Service({ transient: true })
export class GameOrganizerState extends GameBaseState {
    constructor(
        private gameManagerService: GameManagerService,
        clientHandlerService: ClientHandlerService,
    ) {
        super(clientHandlerService);
    }

    clearState(): void {
        this.setAsPlayer();

        this.clearGameBaseState();

        this.client.removeEventListeners(GameManagementSocketEvent.StartGame);
        this.client.removeEventListeners(GameManagementSocketEvent.NextQuestion);
        this.client.removeEventListeners(GameManagementSocketEvent.ToggleLock);
        this.client.removeEventListeners(GameManagementSocketEvent.BanPlayer);
        this.client.removeEventListeners(GamePlayerSocketEvent.PlayerLeftGame);
        this.client.removeEventListeners(GamePlayerSocketEvent.Disconnect);
    }

    protected initializeState() {
        this.setAsOrganizer();

        this.initializeGameBaseState();

        this.client.onUserEvent(GameManagementSocketEvent.StartGame, async () => this.startGame());
        this.client.onUserEvent(GameManagementSocketEvent.NextQuestion, () => this.goToNextQuestion());

        this.client.onUserEvent(GameManagementSocketEvent.ToggleLock, (callback: (success: boolean) => void) => callback(this.toggleLock()));
        this.client.onUserEvent(GameManagementSocketEvent.BanPlayer, (playerUsername: string) => this.banPlayer(playerUsername));

        this.client.onUserEvent(GamePlayerSocketEvent.PlayerLeftGame, () => this.leaveGame());
        this.client.onUserEvent(GamePlayerSocketEvent.Disconnect, () => this.leaveGame());
    }

    private banPlayer(playerUsername: string) {
        this.gameLobby?.banPlayer(playerUsername);
    }

    private async startGame() {
        if (!this.gameLobby || !this.gameLobby.canStartGame()) return;

        const startedGame = await this.gameManagerService.createNormalGame(this.gameLobby);
        this.handleGameStartedObserver(this.gameLobby, startedGame as GameSessionBase);
    }

    private toggleLock(): boolean {
        return this.gameLobby?.toggleLock();
    }

    private goToNextQuestion() {
        this.gameSession?.continueQuiz();
    }

    private leaveGame() {
        this.game?.removeOrganizer();
        this.clientHandlerService.resetState();
    }

    private handleGameStartedObserver(gameLobby: GameLobby, gameSession: GameSessionBase) {
        if (gameLobby.futureGameType === GameType.RandomGame) this.clientHandlerService.updateState(ClientState.GamePlayer);
        gameLobby.gameStarted(gameSession as GameSessionBase);
    }

    private setAsOrganizer() {
        this.client.emitToUser(GamePlaySocketEvent.SetAsOrganizer);
    }

    private setAsPlayer() {
        this.client.emitToUser(GamePlaySocketEvent.SetAsPlayer);
    }
}
