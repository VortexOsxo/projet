import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { GameListenerService } from './base-classes/game-listener.service';
import { GamePlaySocketEvent } from '@common/enums/socket-event/game-play-socket-event';

@Injectable({
    providedIn: 'root',
})
export class GameCountdownService extends GameListenerService {
    private timerValueSubject: BehaviorSubject<number>;

    getTimerObservable() {
        return this.timerValueSubject.asObservable();
    }

    protected initializeState(): void {
        this.timerValueSubject = new BehaviorSubject<number>(0);
    }

    protected setUpSocket() {
        this.socketService.on(GamePlaySocketEvent.TimerTicked, (tickValue: number) => {
            this.timerValueSubject.next(tickValue);
        });
    }
}
