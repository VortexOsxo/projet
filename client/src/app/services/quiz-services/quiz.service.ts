import { Injectable, OnDestroy } from '@angular/core';
import { Subject, Subscription, Observable } from 'rxjs';
import { Quiz } from '@common/interfaces/quiz';
import { QuizCommunicationService } from './quiz-communication.service';

@Injectable({
    providedIn: 'root',
})
export class QuizService implements OnDestroy {
    private quizzes: Quiz[] = [];
    private quizModificationSubject = new Subject<void>();
    private quizSubscription: Subscription;

    constructor(private readonly quizCommunicationService: QuizCommunicationService) {
        this.quizSubscription = this.quizCommunicationService.quizModifiedEvent.subscribe(() => {
            this.loadQuizzes();
        });

        this.loadQuizzes();
    }

    addQuiz(addedQuiz: Quiz): void {
        this.quizCommunicationService.addQuiz(addedQuiz).subscribe();
    }

    removeQuiz(quizId: string): void {
        if (!this.findQuizById(quizId)) return;
        this.quizCommunicationService.removeQuiz(quizId).subscribe();
    }

    toggleVisibility(quizId: string): void {
        const quizToModify = this.findQuizById(quizId);
        if (!quizToModify) return;

        quizToModify.isVisible = !quizToModify.isVisible;
        this.quizCommunicationService.updateQuiz(quizToModify).subscribe();
    }

    getQuizModificationObservable(): Observable<void> {
        return this.quizModificationSubject.asObservable();
    }

    getAllQuiz(): Quiz[] {
        return this.quizzes;
    }

    getAllVisibleQuiz(): Quiz[] {
        return this.quizzes.filter((quiz) => quiz.isVisible);
    }

    ngOnDestroy(): void {
        this.quizSubscription.unsubscribe();
    }

    private findQuizById(id: string) {
        return this.quizzes.find((quiz) => quiz.id === id);
    }

    private loadQuizzes(): void {
        this.quizCommunicationService.getQuizzes().subscribe((quizzes: Quiz[]) => {
            this.quizzes = quizzes;
            this.sendQuizModificationEvent();
        });
    }

    private sendQuizModificationEvent(): void {
        this.quizModificationSubject.next();
    }
}
