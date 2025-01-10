import { Component } from '@angular/core';
import { GameInfoService } from '@app/services/game-services/game-info.service';
@Component({
    selector: 'app-results-view',
    templateUrl: './results-view.component.html',
    styleUrls: ['./results-view.component.scss'],
})
export class ResultsViewComponent {
    questionGraphIndex: number = 0;

    constructor(private gameInformation: GameInfoService) {
        this.questionGraphIndex = 0;
    }

    get question() {
        return this.questions[this.questionGraphIndex];
    }

    private get questions() {
        return this.gameInformation.getQuiz().questions;
    }

    goToPreviousGraph(): void {
        if (!this.canGoToPreviousGraph()) return;
        this.questionGraphIndex--;
    }

    canGoToPreviousGraph(): boolean {
        return this.questionGraphIndex > 0;
    }

    goToNextGraph(): void {
        if (!this.canGoToNextGraph()) return;
        this.questionGraphIndex++;
    }

    canGoToNextGraph(): boolean {
        return this.questionGraphIndex + 1 < this.questions.length;
    }
}
