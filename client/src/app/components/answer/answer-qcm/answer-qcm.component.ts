import { Component, HostListener, OnInit } from '@angular/core';
import { GameCorrectedAnswerService } from '@app/services/game-services/game-corrected-answer.service';
import { GameManagerService } from '@app/services/game-services/game-manager.service';
import { Question } from '@common/interfaces/question';

const INACTIVE_BUTTON = -1;

@Component({
    selector: 'app-answer-qcm',
    templateUrl: './answer-qcm.component.html',
    styleUrls: ['./answer-qcm.component.scss'],
})
export class AnswerQcmComponent implements OnInit {
    question: Question;

    private selectedAnswers: number[] = [];

    constructor(
        private gameManager: GameManagerService,
        private gameCorrectedAnswer: GameCorrectedAnswerService,
    ) {
        this.selectedAnswers = [];
    }

    get answerOptions(): string[] {
        return this.question.choices.map((choice) => choice.text);
    }

    @HostListener('window:keydown', ['$event'])
    buttonDetect(event: KeyboardEvent) {
        if (this.shouldIgnoreEvent(event)) return;
        const answerIndex = this.answerOptions.findIndex((option, i) => event.key === (i + 1).toString());
        if (answerIndex === INACTIVE_BUTTON) return;

        this.toggleButton(answerIndex);
    }

    ngOnInit() {
        this.question = this.gameManager.getCurrentQuestion();
    }

    isButtonActive(button: number): boolean {
        return this.selectedAnswers.includes(button) && !this.gameCorrectedAnswer.shouldShowCorrectedAnswer();
    }

    isButtonCorrected(buttonIndex: number): boolean {
        return this.gameCorrectedAnswer.isAnswerCorrected(buttonIndex);
    }

    canSubmitAnswer() {
        return this.gameManager.canSubmitAnswer();
    }

    toggleButton(buttonId: number): void {
        if (!this.canSubmitAnswer()) return;

        this.gameManager.toggleAnswerChoice(buttonId);
        const index = this.selectedAnswers.indexOf(buttonId);
        if (index === INACTIVE_BUTTON) {
            this.selectedAnswers.push(buttonId);
        } else {
            this.selectedAnswers.splice(index, 1);
        }
    }

    private shouldIgnoreEvent(event: KeyboardEvent): boolean {
        const target = event.target as HTMLElement;
        return target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';
    }
}
