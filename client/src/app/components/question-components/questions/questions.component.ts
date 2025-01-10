import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Question } from '@common/interfaces/question';
import { QuestionService } from '@app/services/question-services/question.service';
import { QuestionFormComponent } from '@app/components/question-components/question-form/question-form.component';
import { VOID_QCM_QUESTION, VOID_QRL_QUESTION } from '@app/consts/question.consts';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-questions',
    templateUrl: './questions.component.html',
    styleUrls: ['./questions.component.scss'],
})
export class QuestionsComponent implements OnInit, OnDestroy {
    questions: Question[] = [];
    private questionsSubscription: Subscription;

    constructor(
        private questionService: QuestionService,
        public dialog: MatDialog,
    ) {}

    ngOnInit(): void {
        this.questionsSubscription = this.questionService.questionsObservable.subscribe((questions) => {
            this.questions = questions;
        });
    }

    ngOnDestroy(): void {
        this.questionsSubscription?.unsubscribe();
    }

    getQuestions(): void {
        this.questions = this.questionService.getQuestions();
    }

    createQCMQuestion(question?: Question) {
        this.openEditDialog(question ?? VOID_QCM_QUESTION);
    }

    createQRLQuestion(question?: Question) {
        this.openEditDialog(question ?? VOID_QRL_QUESTION);
    }

    openEditDialog(question: Question) {
        const dialogRef = this.dialog.open(QuestionFormComponent, {
            width: '800px',
            maxHeight: '90vh',
            data: question,
        });

        dialogRef.afterClosed().subscribe((result: Question) => {
            if (result) this.questionService.updateQuestion(result);
        });
    }

    deleteQuestion(id: string): void {
        this.questionService.deleteQuestion(id);
    }
}
