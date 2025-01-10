import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Quiz } from '@common/interfaces/quiz';
import { QuizService } from '@app/services/quiz-services/quiz.service';
import { ImportGameModalComponent } from '@app/components/modal/import-game-modal/import-game-modal.component';
import { QuizValidationService } from '@app/services/quiz-services/quiz-validation.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-admin-view',
    templateUrl: './admin-view.component.html',
    styleUrls: ['./admin-view.component.scss'],
})
export class AdminViewComponent implements OnInit {
    quizzes: Quiz[];
    readonly quizSubscription: Subscription = new Subscription();

    constructor(
        private quizService: QuizService,
        private dialog: MatDialog,
        private quizValidationService: QuizValidationService,
    ) {
        this.quizzes = this.quizService.getAllQuiz();
        this.quizSubscription = this.quizService.getQuizModificationObservable().subscribe(() => {
            this.quizzes = this.quizService.getAllQuiz();
        });
    }

    ngOnInit(): void {
        this.updateQuizzes();
    }

    updateQuizzes(): void {
        this.quizzes = this.quizService.getAllQuiz();
    }

    deleteQuiz(quiz: Quiz): void {
        this.quizService.removeQuiz(quiz.id);
    }

    toggleVisibility(quiz: Quiz): void {
        this.quizService.toggleVisibility(quiz.id);
    }

    visibility(quiz: Quiz): string {
        return quiz.isVisible ? 'visibility' : 'visibility_off';
    }

    modifyQuiz(quiz: Quiz): void {
        this.quizValidationService.setQuizToModify(quiz);
    }

    download(content: string, fileName: string): void {
        const aElement = document.createElement('a');
        const file = new Blob([content], { type: 'application/json' });
        aElement.href = URL.createObjectURL(file);
        aElement.download = fileName;
        aElement.click();
    }

    exportQuiz(quiz: Quiz): void {
        const replacer = (key: string, value: unknown): unknown => (key === 'isVisible' ? undefined : value);

        const jsonString: string = JSON.stringify(quiz, replacer, 2);

        const fileName: string = quiz.title + '.json';

        this.download(jsonString, fileName);
    }

    openImportModal(): void {
        const dialogRef = this.dialog.open(ImportGameModalComponent, {});

        dialogRef.afterClosed().subscribe(() => {
            this.quizzes = this.quizService.getAllQuiz();
        });
    }
}
