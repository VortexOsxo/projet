import { Component } from '@angular/core';
import { MAXIMUM_CHARACTER_LONG_ANSWER } from '@app/consts/question.consts';
import { GameManagerService } from '@app/services/game-services/game-manager.service';

@Component({
    selector: 'app-answer-qrl',
    templateUrl: './answer-qrl.component.html',
    styleUrls: ['./answer-qrl.component.scss'],
})
export class AnswerQrlComponent {
    longAnswer: string;
    maxCharacters: number;

    constructor(private gameManager: GameManagerService) {
        this.longAnswer = '';
        this.maxCharacters = MAXIMUM_CHARACTER_LONG_ANSWER;
    }

    canSubmitAnswer() {
        return this.gameManager.canSubmitAnswer();
    }

    onTextModified() {
        this.gameManager.updateAnswerResponse(this.longAnswer);
    }
}
