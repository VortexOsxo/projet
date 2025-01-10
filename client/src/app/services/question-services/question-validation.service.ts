import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { InformationModalComponent } from '@app/components/modal/information-modal/information-modal.component';
import { MAXIMUM_POINT, MINIMUM_POINT, POINT_MULTIPLE } from '@app/consts/question.consts';
import { QuestionType } from '@common/enums/question-type';
import { Choice } from '@common/interfaces/choice';
import { Question } from '@common/interfaces/question';
import { QuestionService } from './question.service';
import { InputValidity } from '@app/interfaces/input-validity';
import { ValidationBaseService } from '@app/services/validation-services/validation-base.service';
import { EMPTY_ID } from '@app/consts/game.consts';
import { GameMessage } from '@app/enums/game-message';
import { QuestionValidationError } from '@app/enums/question-validation-error';

@Injectable({
    providedIn: 'root',
})
export class QuestionValidationService extends ValidationBaseService {
    constructor(
        private questionService: QuestionService,
        private dialog: MatDialog,
    ) {
        super();
    }

    validateQuestionPoints(points: number): InputValidity {
        if (points < MINIMUM_POINT || points > MAXIMUM_POINT) return this.createInvalidInputValidity(QuestionValidationError.PointsRange);
        if (points % POINT_MULTIPLE) return this.createInvalidInputValidity(QuestionValidationError.PointsMultiple);

        return this.createValidInputValidity();
    }

    validateName(name: string): InputValidity {
        return this.validateText(name, GameMessage.EmptyField);
    }

    validateChoiceText(choiceText: string): InputValidity {
        return this.validateText(choiceText, QuestionValidationError.ChoiceTextEmpty);
    }

    validateResponses(choices: Choice[]): InputValidity {
        const correctChoices = choices.filter((choice) => choice.isCorrect);
        const incorrectChoices = choices.filter((choice) => !choice.isCorrect);

        if (!correctChoices.length || !incorrectChoices.length)
            return this.createInvalidInputValidity(QuestionValidationError.AtLeastOneCorrectIncorrect);

        return this.createValidInputValidity();
    }

    validateQuestion(question: Question): boolean {
        let isQuestionValid = this.validateName(question.text).isValid;
        isQuestionValid &&= this.validateQuestionPoints(question.points).isValid;
        isQuestionValid &&= question.type !== QuestionType.QCM || this.validateQuestionChoices(question.choices);
        return isQuestionValid;
    }

    attemptQuestionSubmit(question: Question): boolean {
        if (!this.validateQuestion(question)) {
            this.openInformationModal(QuestionValidationError.ErrorsRemaining);
            return false;
        }

        if (question.id !== EMPTY_ID) {
            this.questionService.updateQuestion(question);
            return true;
        }

        if (this.questionService.doesQuestionTextExist(question.text)) {
            this.openInformationModal(QuestionValidationError.DuplicateQuestionTitle);
            return false;
        }

        this.questionService.addQuestion(question);
        return true;
    }
    private openInformationModal(text: string): void {
        this.dialog.open(InformationModalComponent, { data: text });
    }

    private validateQuestionChoices(choices: Choice[]) {
        return choices.every((choice) => this.validateChoiceText(choice.text).isValid) && this.validateResponses(choices).isValid;
    }
}
