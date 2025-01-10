import { Injectable } from '@angular/core';
import { GamePlayerSocketEvent } from '@common/enums/socket-event/game-player-socket-event';
import { GameManagementSocketEvent } from '@common/enums/socket-event/game-management-socket-event';
import { PlayerState } from '@common/enums/user-answer-state';
import { Player } from '@common/interfaces/player';
import { BehaviorSubject } from 'rxjs';
import { GameListenerService } from './base-classes/game-listener.service';
import { PlayerSort } from '@app/enums/player-sort';

const EMPTY_SORT_PLAYERS_FUNCTION = (players: Player[]) => players;

@Injectable({
    providedIn: 'root',
})
export class GamePlayersStatService extends GameListenerService {
    sortAlgorithmName: string;
    private playersBehaviorSubject: BehaviorSubject<Player[]>;

    private sortFunction: (players: Player[]) => Player[];
    private isSortReversed: boolean;

    getPlayersObservable() {
        return this.playersBehaviorSubject.asObservable();
    }

    getPlayers() {
        const players = this.sortFunction(this.playersBehaviorSubject.value);
        return this.isSortReversed ? players.reverse() : players;
    }

    setSortPlayersByScore(): void {
        this.sortFunction = (players: Player[]) => players.sort((a, b) => (b.score !== a.score ? b.score - a.score : a.name.localeCompare(b.name)));
    }

    setSortPlayersByState(): void {
        this.sortFunction = (players: Player[]) => players.sort((a, b) => b.answerState - a.answerState);
    }

    setSortPlayersByName(): void {
        this.sortFunction = (players: Player[]) => players.sort((a, b) => a.name.localeCompare(b.name));
    }

    setReversedState(isSortReversed: boolean) {
        this.isSortReversed = isSortReversed;
    }

    resetSortPlayers() {
        this.sortAlgorithmName = PlayerSort.None;
        this.sortFunction = EMPTY_SORT_PLAYERS_FUNCTION;
        this.isSortReversed = false;
    }

    filterByPlayerInGame(players: Player[]) {
        return players.filter((player) => player.answerState !== PlayerState.LEFT_GAME);
    }

    protected setUpSocket() {
        this.socketService.on(GamePlayerSocketEvent.SendPlayerJoined, (player: Player) => this.addPlayer(player));
        this.socketService.on(GamePlayerSocketEvent.SendPlayerLeft, (player: Player) => this.removePlayer(player));

        this.socketService.on(GamePlayerSocketEvent.SendPlayerStats, (players: Player[]) => this.updatePlayersAll(players));
        this.socketService.on(GameManagementSocketEvent.OnGameStarted, () => this.resetPlayerLeft());
    }

    protected initializeState() {
        this.resetSortPlayers();
        this.playersBehaviorSubject ??= new BehaviorSubject<Player[]>([]);
        this.playersBehaviorSubject.next([]);
    }

    private addPlayer(newPlayer: Player) {
        const currentPlayers = this.playersBehaviorSubject.getValue();
        const updatedPlayers = [...currentPlayers, newPlayer];
        this.updatePlayersBehaviorSubject(updatedPlayers);
    }

    private removePlayer(playerLeaving: Player) {
        const currentPlayers = this.playersBehaviorSubject.getValue();

        currentPlayers.forEach((player) => {
            if (player.name === playerLeaving.name) player.answerState = PlayerState.LEFT_GAME;
        });

        this.updatePlayersBehaviorSubject(currentPlayers);
    }

    private updatePlayersAll(players: Player[]) {
        const newPlayers: Player[] = [];

        players.forEach((player) => newPlayers.push(player));
        this.getPlayerWhoLeft().forEach((player) => newPlayers.push(player));
        this.updatePlayersBehaviorSubject(newPlayers);
    }

    private resetPlayerLeft() {
        const currentPlayers = this.playersBehaviorSubject.getValue();
        const updatedPlayers = currentPlayers.filter((player) => player.answerState !== PlayerState.LEFT_GAME);
        this.updatePlayersBehaviorSubject(updatedPlayers);
    }

    private updatePlayersBehaviorSubject(updatedPlayers: Player[]) {
        const sortedPlayers = this.sortFunction(updatedPlayers);
        this.playersBehaviorSubject.next(this.isSortReversed ? sortedPlayers.reverse() : sortedPlayers);
    }

    private getPlayerWhoLeft() {
        return this.playersBehaviorSubject.value.filter((player) => player.answerState === PlayerState.LEFT_GAME);
    }
}
