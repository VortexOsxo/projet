import { Injectable, OnDestroy } from '@angular/core';
import { NO_QUESTION_FILTER, VOID_QRL_QUESTION, VOID_QCM_QUESTION } from '@app/consts/question.consts';
import { Question } from '@common/interfaces/question';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { QuestionCommunicationService } from './question-communication.service';
import { QuestionType } from '@common/enums/question-type';

@Injectable({
    providedIn: 'root',
})
export class QuestionService implements OnDestroy {
    questionsObservable: Observable<Question[]>;
    private questionSubscription: Subscription;

    private unfilteredQuestions: Question[];
    private questionsSubject: BehaviorSubject<Question[]>;
    private questionfilter: (questions: Question[]) => Question[];

    constructor(private questionCommunicationService: QuestionCommunicationService) {
        this.unfilteredQuestions = [];
        this.questionsSubject = new BehaviorSubject<Question[]>([]);
        this.questionsObservable = this.questionsSubject.asObservable();

        this.questionfilter = NO_QUESTION_FILTER;

        this.questionSubscription = this.questionCommunicationService.questionsUpdatedEvent.subscribe(() => this.loadQuestions());

        this.loadQuestions();
    }

    addQuestion(addedQuestion: Question): void {
        this.questionCommunicationService.addQuestion(addedQuestion).subscribe();
    }

    deleteQuestion(questionId: string): void {
        this.questionCommunicationService.deleteQuestion(questionId).subscribe();
    }

    getQuestions(): Question[] {
        return this.questionsSubject.value;
    }

    createVoidQCMQuestion(): Question {
        return VOID_QCM_QUESTION;
    }

    createVoidQRLQuestion(): Question {
        return VOID_QRL_QUESTION;
    }

    updateQuestion(updatedQuestion: Question): void {
        const questions = this.questionsSubject.value;

        const existingQuestionIndex = questions.findIndex((question) => question.id === updatedQuestion.id);
        questions[existingQuestionIndex] = { ...questions[existingQuestionIndex], ...updatedQuestion, lastModification: new Date() };

        this.questionCommunicationService.updateQuestion(updatedQuestion).subscribe();
        this.setQuestions(questions);
    }

    addFilterByQuestionType(questionType: QuestionType) {
        this.questionfilter = (questions: Question[]) => questions.filter((question) => question.type === questionType);
        this.loadQuestions();
    }

    removeFilter() {
        this.questionfilter = NO_QUESTION_FILTER;
        this.loadQuestions();
    }

    doesQuestionTextExist(questionText: string): boolean {
        const lowerCaseQuestionText = questionText.toLowerCase();
        return this.unfilteredQuestions.some((question) => question.text.toLowerCase() === lowerCaseQuestionText);
    }

    ngOnDestroy(): void {
        this.questionSubscription.unsubscribe();
    }

    private loadQuestions(): void {
        this.questionCommunicationService.getQuestions().subscribe((questions: Question[]) => {
            this.unfilteredQuestions = questions;
            this.setQuestions(questions);
        });
    }

    private sortQuestions(questions: Question[]): void {
        questions.sort((questionA, questionB) => {
            const dateA = new Date(questionA.lastModification).getTime();
            const dateB = new Date(questionB.lastModification).getTime();
            return dateB - dateA;
        });
    }

    private setQuestions(updatedQuestions?: Question[]) {
        const filteredQuestions = this.questionfilter(updatedQuestions ?? this.questionsSubject.value);
        this.sortQuestions(filteredQuestions);
        this.sendQuestionModificationEvent(filteredQuestions);
    }

    private sendQuestionModificationEvent(questions: Question[]): void {
        this.questionsSubject.next(questions);
    }
}
