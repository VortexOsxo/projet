import { Component, Input } from '@angular/core';
import { GameCountdownService } from '@app/services/game-services/game-countdown.service';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-game-countdown',
    templateUrl: './game-countdown.component.html',
    styleUrls: ['./game-countdown.component.scss'],
})
export class GameCountdownComponent {
    @Input() radius: number;

    countdownValueObserver: Observable<number>;

    constructor(gameIntermissionService: GameCountdownService) {
        this.countdownValueObserver = gameIntermissionService.getTimerObservable();
    }
}
