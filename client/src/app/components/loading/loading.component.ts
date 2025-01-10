import { Component } from '@angular/core';
import { GameInfoService } from '@app/services/game-services/game-info.service';

@Component({
    selector: 'app-loading',
    templateUrl: './loading.component.html',
    styleUrls: ['./loading.component.scss'],
})
export class LoadingComponent {
    constructor(private gameInfoService: GameInfoService) {}

    get quizTitle(): string {
        const playedQuiz = this.gameInfoService.getQuiz();
        return playedQuiz.title;
    }
}
