import { Component } from '@angular/core';
import { GameAnswerCorrectionService } from '@app/services/game-services/game-answer-correction.service';
import { AnswerToCorrect } from '@common/interfaces/answers/answer-to-correct';

@Component({
    selector: 'app-organizer-correction',
    templateUrl: './organizer-correction.component.html',
    styleUrls: ['./organizer-correction.component.scss'],
})
export class OrganizerCorrectionComponent {
    answer: AnswerToCorrect;

    constructor(private gameAnswerCorrection: GameAnswerCorrectionService) {
        this.answer = this.gameAnswerCorrection.getAnswer();
        this.gameAnswerCorrection.answerToCorrectUpdated.subscribe(() => (this.answer = this.gameAnswerCorrection.getAnswer()));
    }

    scoreAnswer(score: number) {
        this.gameAnswerCorrection.scoreAnswer(score);
    }
}
