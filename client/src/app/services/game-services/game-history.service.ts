import { Injectable, OnDestroy } from '@angular/core';
import { GameHistory } from '@common/interfaces/game-history';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { GameCommunicationService } from './game-communication.service';

@Injectable({
    providedIn: 'root',
})
export class GameHistoryService implements OnDestroy {
    private gameHistoriesSubject = new BehaviorSubject<GameHistory[]>([]);
    private gameHistorySubscription: Subscription;

    constructor(private readonly gameCommunicationService: GameCommunicationService) {
        this.loadGames();
        this.gameHistorySubscription = this.gameCommunicationService.gameHistoryModified.subscribe(() => {
            this.loadGames();
        });
    }

    deleteGames(): void {
        this.gameCommunicationService.deleteGames().subscribe();
    }

    getGameObservable(): Observable<GameHistory[]> {
        return this.gameHistoriesSubject.asObservable();
    }

    ngOnDestroy(): void {
        this.gameHistorySubscription.unsubscribe();
    }

    private loadGames(): void {
        this.gameCommunicationService.getGames().subscribe((games) => this.gameHistoriesSubject.next(games));
    }
}
