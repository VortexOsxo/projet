import { Injectable } from '@angular/core';
import { InputValidity } from '@app/interfaces/input-validity';
import { Quiz } from '@common/interfaces/quiz';
import { QuestionValidationService } from '@app/services/question-services/question-validation.service';
import { QuizService } from './quiz.service';
import { MAXIMUM_QUESTION_TIME, MINIMUM_QUESTION_TIME } from '@app/consts/quiz.consts';
import { ValidationBaseService } from '@app/services/validation-services/validation-base.service';
import { QuizValidationError } from '@app/enums/quiz-validation-error';

@Injectable({
    providedIn: 'root',
})
export class QuizValidationService extends ValidationBaseService {
    private quizToModify: Quiz | null;

    constructor(
        private questionValidator: QuestionValidationService,
        private quizService: QuizService,
    ) {
        super();
    }

    setQuizToModify(quiz: Quiz): void {
        this.quizToModify = quiz;
    }

    getQuizToModify(): Quiz | null {
        return this.quizToModify;
    }

    validateAnswerTime(answerTime: number): InputValidity {
        if (answerTime < MINIMUM_QUESTION_TIME || answerTime > MAXIMUM_QUESTION_TIME)
            return this.createInvalidInputValidity(QuizValidationError.InvalidDuration);

        return this.createValidInputValidity();
    }

    validateQuizName(name: string, quizTestedId: string): InputValidity {
        const quizWithSameName = this.quizService.getAllQuiz().find((quiz) => quiz.title.trim().toLowerCase() === name.trim().toLowerCase());

        if (quizWithSameName && quizTestedId !== quizWithSameName.id)
            return this.createInvalidInputValidity(QuizValidationError.QuizNameAlreadyExists);
        return this.validateText(name, QuizValidationError.QuizNameEmpty);
    }

    validateQuizDescription(description: string): InputValidity {
        return this.validateText(description, QuizValidationError.QuizDescriptionEmpty);
    }

    validateQuiz(quiz: Quiz): InputValidity {
        let isQuizValid = this.createValidInputValidity();

        isQuizValid = this.modifyInputValidity(isQuizValid, this.validateQuizName(quiz.title, quiz.id));
        isQuizValid = this.modifyInputValidity(isQuizValid, this.validateAnswerTime(quiz.duration));
        isQuizValid = this.modifyInputValidity(isQuizValid, this.validateQuizDescription(quiz.description));

        if (!this.validateQuestions(quiz, isQuizValid))
            isQuizValid = this.modifyInputValidity(isQuizValid, this.createInvalidInputValidity(QuizValidationError.QuizInvalidQuestions));

        return isQuizValid;
    }

    attemptSubmit(quiz: Quiz): InputValidity {
        const quizValidity = this.validateQuiz(quiz);

        if (!quizValidity.isValid) return quizValidity;

        this.quizService.addQuiz(quiz);
        this.quizToModify = null;
        return quizValidity;
    }

    private validateQuestions(quiz: Quiz, isQuizValid: InputValidity): boolean {
        if (quiz.questions.length) return quiz.questions.every((question) => this.questionValidator.validateQuestion(question));

        isQuizValid.errorMessage += QuizValidationError.NeedAtLeastOneQuestion;
        isQuizValid.isValid = false;
        return false;
    }
}
