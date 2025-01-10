import { Component, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSelectionListChange } from '@angular/material/list';
import { InformationModalComponent } from '@app/components/modal/information-modal/information-modal.component';
import { RANDOM_QUIZ_ID, RANDOM_QUIZ_QUESTION_NUMBER } from '@common/config/game-config';
import { GameCreationService } from '@app/services/game-services/game-creation.service';
import { QuizService } from '@app/services/quiz-services/quiz.service';
import { GameType } from '@common/enums/game-type';
import { Quiz } from '@common/interfaces/quiz';
import { Subscription } from 'rxjs';
import { QuestionService } from '@app/services/question-services/question.service';
import { RANDOM_QUIZ } from '@app/consts/game.consts';
import { QuizValidationError } from '@app/enums/quiz-validation-error';
import { QuestionType } from '@common/enums/question-type';

@Component({
    selector: 'app-game-creation-page',
    templateUrl: './game-creation-page.component.html',
    styleUrls: ['./game-creation-page.component.scss'],
})
export class GameCreationPageComponent implements OnDestroy {
    quizzes: Quiz[] = [];
    selectedQuiz: Quiz | null = null;
    isRandomQuizSelected: boolean = false;

    readonly quizSubscription: Subscription = new Subscription();

    // Le constructeur de la classe GameCreationPageComponent nécessite plusieurs dépendances essentielles pour son fonctionnement
    // eslint-disable-next-line max-params
    constructor(
        private dialog: MatDialog,
        private quizService: QuizService,
        private gameCreationService: GameCreationService,
        private questionService: QuestionService,
    ) {
        this.updateQuizzes();
        this.quizSubscription = this.quizService.getQuizModificationObservable().subscribe(() => {
            this.handleQuizServiceEvent();
        });
    }

    currentQuizRemoved(): void {
        this.selectedQuiz = null;
        this.dialog.open(InformationModalComponent, { data: QuizValidationError.UnavailableQuiz });
    }

    onSelectionChange(event: MatSelectionListChange): void {
        if (!event.options || !event.options.length) return;

        const selectedValue = event.options[0].value;
        this.selectedQuiz = selectedValue === RANDOM_QUIZ ? null : selectedValue;
        this.isRandomQuizSelected = selectedValue === RANDOM_QUIZ;
    }

    areButtonDisabled(): boolean {
        return !this.selectedQuiz && !this.isRandomQuizSelected;
    }

    isRandomQuizAvailable(): boolean {
        return this.countQCMQuestions() >= RANDOM_QUIZ_QUESTION_NUMBER;
    }

    isQuizSelected(quiz: Quiz) {
        if (!this.selectedQuiz) return false;
        return quiz.id === this.selectedQuiz.id;
    }

    ngOnDestroy(): void {
        this.quizSubscription.unsubscribe();
    }

    createGame(gameType: GameType): void {
        if (this.selectedQuiz) this.gameCreationService.createGame(this.selectedQuiz.id, gameType);
        else if (this.isRandomQuizSelected) this.gameCreationService.createGame(RANDOM_QUIZ_ID, gameType);
    }

    private handleQuizServiceEvent(): void {
        const previouslySelectedQuiz = this.selectedQuiz;
        this.updateQuizzes();

        if (!previouslySelectedQuiz) return;

        const updatedSelectedQuiz = this.quizzes.find((quiz) => quiz.id === previouslySelectedQuiz.id);
        if (!updatedSelectedQuiz) return this.currentQuizRemoved();

        this.selectedQuiz = updatedSelectedQuiz;
    }

    private updateQuizzes(): void {
        this.quizzes = this.quizService.getAllVisibleQuiz();
    }

    private countQCMQuestions() {
        const questions = this.questionService.getQuestions();
        return questions.filter((question) => question.type === QuestionType.QCM).length;
    }
}
