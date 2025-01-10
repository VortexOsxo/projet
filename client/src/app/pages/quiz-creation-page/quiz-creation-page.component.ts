import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { InformationModalComponent } from '@app/components/modal/information-modal/information-modal.component';
import { CREATE_QUIZ, MODIFY_QUIZ, VOID_QUIZ } from '@app/consts/quiz.consts';
import { InputValidity } from '@app/interfaces/input-validity';
import { ArrayHelperService } from '@app/services/array-helper.service';
import { QuestionService } from '@app/services/question-services/question.service';
import { QuizValidationService } from '@app/services/quiz-services/quiz-validation.service';
import { Question } from '@common/interfaces/question';
import { Quiz } from '@common/interfaces/quiz';

@Component({
    selector: 'app-quiz-creation-page',
    templateUrl: './quiz-creation-page.component.html',
    styleUrls: ['./quiz-creation-page.component.scss'],
})
export class QuizCreationPageComponent implements OnInit {
    title: string;
    quiz: Quiz;

    // Le constructeur de la classe QuizCreationPageComponent nécessite plusieurs dépendances essentielles pour son fonctionnement
    // eslint-disable-next-line max-params
    constructor(
        private quizValidationService: QuizValidationService,
        private questionService: QuestionService,
        private arrayHelper: ArrayHelperService,
        private dialog: MatDialog,
        private router: Router,
    ) {}

    get quizDurationValidity(): InputValidity {
        return this.quizValidationService.validateAnswerTime(this.quiz.duration);
    }

    get nameValidity(): InputValidity {
        return this.quizValidationService.validateQuizName(this.quiz.title, this.quiz.id);
    }

    get quizDescriptioneValidity(): InputValidity {
        return this.quizValidationService.validateQuizDescription(this.quiz.description);
    }

    ngOnInit(): void {
        this.initializeQuiz();
    }

    addQuestionsToQuiz(selectedQuestions: Question[]): void {
        selectedQuestions.forEach((questionToAdd) => {
            if (this.quiz.questions.find((question) => question.id === questionToAdd.id)) return;
            this.quiz.questions.push(questionToAdd);
        });
    }

    addQCMQuestion(): void {
        const newQuestion = this.copyObject(this.questionService.createVoidQCMQuestion());
        this.quiz.questions.push(newQuestion);
    }

    addQRLQuestion(): void {
        const newQRLQuestion: Question = this.copyObject(this.questionService.createVoidQRLQuestion());
        this.quiz.questions.push(newQRLQuestion);
    }

    moveQuestion(index: number, step: number): void {
        this.arrayHelper.swapElement(this.quiz.questions, index, index + step);
    }

    deleteQuestion(index: number): void {
        this.arrayHelper.deleteElement(this.quiz.questions, index);
    }

    submitQuiz(): void {
        this.quiz.lastModification = new Date();
        const isQuizValid = this.quizValidationService.attemptSubmit(this.quiz);

        if (isQuizValid.isValid) {
            this.router.navigate(['/admin']);
            return;
        }

        this.dialog.open(InformationModalComponent, {
            data: isQuizValid.errorMessage,
        });
    }

    private initializeQuiz(): void {
        const quizFromValidation = this.quizValidationService.getQuizToModify();
        if (quizFromValidation) {
            this.title = MODIFY_QUIZ;
            this.initializeExistingQuiz(quizFromValidation);
        } else {
            this.title = CREATE_QUIZ;
            this.initializeNewQuiz();
        }
    }

    private initializeExistingQuiz(quizFromValidation: Quiz): void {
        this.quiz = this.copyObject(quizFromValidation);
        this.quiz.lastModification = new Date(this.quiz.lastModification);
    }

    private initializeNewQuiz(): void {
        this.quiz = this.copyObject(VOID_QUIZ);
        this.addQCMQuestion();
    }

    private copyObject<ObjectType>(objectToCopy: ObjectType) {
        return JSON.parse(JSON.stringify(objectToCopy));
    }
}
