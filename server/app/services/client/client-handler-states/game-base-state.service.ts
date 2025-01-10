import { GameSessionBase } from '@app/classes/game/game-session-base';
import { ClientState } from '@app/enums/client-state';
import { Player } from '@app/interfaces/users/player';
import { UserRemoved } from '@app/interfaces/users/user-removed';
import { translatePlayer } from '@app/utils/translate.utils';
import { GamePlayerSocketEvent } from '@common/enums/socket-event/game-player-socket-event';
import { GameManagementSocketEvent } from '@common/enums/socket-event/game-management-socket-event';

import { Subscription } from 'rxjs';
import { BaseHandlerState } from './base-handler-state.service';

export abstract class GameBaseState extends BaseHandlerState {
    private userRemovedSubscription: Subscription;
    private userAddedSubscription: Subscription;
    private gameStartedSubscription: Subscription;
    private gameEndedSubscription: Subscription;

    protected clearGameBaseState(): void {
        this.userRemovedSubscription?.unsubscribe();
        this.userAddedSubscription?.unsubscribe();
        this.gameStartedSubscription?.unsubscribe();
        this.gameEndedSubscription?.unsubscribe();
    }

    protected initializeGameBaseState() {
        this.userRemovedSubscription = this.game.removedUserSubject.subscribe((userRemoved: UserRemoved) => this.onPlayerRemoved(userRemoved));
        this.userAddedSubscription = this.gameLobby?.addedPlayerSubject.subscribe((userAdded: Player) => this.onPlayerAdded(userAdded));
        this.gameStartedSubscription = this.gameLobby?.gameStartedSubject.subscribe((game: GameSessionBase) => this.onGameStarted(game));
    }

    protected emitClientKickedOut(reason: string) {
        this.emitToClient(GamePlayerSocketEvent.PlayerRemovedFromGame, reason);
    }

    private onPlayerAdded(player: Player) {
        if (player === this.client) return;
        this.emitPlayerJoined(player);
    }

    private onPlayerRemoved(userRemoved: UserRemoved) {
        const playerRemoved = userRemoved.user as Player;
        if (!playerRemoved) return;

        this.emitPlayerLeft(playerRemoved);
        if (userRemoved.user !== this.client) return;

        this.onClientRemoved(userRemoved);
    }

    private onClientRemoved(userRemoved: UserRemoved) {
        this.emitClientKickedOut(userRemoved.reason);
        this.clientHandlerService.resetState();
    }

    private onGameStarted(game: GameSessionBase) {
        this.clientHandlerService.game = game;
        this.gameStartedSubscription?.unsubscribe();

        this.resetUserEventSubscription();
        this.setQuizEndedCallback();

        this.emitToClient(GameManagementSocketEvent.OnGameStarted);
    }

    private emitPlayerLeft(player: Player) {
        this.emitToClient(GamePlayerSocketEvent.SendPlayerLeft, translatePlayer(player));
    }

    private emitPlayerJoined(player: Player) {
        this.emitToClient(GamePlayerSocketEvent.SendPlayerJoined, translatePlayer(player));
    }

    private resetUserEventSubscription() {
        this.userRemovedSubscription?.unsubscribe();
        this.userAddedSubscription?.unsubscribe();

        this.userRemovedSubscription = this.game?.removedUserSubject.subscribe((userRemoved: UserRemoved) => this.onPlayerRemoved(userRemoved));
        this.userAddedSubscription = this.gameLobby?.addedPlayerSubject.subscribe((userAdded: Player) => this.onPlayerAdded(userAdded));
    }

    private setQuizEndedCallback() {
        this.gameEndedSubscription = this.gameSession?.quizEndedSubject.subscribe(() =>
            this.clientHandlerService.updateState(ClientState.GameLeaderboard),
        );
    }
}
