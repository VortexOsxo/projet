import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { GamePlayersStatService } from '@app/services/game-services/game-players-stat.service';
import { Player } from '@common/interfaces/player';
import { Subscription } from 'rxjs';
import { PlayerSort } from '@app/enums/player-sort';

@Component({
    selector: 'app-player-list',
    templateUrl: './player-list.component.html',
    styleUrls: ['./player-list.component.scss'],
})
export class PlayerListComponent implements OnInit, OnDestroy {
    @Input() hasAllFunctionalities: boolean;
    players: Player[] = [];
    order: string[] = Object.values(PlayerSort);

    private playersSubscription: Subscription;

    constructor(private gamePlayersStat: GamePlayersStatService) {}

    get sortAlgorithmName() {
        return this.gamePlayersStat.sortAlgorithmName;
    }

    set sortAlgorithmName(sortAlgorithmName: string) {
        this.gamePlayersStat.sortAlgorithmName = sortAlgorithmName;
    }

    ngOnInit() {
        this.playersSubscription = this.gamePlayersStat.getPlayersObservable().subscribe((players) => (this.players = players));
        if (this.hasAllFunctionalities) return;
        this.initializePlayersByScore();
    }

    ngOnDestroy() {
        this.playersSubscription?.unsubscribe();
    }

    action(event: Event) {
        const target = event.target as HTMLSelectElement;
        const selectedValue = target.value;
        this.updateSort(selectedValue);
        this.players = this.gamePlayersStat.getPlayers();
    }

    private updateSort(sortMethod: string) {
        switch (sortMethod) {
            case PlayerSort.Alphabetical:
            case PlayerSort.ReverseAlphabetical:
                this.gamePlayersStat.setSortPlayersByName();
                break;
            case PlayerSort.Points:
            case PlayerSort.ReversePoints:
                this.gamePlayersStat.setSortPlayersByScore();
                break;
            case PlayerSort.Color:
            case PlayerSort.ReverseColor:
                this.gamePlayersStat.setSortPlayersByState();
        }

        this.setIsSortReversed(sortMethod);
    }

    private setIsSortReversed(sortMethod: string) {
        const isSortReversed =
            sortMethod === PlayerSort.ReverseAlphabetical || sortMethod === PlayerSort.ReverseColor || sortMethod === PlayerSort.ReversePoints;
        this.gamePlayersStat.setReversedState(isSortReversed);
    }

    private initializePlayersByScore() {
        this.gamePlayersStat.setSortPlayersByScore();
        this.gamePlayersStat.setReversedState(false);
        this.players = this.gamePlayersStat.getPlayers();
    }
}
