import { Component } from '@angular/core';
import { PANIC_ICON, PAUSE_ICON, RESUME_ICON } from '@app/consts/file-consts';
import { GameTimerControllerService } from '@app/services/game-services/game-timer-controller.service';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-interactive-timer',
    templateUrl: './interactive-timer.component.html',
    styleUrls: ['./interactive-timer.component.scss'],
})
export class InteractiveTimerComponent {
    iconPanicPath: string;
    iconPausePath: string;
    canToggleStopObservable: Observable<boolean>;
    canStartPanicObservable: Observable<boolean>;

    constructor(private timerController: GameTimerControllerService) {
        this.canStartPanicObservable = this.timerController.getCanStartPanicObserver();
        this.canToggleStopObservable = this.timerController.getCanToggleStopObserver();
        this.iconPanicPath = PANIC_ICON;
        this.iconPausePath = PAUSE_ICON;
    }

    toggleStop() {
        this.timerController.toggleStop();
        this.iconPausePath = this.iconPausePath === PAUSE_ICON ? RESUME_ICON : PAUSE_ICON;
    }

    startPanic() {
        this.timerController.togglePanic();
        this.iconPausePath = PAUSE_ICON;
    }
}
