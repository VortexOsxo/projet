import { Injectable } from '@angular/core';
import { GameBaseService } from './base-classes/game-base.service';
import { GameManagementSocketEvent } from '@common/enums/socket-event/game-management-socket-event';
import { SocketFactoryService } from '@app/services/socket-service/socket-factory.service';
import { GameInfoService } from './game-info.service';
import { Player } from '@common/interfaces/player';
import { GamePlayersStatService } from './game-players-stat.service';
import { GameType } from '@common/enums/game-type';

@Injectable({
    providedIn: 'root',
})
export class GameLobbyService extends GameBaseService {
    players: Player[] = [];
    isLobbyLocked: boolean = false;

    constructor(
        socketFactoryService: SocketFactoryService,
        private gameInfoService: GameInfoService,
        private gamePlayersStatService: GamePlayersStatService,
    ) {
        super(socketFactoryService);
        this.gamePlayersStatService.getPlayersObservable().subscribe((players) => {
            this.players = this.gamePlayersStatService.filterByPlayerInGame(players);
        });
    }

    get gameId() {
        return this.gameInfoService.getGameId();
    }

    toggleLobbyLock(): void {
        this.socketService.emit(GameManagementSocketEvent.ToggleLock, undefined, (isLocked: boolean) => (this.isLobbyLocked = isLocked));
    }

    startGame() {
        this.socketService.emit(GameManagementSocketEvent.StartGame);
    }

    canStartGame(): boolean {
        return this.isLobbyLocked && this.hasEnoughPlayers();
    }

    banPlayer(playerName: string) {
        this.socketService.emit(GameManagementSocketEvent.BanPlayer, playerName);
    }

    resetState() {
        this.isLobbyLocked = false;
        this.players = this.gamePlayersStatService.getPlayers();
    }

    private hasEnoughPlayers() {
        const playerNbRequired = this.gameInfoService.getGameType() === GameType.RandomGame ? 0 : 1;
        return this.players.length >= playerNbRequired;
    }
}
