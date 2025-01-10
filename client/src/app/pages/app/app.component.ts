import { Component } from '@angular/core';
import { GameCountdownService } from '@app/services/game-services/game-countdown.service';
import { GameAnswerCorrectionService } from '@app/services/game-services/game-answer-correction.service';
import { GameManagerService } from '@app/services/game-services/game-manager.service';
import { GamePlayersStatService } from '@app/services/game-services/game-players-stat.service';
import { GameStateService } from '@app/services/game-services/game-state.service';
import { HistogramDataService } from '@app/services/histogram-services/histogram-data.service';
import { GameTimerControllerService } from '@app/services/game-services/game-timer-controller.service';
import { GameCorrectionMessageService } from '@app/services/game-services/game-correction-message.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    // All the parameter of this constructor are service that we want to instanciate at the start of the apps
    // The reason is that they listen for socket event, and if we wait for them to be instanciated, when they are needed,
    // we may miss some of these events.
    // eslint-disable-next-line max-params
    constructor(
        readonly gameIntermissionService: GameCountdownService,
        readonly gameManagerService: GameManagerService,
        readonly gameStateService: GameStateService,
        readonly gamePlayersStatService: GamePlayersStatService,
        readonly histogramDataService: HistogramDataService,
        readonly gameAnswerCorrectionservice: GameAnswerCorrectionService,
        readonly timerControllerService: GameTimerControllerService,
        readonly gameCorrectionMessageService: GameCorrectionMessageService,
    ) {}
}
