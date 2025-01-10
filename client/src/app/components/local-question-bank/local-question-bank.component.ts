import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Question } from '@common/interfaces/question';
import { QuestionService } from '@app/services/question-services/question.service';

@Component({
    selector: 'app-local-question-bank',
    templateUrl: './local-question-bank.component.html',
    styleUrls: ['./local-question-bank.component.scss'],
})
export class LocalQuestionBankComponent implements OnInit {
    @Output() newItemEvent = new EventEmitter<Question[]>();

    questions: Question[] = [];
    selectedQuestions: Question[] = [];

    constructor(private questionService: QuestionService) {}

    ngOnInit(): void {
        this.questionService.questionsObservable.subscribe((questions) => {
            this.questions = questions;
        });
    }

    addQuestionsToQuiz(): void {
        this.selectedQuestions = this.selectedQuestions.map((question) => ({
            ...question,
            alreadyInBank: this.questions.includes(question),
        }));
        this.newItemEvent.emit(this.selectedQuestions);
    }
}
