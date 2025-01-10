import { Component, HostListener, OnInit } from '@angular/core';
import { Question } from '@common/interfaces/question';
import { GameManagerService } from '@app/services/game-services/game-manager.service';
import { Observable } from 'rxjs';
import { QuestionType } from '@common/enums/question-type';
import { DialogModalService } from '@app/services/dialog-modal.service';

@Component({
    selector: 'app-player-game-view',
    templateUrl: './player-game-view.component.html',
    styleUrls: ['./player-game-view.component.scss'],
})
export class PlayerGameViewComponent implements OnInit {
    question: Question;
    currentScoreObserver: Observable<number>;

    constructor(
        private gameManager: GameManagerService,
        private modalService: DialogModalService,
    ) {}

    @HostListener('window:keydown', ['$event'])
    buttonDetect(event: KeyboardEvent) {
        if (this.shouldIgnoreEvent(event)) return;

        if (!this.isQuestionAQcm()) return;

        event.preventDefault();
        this.submitButtonHandler();
    }

    isQuestionAQcm(): boolean {
        return this.question.type === QuestionType.QCM;
    }

    ngOnInit() {
        this.currentScoreObserver = this.gameManager.getCurrentScoreObservable();
        this.question = this.gameManager.getCurrentQuestion();
    }

    submitButtonHandler() {
        this.openSubmitConfirmationSnackBar();
        this.submitAnswer();
    }

    canSubmitAnswer() {
        return this.gameManager.canSubmitAnswer();
    }

    private submitAnswer() {
        this.gameManager.submitAnswers();
    }

    private openSubmitConfirmationSnackBar() {
        if (!this.canSubmitAnswer()) return;
        this.modalService.openSnackBar('Réponses envoyées');
    }

    private shouldIgnoreEvent(event: KeyboardEvent): boolean {
        const target = event.target as HTMLElement;
        if (event.key !== 'Enter') return true;
        return target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';
    }
}
