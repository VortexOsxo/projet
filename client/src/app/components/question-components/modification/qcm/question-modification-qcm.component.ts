import { Component, Input, OnInit } from '@angular/core';
import { MAXIMUM_QUESTION, MINIMUM_QUESTION, NEW_ANSWER } from '@app/consts/question.consts';
import { InputValidity } from '@app/interfaces/input-validity';
import { ArrayHelperService } from '@app/services/array-helper.service';
import { QuestionValidationService } from '@app/services/question-services/question-validation.service';
import { QuestionService } from '@app/services/question-services/question.service';
import { Choice } from '@common/interfaces/choice';
import { Question } from '@common/interfaces/question';
import { QuestionModificationBase } from '@app/components/question-components/modification/base/question-modification-base';

@Component({
    selector: 'app-question-modification-qcm',
    templateUrl: './question-modification-qcm.component.html',
    styleUrls: ['./question-modification-qcm.component.scss'],
})
export class QuestionModificationQCMComponent extends QuestionModificationBase implements OnInit {
    @Input() question: Question;

    constructor(
        questionValidationService: QuestionValidationService,
        questionService: QuestionService,
        private arrayHelper: ArrayHelperService,
    ) {
        super(questionValidationService, questionService);
    }

    get responsesValidity(): InputValidity {
        return this.questionValidationService.validateResponses(this.question.choices);
    }

    ngOnInit(): void {
        this.question ??= this.questionService.createVoidQCMQuestion();
    }

    getChoiceTextValidity(choice: Choice): InputValidity {
        return this.questionValidationService.validateChoiceText(choice.text);
    }

    addChoice(): void {
        if (this.question.choices.length >= MAXIMUM_QUESTION) return;
        this.question.choices.push({ text: NEW_ANSWER, isCorrect: false });
    }

    moveChoice(index: number, step: number): void {
        this.arrayHelper.swapElement(this.question.choices, index, index + step);
    }

    deleteChoice(index: number): void {
        if (this.question.choices.length <= MINIMUM_QUESTION) return;
        this.arrayHelper.deleteElement(this.question.choices, index);
    }
}
