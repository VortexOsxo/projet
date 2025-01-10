import { Directive } from '@angular/core';
import { InputValidity } from '@app/interfaces/input-validity';
import { QuestionValidationService } from '@app/services/question-services/question-validation.service';
import { QuestionService } from '@app/services/question-services/question.service';
import { Question } from '@common/interfaces/question';

@Directive()
export abstract class QuestionModificationBase {
    showMessage: boolean = false;
    abstract question: Question;

    constructor(
        protected questionValidationService: QuestionValidationService,
        protected questionService: QuestionService,
    ) {}

    get questionPointsValidity(): InputValidity {
        return this.questionValidationService.validateQuestionPoints(this.question.points);
    }

    get nameValidity(): InputValidity {
        return this.questionValidationService.validateName(this.question.text);
    }

    addToQuestionBank(): void {
        this.question.lastModification = new Date();
        const submissionSuccess = this.questionValidationService.attemptQuestionSubmit(this.question);
        this.showMessage = submissionSuccess;
    }
}
